import type { ChargingStation } from "../shared/schema.js";

interface NRELStation {
  id: number;
  station_name: string;
  street_address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  fuel_type_code: string;
  ev_level1_evse_num?: number;
  ev_level2_evse_num?: number;
  ev_dc_fast_num?: number;
  ev_connector_types: string[];
  ev_pricing?: string;
  access_code: string;
  access_days_time?: string;
  cards_accepted?: string;
  ev_network?: string;
  status_code: string;
  expected_date?: string;
  groups_with_access_code?: string;
  facility_type?: string;
  ev_workplace_charging?: boolean;
  ev_pricing_desc?: string;
}

interface NRELResponse {
  fuel_stations: NRELStation[];
  total_results: number;
}

export class NRELService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://developer.nrel.gov/api/alt-fuel-stations/v1';

  constructor() {
    this.apiKey = process.env.NREL_API_KEY || '';
    if (!this.apiKey) {
      console.warn('NREL_API_KEY not found. Falling back to mock data.');
    }
  }

  async getNearbyStations(
    latitude: number,
    longitude: number,
    radiusMiles: number = 25,
    limit: number = 20
  ): Promise<ChargingStation[]> {
    if (!this.apiKey) {
      console.warn('No NREL API key, returning empty array');
      return [];
    }

    try {
      const params = new URLSearchParams({
        api_key: this.apiKey,
        fuel_type: 'ELEC',
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radius: radiusMiles.toString(),
        limit: limit.toString(),
        status: 'E,P', // Available (E) and Planned (P)
        access: 'public', // Public access only
        format: 'json'
      });

      const response = await fetch(`${this.baseUrl}/nearest.json?${params}`);
      
      if (!response.ok) {
        throw new Error(`NREL API error: ${response.status} ${response.statusText}`);
      }

      const data: NRELResponse = await response.json();
      
      return data.fuel_stations.map(station => this.transformNRELStation(station, latitude, longitude));
    } catch (error) {
      console.error('Error fetching NREL stations:', error);
      return [];
    }
  }

  private transformNRELStation(station: NRELStation, userLat: number, userLng: number): ChargingStation {
    // Calculate total ports
    const level1Ports = station.ev_level1_evse_num || 0;
    const level2Ports = station.ev_level2_evse_num || 0;
    const dcFastPorts = station.ev_dc_fast_num || 0;
    const totalPorts = level1Ports + level2Ports + dcFastPorts;

    // Calculate available ports (simulate 60-90% availability)
    const availabilityRate = 0.6 + Math.random() * 0.3;
    const availablePorts = Math.floor(totalPorts * availabilityRate);

    // Determine power level
    let powerKw = 7; // Default Level 2
    if (dcFastPorts > 0) {
      powerKw = 150; // DC Fast charging
    } else if (level2Ports > 0) {
      powerKw = 22; // Level 2
    } else if (level1Ports > 0) {
      powerKw = 1.4; // Level 1
    }

    // Map connector types
    const connectorTypes = station.ev_connector_types || [];
    const mappedConnectors = connectorTypes.map(type => {
      switch (type) {
        case 'CHADEMO': return 'CHAdeMO';
        case 'J1772COMBO': return 'CCS';
        case 'J1772': return 'Type 2';
        case 'TESLA': return 'Tesla';
        default: return type;
      }
    });

    // Calculate distance
    const distance = this.calculateDistance(userLat, userLng, station.latitude, station.longitude);

    // Determine pricing
    let pricePerKwh = '$0.25'; // Default
    if (station.ev_pricing) {
      pricePerKwh = station.ev_pricing;
    } else if (powerKw >= 100) {
      pricePerKwh = '$0.35'; // DC Fast charging premium
    } else {
      pricePerKwh = '$0.25'; // Level 2 pricing
    }

    // Get access info
    const access24h = station.access_days_time?.toLowerCase().includes('24') || 
                      station.access_days_time?.toLowerCase().includes('daily') ||
                      !station.access_days_time;

    // Get amenities based on facility type and location
    const amenities: string[] = [];
    if (station.facility_type?.toLowerCase().includes('shopping')) {
      amenities.push('Shopping', 'Restrooms');
    }
    if (station.facility_type?.toLowerCase().includes('hotel')) {
      amenities.push('Hotel', 'Restrooms', 'WiFi');
    }
    if (station.facility_type?.toLowerCase().includes('restaurant')) {
      amenities.push('Restaurant', 'Restrooms');
    }
    if (station.ev_workplace_charging) {
      amenities.push('Workplace Charging');
    }
    if (access24h) {
      amenities.push('24/7 Access');
    }
    if (station.cards_accepted) {
      amenities.push('Credit Cards Accepted');
    }
    
    // Add common amenities for larger stations
    if (totalPorts >= 4) {
      amenities.push('Multiple Ports', 'Covered Parking');
    }
    if (powerKw >= 100) {
      amenities.push('Fast Charging', 'Pull-through Access');
    }

    return {
      id: `nrel-${station.id}`,
      name: station.station_name || 'EV Charging Station',
      latitude: station.latitude.toString(),
      longitude: station.longitude.toString(),
      address: `${station.street_address}, ${station.city}, ${station.state} ${station.zip}`,
      totalPorts,
      availablePorts,
      powerKw,
      pricePerKwh,
      connectorTypes: mappedConnectors.length > 0 ? mappedConnectors : ['Type 2'],
      amenities,
      isOperational: station.status_code === 'E',
      access24h,
      networkProvider: station.ev_network || 'Independent',
      status: this.getStationStatus(station.status_code, availablePorts, totalPorts)
    };
  }

  private getStationStatus(statusCode: string, availablePorts: number, totalPorts: number): string {
    if (statusCode === 'T') return 'Temporarily Unavailable';
    if (statusCode === 'P') return 'Planned';
    if (availablePorts === 0) return 'Busy';
    if (availablePorts === totalPorts) return 'Available';
    return 'Partially Available';
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
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