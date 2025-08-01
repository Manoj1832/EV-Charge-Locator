import { MapPin, Zap, Clock, Star, Wifi, CreditCard, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type ChargingStation } from "@shared/schema";
import { type StationWithDistance } from "@/lib/types";

interface StationListProps {
  stations: StationWithDistance[];
  onStationSelect: (station: ChargingStation) => void;
  selectedStation?: ChargingStation;
}

export default function StationList({ stations, onStationSelect, selectedStation }: StationListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4 text-ev-success" />;
      case 'busy': return <AlertCircle className="h-4 w-4 text-ev-warning" />;
      case 'full': return <XCircle className="h-4 w-4 text-ev-error" />;
      default: return <XCircle className="h-4 w-4 text-neutral-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available Now';
      case 'busy': return 'Busy';
      case 'full': return 'Full';
      default: return 'Unknown';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'busy': return 'secondary';
      case 'full': return 'destructive';
      default: return 'outline';
    }
  };

  const calculateETA = (distance: number) => {
    const timeMinutes = Math.round((distance / 25) * 60);
    return `${timeMinutes} min`;
  };

  const getChargingTime = (powerKw: number) => {
    // Estimate time to charge from 20% to 80% (60% charge)
    const batterySize = 75; // Assume 75kWh average
    const chargeNeeded = batterySize * 0.6;
    const hours = chargeNeeded / powerKw;
    const minutes = Math.round(hours * 60);
    
    if (minutes < 60) return `${minutes}min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  const getRating = () => {
    return 4.2 + Math.random() * 0.7; // Mock rating between 4.2-4.9
  };

  return (
    <Card className="glass-effect rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300">
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Nearby Stations</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Found {stations.length} station{stations.length !== 1 ? 's' : ''} • Sorted by distance
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-ev-primary" />
            <span className="text-sm font-medium text-ev-primary">Live Status</span>
          </div>
        </div>
      </div>
      
      <div className="max-h-[500px] overflow-y-auto">
        {stations.map((station, index) => (
          <div
            key={station.id}
            className={`p-6 border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-all duration-200 animate-slide-up ${selectedStation?.id === station.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-ev-primary' : ''}`}
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => onStationSelect(station)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-bold text-lg text-neutral-900 dark:text-white">{station.name}</h4>
                  <Badge variant={getStatusVariant(station.status)} className="flex items-center gap-1">
                    {getStatusIcon(station.status)}
                    {getStatusText(station.status)}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{station.address}</span>
                </div>
                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < Math.floor(getRating()) ? 'text-yellow-400 fill-current' : 'text-neutral-300'}`} 
                    />
                  ))}
                  <span className="text-sm text-neutral-600 dark:text-neutral-400 ml-2">
                    {getRating().toFixed(1)} • {station.networkProvider}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Distance</div>
                <div className="text-xl font-bold text-ev-primary">
                  {station.distance ? `${station.distance.toFixed(1)}mi` : 'N/A'}
                </div>
              </div>
            </div>
            
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white dark:bg-neutral-800 rounded-lg p-3 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">Power</div>
                    <div className="font-bold text-neutral-900 dark:text-white">{station.powerKw}kW</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-neutral-800 rounded-lg p-3 shadow-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">Available</div>
                    <div className="font-bold text-neutral-900 dark:text-white">
                      {station.availablePorts}/{station.totalPorts}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-neutral-800 rounded-lg p-3 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">ETA</div>
                    <div className="font-bold text-neutral-900 dark:text-white">
                      {station.distance ? calculateETA(station.distance) : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-neutral-800 rounded-lg p-3 shadow-sm">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">Price</div>
                    <div className="font-bold text-neutral-900 dark:text-white">${station.pricePerKwh}/kWh</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Amenities and Features */}
            <div className="flex flex-wrap gap-2 mb-4">
              {station.access24h && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  24/7
                </Badge>
              )}
              {station.amenities.includes('WiFi Available') && (
                <Badge variant="outline" className="text-xs">
                  <Wifi className="h-3 w-3 mr-1" />
                  WiFi
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                {getChargingTime(station.powerKw)} to 80%
              </Badge>
            </div>
            
            {/* Quick Action */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {station.status === 'full' ? (
                  <span className="text-ev-error">⏳ Estimated wait: ~25 min</span>
                ) : station.status === 'busy' ? (
                  <span className="text-ev-warning">🟡 Currently busy</span>
                ) : (
                  <span className="text-ev-success">✅ Ready to charge</span>
                )}
              </div>
              <Button 
                size="sm" 
                variant={station.status === 'available' ? 'default' : 'outline'}
                className="text-xs"
              >
                {station.status === 'available' ? 'Navigate' : 'View Details'}
              </Button>
            </div>
          </div>
        ))}
        
        {stations.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">No Stations Found</h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
              No charging stations found matching your criteria.
            </p>
            <Button variant="outline" size="sm">
              Expand Search Area
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
