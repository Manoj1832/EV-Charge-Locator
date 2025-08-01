import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  batteryLevel: integer("battery_level").notNull(),
  batteryCapacity: integer("battery_capacity").notNull().default(100),
  range: integer("range").notNull(),
  location: text("location").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  isConnected: boolean("is_connected").notNull().default(true),
  lastUpdated: timestamp("last_updated").notNull().default(sql`now()`),
});

export const chargingStations = pgTable("charging_stations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  totalPorts: integer("total_ports").notNull(),
  availablePorts: integer("available_ports").notNull(),
  powerKw: integer("power_kw").notNull(),
  pricePerKwh: decimal("price_per_kwh", { precision: 5, scale: 3 }).notNull(),
  connectorTypes: text("connector_types").array().notNull(),
  amenities: text("amenities").array().notNull(),
  isOperational: boolean("is_operational").notNull().default(true),
  access24h: boolean("access_24h").notNull().default(true),
  networkProvider: text("network_provider").notNull(),
  status: text("status").notNull().default("available"), // available, busy, full, offline
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  lastUpdated: true,
});

export const insertChargingStationSchema = createInsertSchema(chargingStations).omit({
  id: true,
});

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertChargingStation = z.infer<typeof insertChargingStationSchema>;
export type ChargingStation = typeof chargingStations.$inferSelect;
