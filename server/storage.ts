import { type Vehicle, type InsertVehicle, type ChargingStation, type InsertChargingStation } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Vehicle methods
  getVehicle(id: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, updates: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  getCurrentVehicle(): Promise<Vehicle | undefined>;
  
  // Charging station methods
  getChargingStations(): Promise<ChargingStation[]>;
  getChargingStation(id: string): Promise<ChargingStation | undefined>;
  getNearbyChargingStations(lat: number, lng: number, radiusMiles?: number): Promise<ChargingStation[]>;
  createChargingStation(station: InsertChargingStation): Promise<ChargingStation>;
  updateChargingStation(id: string, updates: Partial<InsertChargingStation>): Promise<ChargingStation | undefined>;
}

export class MemStorage implements IStorage {
  private vehicles: Map<string, Vehicle>;
  private chargingStations: Map<string, ChargingStation>;

  constructor() {
    this.vehicles = new Map();
    this.chargingStations = new Map();
    this.initializeData();
  }

  private initializeData() {
    // Initialize with a default vehicle
    const defaultVehicle: Vehicle = {
      id: "default-vehicle",
      name: "Tesla Model Y",
      batteryLevel: 25,
      batteryCapacity: 100,
      range: 47,
      location: "Downtown Seattle",
      latitude: "47.6062",
      longitude: "-122.3321",
      isConnected: true,
      lastUpdated: new Date(),
    };
    this.vehicles.set(defaultVehicle.id, defaultVehicle);

    // Initialize with sample charging stations around Seattle
    const stations: ChargingStation[] = [
      {
        id: "station-1",
        name: "Tesla Supercharger",
        address: "1234 Pine Street, Seattle, WA 98101",
        latitude: "47.6118",
        longitude: "-122.3236",
        totalPorts: 8,
        availablePorts: 6,
        powerKw: 150,
        pricePerKwh: "0.420",
        connectorTypes: ["Tesla", "CCS"],
        amenities: ["24/7 Access", "Covered Parking", "Restrooms", "WiFi Available"],
        isOperational: true,
        access24h: true,
        networkProvider: "Tesla",
        status: "available",
      },
      {
        id: "station-2",
        name: "EVgo Fast Charging",
        address: "567 2nd Avenue, Seattle, WA 98104",
        latitude: "47.6042",
        longitude: "-122.3310",
        totalPorts: 4,
        availablePorts: 1,
        powerKw: 100,
        pricePerKwh: "0.350",
        connectorTypes: ["CCS", "CHAdeMO"],
        amenities: ["24/7 Access", "Restrooms"],
        isOperational: true,
        access24h: true,
        networkProvider: "EVgo",
        status: "busy",
      },
      {
        id: "station-3",
        name: "ChargePoint Network",
        address: "890 Union Street, Seattle, WA 98101",
        latitude: "47.6097",
        longitude: "-122.3331",
        totalPorts: 6,
        availablePorts: 0,
        powerKw: 50,
        pricePerKwh: "0.280",
        connectorTypes: ["Type 2", "CCS"],
        amenities: ["Covered Parking", "WiFi Available"],
        isOperational: true,
        access24h: false,
        networkProvider: "ChargePoint",
        status: "full",
      },
      {
        id: "station-4",
        name: "Electrify America",
        address: "1010 3rd Avenue, Seattle, WA 98154",
        latitude: "47.5999",
        longitude: "-122.3284",
        totalPorts: 6,
        availablePorts: 4,
        powerKw: 350,
        pricePerKwh: "0.480",
        connectorTypes: ["CCS", "CHAdeMO"],
        amenities: ["24/7 Access", "Covered Parking", "Restrooms", "WiFi Available"],
        isOperational: true,
        access24h: true,
        networkProvider: "Electrify America",
        status: "available",
      },
    ];

    stations.forEach(station => {
      this.chargingStations.set(station.id, station);
    });
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = randomUUID();
    const vehicle: Vehicle = { 
      ...insertVehicle, 
      id,
      lastUpdated: new Date(),
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async updateVehicle(id: string, updates: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;
    
    const updatedVehicle: Vehicle = { 
      ...vehicle, 
      ...updates,
      lastUpdated: new Date(),
    };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  async getCurrentVehicle(): Promise<Vehicle | undefined> {
    return this.vehicles.get("default-vehicle");
  }

  async getChargingStations(): Promise<ChargingStation[]> {
    return Array.from(this.chargingStations.values());
  }

  async getChargingStation(id: string): Promise<ChargingStation | undefined> {
    return this.chargingStations.get(id);
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async getNearbyChargingStations(lat: number, lng: number, radiusMiles: number = 50): Promise<ChargingStation[]> {
    const stations = Array.from(this.chargingStations.values());
    return stations
      .map(station => ({
        ...station,
        distance: this.calculateDistance(lat, lng, parseFloat(station.latitude), parseFloat(station.longitude))
      }))
      .filter(station => station.distance <= radiusMiles)
      .sort((a, b) => a.distance - b.distance)
      .map(({ distance, ...station }) => station);
  }

  async createChargingStation(insertStation: InsertChargingStation): Promise<ChargingStation> {
    const id = randomUUID();
    const station: ChargingStation = { ...insertStation, id };
    this.chargingStations.set(id, station);
    return station;
  }

  async updateChargingStation(id: string, updates: Partial<InsertChargingStation>): Promise<ChargingStation | undefined> {
    const station = this.chargingStations.get(id);
    if (!station) return undefined;
    
    const updatedStation: ChargingStation = { ...station, ...updates };
    this.chargingStations.set(id, updatedStation);
    return updatedStation;
  }
}

export const storage = new MemStorage();
