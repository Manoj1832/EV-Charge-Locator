import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertVehicleSchema, insertChargingStationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Vehicle routes
  app.get("/api/vehicle/current", async (req, res) => {
    try {
      const vehicle = await storage.getCurrentVehicle();
      if (!vehicle) {
        return res.status(404).json({ message: "No vehicle found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: "Failed to get vehicle data" });
    }
  });

  app.patch("/api/vehicle/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertVehicleSchema.partial().parse(req.body);
      const vehicle = await storage.updateVehicle(id, updates);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(400).json({ message: "Invalid vehicle data" });
    }
  });

  // Charging station routes
  app.get("/api/stations", async (req, res) => {
    try {
      const { lat, lng, radius } = req.query;
      
      if (lat && lng) {
        const latitude = parseFloat(lat as string);
        const longitude = parseFloat(lng as string);
        const radiusMiles = radius ? parseFloat(radius as string) : 50;
        
        const stations = await storage.getNearbyChargingStations(latitude, longitude, radiusMiles);
        res.json(stations);
      } else {
        const stations = await storage.getChargingStations();
        res.json(stations);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to get charging stations" });
    }
  });

  app.get("/api/stations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const station = await storage.getChargingStation(id);
      if (!station) {
        return res.status(404).json({ message: "Charging station not found" });
      }
      res.json(station);
    } catch (error) {
      res.status(500).json({ message: "Failed to get charging station" });
    }
  });

  app.patch("/api/stations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertChargingStationSchema.partial().parse(req.body);
      const station = await storage.updateChargingStation(id, updates);
      if (!station) {
        return res.status(404).json({ message: "Charging station not found" });
      }
      res.json(station);
    } catch (error) {
      res.status(400).json({ message: "Invalid station data" });
    }
  });

  // Simulate real-time battery updates (for demonstration)
  app.post("/api/vehicle/simulate-battery", async (req, res) => {
    try {
      const { batteryLevel } = req.body;
      const currentVehicle = await storage.getCurrentVehicle();
      if (!currentVehicle) {
        return res.status(404).json({ message: "No vehicle found" });
      }
      
      // Calculate range based on battery level (simplified calculation)
      const range = Math.round((batteryLevel / 100) * 250); // Assume 250 mile max range
      
      const updatedVehicle = await storage.updateVehicle(currentVehicle.id, {
        batteryLevel,
        range,
      });
      
      res.json(updatedVehicle);
    } catch (error) {
      res.status(400).json({ message: "Failed to update battery level" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
