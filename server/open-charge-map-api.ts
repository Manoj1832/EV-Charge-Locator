import type { ChargingStation } from "../shared/schema.js";

interface OCMStation {
  ID: number;
  UUID: string;
  DataProvider: {
    Title: string;
  };
  OperatorInfo?: {
    Title: string;
  };
  AddressInfo: {
    Title: string;
    AddressLine1?: string;
    AddressLine2?: string;
    Town: string;
    StateOrProvince?: string;
    Postcode?: string;
    CountryID: number;
    Country: {
      Title: string;
    };
    Latitude: number;
    Longitude: number;
    Distance?: number;
  };
  Connections: Array<{
    ID: number;
    ConnectionTypeID: number;
    ConnectionType: {
      Title: string;
    };
    PowerKW?: number;
    Amps?: number;
    Voltage?: number;
    Quantity?: number;
  }>;
  NumberOfPoints?: number;
  StatusType?: {
    Title: string;
    IsOperational: boolean;
  };
  DateLastStatusUpdate?: string;
  UsageType?: {
    Title: string;
    IsPayAtLocation: boolean;
    IsMembershipRequired: boolean;
  };
  DateCreated: string;
  IsRecentlyVerified: boolean;
  DateLastVerified?: string;
}

export class OpenChargeMapService {
  private readonly baseUrl = 'https://api.openchargemap.io/v3/poi';

