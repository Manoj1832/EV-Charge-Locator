export interface StationWithDistance {
  id: string;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  totalPorts: number;
  availablePorts: number;
  powerKw: number;
  pricePerKwh: string;
  connectorTypes: string[];
  amenities: string[];
  isOperational: boolean;
  access24h: boolean;
  networkProvider: string;
  status: string;
  distance?: number;
  eta?: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface SearchFilters {
  query: string;
  distance: number;
  connectorType: string;
  showAvailableOnly: boolean;
  showFastChargingOnly: boolean;
  show24hOnly: boolean;
  showFreeParkingOnly: boolean;
}
