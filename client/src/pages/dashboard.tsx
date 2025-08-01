import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AlertCircle, Zap, TrendingUp, TrendingDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/header";
import BatteryStatus from "@/components/battery-status";
import SearchFiltersComponent from "@/components/search-filters";
import ChargingMap from "@/components/charging-map";
import StationList from "@/components/station-list";
import LowBatteryModal from "@/components/low-battery-modal";
import StationDetailsModal from "@/components/station-details-modal";
import { type Vehicle, type ChargingStation } from "@shared/schema";
import { type SearchFilters, type StationWithDistance, type UserLocation } from "@/lib/types";

// Calculate distance between two points (defined at top level)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function Dashboard() {
  const { toast } = useToast();
  const [lowBatteryModalOpen, setLowBatteryModalOpen] = useState(false);
  const [stationDetailsModalOpen, setStationDetailsModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation>({ latitude: 47.6062, longitude: -122.3321 });
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    distance: 5,
    connectorType: 'all',
    showAvailableOnly: false,
    showFastChargingOnly: false,
    show24hOnly: false,
    showFreeParkingOnly: false,
  });

  // Fetch current vehicle data
  const { data: vehicle, isLoading: vehicleLoading } = useQuery<Vehicle>({
    queryKey: ['/api/vehicle/current'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch charging stations
  const { data: stations = [], isLoading: stationsLoading } = useQuery<ChargingStation[]>({
    queryKey: ['/api/stations', userLocation.latitude, userLocation.longitude, filters.distance],
  });

  // Filter stations based on search criteria
  const filteredStations = useMemo(() => {
    let filtered = stations;

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(station => 
        station.name.toLowerCase().includes(query) ||
        station.address.toLowerCase().includes(query) ||
        station.networkProvider.toLowerCase().includes(query)
      );
    }

    // Connector type filter
    if (filters.connectorType !== 'all') {
      filtered = filtered.filter(station => 
        station.connectorTypes.includes(filters.connectorType)
      );
    }

    // Quick filters
    if (filters.showAvailableOnly) {
      filtered = filtered.filter(station => station.availablePorts > 0);
    }

    if (filters.showFastChargingOnly) {
      filtered = filtered.filter(station => station.powerKw >= 100);
    }

    if (filters.show24hOnly) {
      filtered = filtered.filter(station => station.access24h);
    }

    if (filters.showFreeParkingOnly) {
      filtered = filtered.filter(station => 
        station.amenities.some(amenity => amenity.toLowerCase().includes('free parking'))
      );
    }

    // Calculate distances and add to stations
    const stationsWithDistance: StationWithDistance[] = filtered.map(station => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        parseFloat(station.latitude),
        parseFloat(station.longitude)
      );
      return { ...station, distance };
    });

    // Sort by distance
    return stationsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [stations, filters, userLocation]);

  // Check for low battery and show modal
  useEffect(() => {
    if (vehicle && vehicle.batteryLevel <= 30 && !lowBatteryModalOpen) {
      setLowBatteryModalOpen(true);
      toast({
        title: "Low Battery Alert",
        description: `Your battery is at ${vehicle.batteryLevel}%. Find a charging station nearby.`,
        variant: "destructive",
      });
    }
  }, [vehicle, lowBatteryModalOpen, toast]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Geolocation failed, using default location:', error);
          // Use default Seattle location
        }
      );
    }
  }, []);

  const handleStationSelect = (station: ChargingStation) => {
    setSelectedStation(station);
    setStationDetailsModalOpen(true);
  };

  const handleNavigateToStation = () => {
    const nearestStation = filteredStations[0];
    if (nearestStation) {
      toast({
        title: "Navigation Started",
        description: `Navigating to ${nearestStation.name}`,
      });
      setLowBatteryModalOpen(false);
      // In a real app, this would integrate with a navigation service
    }
  };

  const handleStartNavigation = () => {
    if (selectedStation) {
      toast({
        title: "Navigation Started",
        description: `Navigating to ${selectedStation.name}`,
      });
      setStationDetailsModalOpen(false);
      // In a real app, this would integrate with a navigation service
    }
  };

  const handleViewAllStations = () => {
    setLowBatteryModalOpen(false);
    // Scroll to stations list
    document.querySelector('[data-scroll-target="stations"]')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEmergencyFindStation = () => {
    setLowBatteryModalOpen(true);
  };

  // Battery simulation mutation
  const batterySimulation = useMutation({
    mutationFn: (batteryLevel: number) => 
      apiRequest('/api/vehicle/simulate-battery', { method: 'POST', body: { batteryLevel } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicle/current'] });
      toast({
        title: "Battery Level Updated",
        description: "Vehicle battery level has been simulated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Simulation Failed",
        description: "Unable to simulate battery level.",
        variant: "destructive",
      });
    },
  });

  const simulateBatteryDrain = () => {
    if (vehicle && vehicle.batteryLevel > 5) {
      const newLevel = Math.max(5, vehicle.batteryLevel - 10);
      batterySimulation.mutate(newLevel);
    }
  };

  const simulateBatteryCharge = () => {
    if (vehicle && vehicle.batteryLevel < 100) {
      const newLevel = Math.min(100, vehicle.batteryLevel + 15);
      batterySimulation.mutate(newLevel);
    }
  };

  const resetBattery = () => {
    batterySimulation.mutate(25); // Reset to initial low level
  };

  if (vehicleLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ev-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading vehicle data...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-ev-error mx-auto mb-4" />
          <h1 className="text-xl font-bold text-neutral-900 mb-2">No Vehicle Found</h1>
          <p className="text-neutral-600">Unable to connect to your vehicle.</p>
        </div>
      </div>
    );
  }

  const nearestAvailableStation = filteredStations.find(station => station.availablePorts > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <BatteryStatus vehicle={vehicle} />
        
        <SearchFiltersComponent 
          filters={filters}
          onFiltersChange={setFilters}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2 animate-slide-up">
            <ChargingMap
              stations={filteredStations}
              userLocation={userLocation}
              onStationSelect={handleStationSelect}
              selectedStation={selectedStation}
            />
          </div>
          
          {/* Stations List */}
          <div className="lg:col-span-1 animate-slide-up" data-scroll-target="stations" style={{ animationDelay: '0.2s' }}>
            <StationList
              stations={filteredStations}
              onStationSelect={handleStationSelect}
              selectedStation={selectedStation}
            />
          </div>
        </div>
      </main>

      {/* Enhanced Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40">
        {/* Battery Simulation Controls */}
        <div className="flex flex-col space-y-3 mb-4">
          <Button
            size="sm"
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-105"
            onClick={simulateBatteryCharge}
            disabled={batterySimulation.isPending || !vehicle || vehicle.batteryLevel >= 100}
            title="Simulate Battery Charge (+15%)"
          >
            <TrendingUp className="h-5 w-5" />
          </Button>
          
          <Button
            size="sm"
            className="w-12 h-12 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-105"
            onClick={simulateBatteryDrain}
            disabled={batterySimulation.isPending || !vehicle || vehicle.batteryLevel <= 5}
            title="Simulate Battery Drain (-10%)"
          >
            <TrendingDown className="h-5 w-5" />
          </Button>
          
          <Button
            size="sm"
            className="w-12 h-12 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-105"
            onClick={resetBattery}
            disabled={batterySimulation.isPending}
            title="Reset to Low Battery (25%)"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Emergency Find Station FAB */}
        <Button
          className="w-16 h-16 gradient-error text-white rounded-full shadow-lg transition-all duration-300 hover:scale-105 animate-bounce-in"
          onClick={handleEmergencyFindStation}
        >
          <AlertCircle className="h-6 w-6" />
        </Button>
      </div>

      {/* Enhanced Footer */}
      <footer className="bg-white dark:bg-neutral-800 mt-12 border-t border-neutral-200 dark:border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                  <Zap className="text-white h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">EVCharge</h3>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Smart EV battery monitoring with real-time alerts and charging station finder.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                <li>• Real-time battery monitoring</li>
                <li>• Low battery alerts</li>
                <li>• Nearby station finder</li>
                <li>• Live availability status</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-ev-success rounded-full"></div>
                  <span className="text-neutral-600 dark:text-neutral-400">System Online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-ev-success rounded-full"></div>
                  <span className="text-neutral-600 dark:text-neutral-400">Stations Updated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-ev-success rounded-full"></div>
                  <span className="text-neutral-600 dark:text-neutral-400">Vehicle Connected</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 dark:border-neutral-700 mt-8 pt-8 text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              © 2024 EVCharge. Built with React, TypeScript & TailwindCSS
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LowBatteryModal
        isOpen={lowBatteryModalOpen}
        onClose={() => setLowBatteryModalOpen(false)}
        vehicle={vehicle}
        nearestStation={nearestAvailableStation}
        onNavigateToStation={handleNavigateToStation}
        onViewAllStations={handleViewAllStations}
      />

      <StationDetailsModal
        isOpen={stationDetailsModalOpen}
        onClose={() => setStationDetailsModalOpen(false)}
        station={selectedStation}
        onStartNavigation={handleStartNavigation}
      />
    </div>
  );
}