  async getNearbyStations(
    latitude: number,
    longitude: number,
    radiusKm: number = 25,
    limit: number = 20
  ): Promise<ChargingStation[]> {
    try {
      const params = new URLSearchParams({
        output: 'json',
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        distance: radiusKm.toString(),
        distanceunit: 'km',
        maxresults: limit.toString(),
        compact: 'false',
        includecomments: 'false',
        verbose: 'false'
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Open Charge Map API error: ${response.status} ${response.statusText}`);
      }

      const data: OCMStation[] = await response.json();
      
      return data.map(station => this.transformOCMStation(station, latitude, longitude));
    } catch (error) {
      console.error('Error fetching Open Charge Map stations:', error);
      return [];
    }
  }

  private transformOCMStation(station: OCMStation, userLat: number, userLng: number): ChargingStation {
    const address = this.buildAddress(station.AddressInfo);
    
    // Calculate total ports from connections
    const totalPorts = station.Connections.reduce((sum, conn) => sum + (conn.Quantity || 1), 0) || 
                       station.NumberOfPoints || 1;

    // Simulate availability (70-95% for operational stations)
    const isOperational = station.StatusType?.IsOperational !== false;
    const availabilityRate = isOperational ? 0.7 + Math.random() * 0.25 : 0;
    const availablePorts = Math.floor(totalPorts * availabilityRate);

    // Determine power level from connections
    const maxPower = station.Connections.reduce((max, conn) => 
      Math.max(max, conn.PowerKW || this.estimatePowerFromConnection(conn)), 0
    );
    const powerKw = maxPower || 22; // Default to 22kW if no power info

    // Map connector types
    const connectorTypes = station.Connections.map(conn => 
      this.mapConnectorType(conn.ConnectionType.Title)
    ).filter((type, index, self) => self.indexOf(type) === index); // Remove duplicates

    // Calculate distance if not provided
    const distance = station.AddressInfo.Distance || 
                    this.calculateDistance(userLat, userLng, station.AddressInfo.Latitude, station.AddressInfo.Longitude);

    // Determine pricing based on usage type and location
    const pricePerKwh = this.estimatePrice(station.UsageType, powerKw, station.AddressInfo.Country.Title);

    // Generate amenities based on station info
    const amenities = this.generateAmenities(station);

    // Determine access
    const access24h = !station.UsageType?.IsMembershipRequired && 
                      station.StatusType?.IsOperational !== false;

    return {
      id: `ocm-${station.ID}`,
      name: station.AddressInfo.Title || `${station.OperatorInfo?.Title || 'EV'} Charging Station`,
      latitude: station.AddressInfo.Latitude.toString(),
      longitude: station.AddressInfo.Longitude.toString(),
      address,
      totalPorts,
      availablePorts,
      powerKw,
      pricePerKwh,
      connectorTypes: connectorTypes.length > 0 ? connectorTypes : ['Type 2'],
      amenities,
      isOperational,
      access24h,
      networkProvider: station.OperatorInfo?.Title || station.DataProvider?.Title || 'Independent',
      status: this.getStationStatus(isOperational, availablePorts, totalPorts)
    };
  }

  private buildAddress(addressInfo: OCMStation['AddressInfo']): string {
    const parts = [
      addressInfo.AddressLine1,
      addressInfo.AddressLine2,
      addressInfo.Town,
      addressInfo.StateOrProvince,
      addressInfo.Postcode,
      addressInfo.Country.Title
    ].filter(Boolean);
    
    return parts.join(', ');
  }

  private mapConnectorType(ocmType: string): string {
    const typeMap: { [key: string]: string } = {
      'Type 1 (J1772)': 'Type 1',
      'Type 2 (Socket Only)': 'Type 2',
      'Type 2 (Tethered Connector)': 'Type 2',
      'CHAdeMO': 'CHAdeMO',
      'CCS (Type 1)': 'CCS',
      'CCS (Type 2)': 'CCS',
      'Tesla (Roadster)': 'Tesla',
      'Tesla Supercharger': 'Tesla',
      'Tesla Model S': 'Tesla',
      'Tesla Destination': 'Tesla',
      'CEE Blue (Camping)': 'CEE',
      'CEE Red (3-phase)': 'CEE',
      'Schuko (EU Domestic)': 'Schuko',
      'Type 3': 'Type 3',
      'IEC 62196-3 Configuration AA': 'CCS',
      'IEC 62196-3 Configuration BB': 'CCS'
    };

    return typeMap[ocmType] || ocmType;
  }

  private estimatePowerFromConnection(connection: OCMStation['Connections'][0]): number {
    if (connection.PowerKW) return connection.PowerKW;
    
    // Estimate based on voltage and amperage
    if (connection.Voltage && connection.Amps) {
      const power = (connection.Voltage * connection.Amps) / 1000;
      return Math.round(power);
    }

    // Default estimates based on connector type
    const type = connection.ConnectionType.Title.toLowerCase();
    if (type.includes('chademo') || type.includes('ccs')) return 50;
    if (type.includes('tesla') && type.includes('supercharger')) return 150;
    if (type.includes('type 2')) return 22;
    if (type.includes('type 1')) return 7;
    
    return 7; // Default AC charging
  }

  private estimatePrice(usageType: OCMStation['UsageType'], powerKw: number, country: string): string {
    // Free charging indicators
    if (usageType?.Title?.toLowerCase().includes('free') ||
        usageType?.IsPayAtLocation === false) {
      return 'Free';
    }

    // Country-based pricing estimates (in local currency per kWh)
    const countryPricing: { [key: string]: { currency: string; rate: number } } = {
      'United States': { currency: '$', rate: powerKw > 50 ? 0.35 : 0.25 },
      'Canada': { currency: 'CAD$', rate: powerKw > 50 ? 0.45 : 0.30 },
      'United Kingdom': { currency: '£', rate: powerKw > 50 ? 0.45 : 0.35 },
      'Germany': { currency: '€', rate: powerKw > 50 ? 0.55 : 0.40 },
      'France': { currency: '€', rate: powerKw > 50 ? 0.50 : 0.35 },
      'Netherlands': { currency: '€', rate: powerKw > 50 ? 0.65 : 0.45 },
      'Norway': { currency: 'NOK', rate: powerKw > 50 ? 3.5 : 2.5 },
      'Sweden': { currency: 'SEK', rate: powerKw > 50 ? 4.5 : 3.0 },
      'India': { currency: '₹', rate: powerKw > 50 ? 12 : 8 },
      'China': { currency: '¥', rate: powerKw > 50 ? 1.8 : 1.2 },
      'Japan': { currency: '¥', rate: powerKw > 50 ? 35 : 25 },
      'Australia': { currency: 'AUD$', rate: powerKw > 50 ? 0.55 : 0.40 },
    };

    const pricing = countryPricing[country] || { currency: '$', rate: powerKw > 50 ? 0.35 : 0.25 };
    return `${pricing.currency}${pricing.rate.toFixed(2)}`;
  }

  private generateAmenities(station: OCMStation): string[] {
    const amenities: string[] = [];

    if (station.StatusType?.IsOperational !== false) {
      amenities.push('Operational');
    }

    if (station.IsRecentlyVerified) {
      amenities.push('Recently Verified');
    }

    if (!station.UsageType?.IsMembershipRequired) {
      amenities.push('Public Access');
    }

    if (station.UsageType?.IsPayAtLocation === false) {
      amenities.push('Free Charging');
    }

    // Add common amenities based on location type
    const locationName = station.AddressInfo.Title?.toLowerCase() || '';
    if (locationName.includes('hotel') || locationName.includes('inn')) {
      amenities.push('Hotel', 'Restrooms', 'WiFi');
    }
    if (locationName.includes('shopping') || locationName.includes('mall')) {
      amenities.push('Shopping', 'Restrooms', 'Food Court');
    }
    if (locationName.includes('restaurant') || locationName.includes('cafe')) {
      amenities.push('Restaurant', 'Restrooms');
    }
    if (locationName.includes('hospital') || locationName.includes('medical')) {
      amenities.push('Medical Facility');
    }
    if (locationName.includes('university') || locationName.includes('school')) {
      amenities.push('Educational Facility');
    }

    // Add power-based amenities
    const maxPower = station.Connections.reduce((max, conn) => 
      Math.max(max, conn.PowerKW || 0), 0
    );
    
    if (maxPower >= 100) {
      amenities.push('Fast Charging', 'DC Fast Charging');
    } else if (maxPower >= 22) {
      amenities.push('Fast AC Charging');
    }

    if (station.NumberOfPoints && station.NumberOfPoints > 2) {
      amenities.push('Multiple Ports');
    }

    return amenities;
  }

  private getStationStatus(isOperational: boolean, availablePorts: number, totalPorts: number): string {
    if (!isOperational) return 'Out of Service';
    if (availablePorts === 0) return 'Busy';
    if (availablePorts === totalPorts) return 'Available';
    return 'Partially Available';
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}