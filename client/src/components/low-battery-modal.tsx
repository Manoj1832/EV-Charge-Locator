import { AlertTriangle, Navigation, X, Zap, Clock, MapPin, Star, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { type Vehicle, type ChargingStation } from "@shared/schema";

interface LowBatteryModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  nearestStation?: ChargingStation;
  onNavigateToStation: () => void;
  onViewAllStations: () => void;
}

export default function LowBatteryModal({
  isOpen,
  onClose,
  vehicle,
  nearestStation,
  onNavigateToStation,
  onViewAllStations,
}: LowBatteryModalProps) {
  const isCritical = vehicle.batteryLevel <= 15;
  const estimatedDistance = nearestStation ? 0.8 : 0; // Mock distance
  const estimatedETA = Math.round((estimatedDistance / 25) * 60); // minutes

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg glass-effect animate-bounce-in relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 z-10"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <DialogHeader className="text-left">
          <DialogTitle className="sr-only">Low Battery Alert</DialogTitle>
          {/* Enhanced Alert Header */}
          <div className="flex items-center space-x-4 mb-6">
            <div className={`w-16 h-16 ${isCritical ? 'gradient-error animate-gradient' : 'gradient-warning'} rounded-full flex items-center justify-center shadow-lg`}>
              <AlertTriangle className="text-white h-8 w-8 animate-charging" />
            </div>
            <div className="flex-1">
              <h3 className={`text-2xl font-bold ${isCritical ? 'text-ev-error' : 'text-ev-warning'}`}>
                {isCritical ? 'Critical Battery Alert' : 'Low Battery Alert'}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {isCritical ? 'Immediate charging required' : 'Your battery is running low'}
              </p>
              <Badge variant={isCritical ? 'destructive' : 'secondary'} className="mt-2">
                {isCritical ? 'URGENT' : 'WARNING'}
              </Badge>
            </div>
          </div>
        </DialogHeader>
        
        {/* Enhanced Battery Status */}
        <div className={`${isCritical ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' : 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800'} border rounded-2xl p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className={`text-4xl font-bold ${isCritical ? 'text-ev-error' : 'text-ev-warning'}`}>
                {vehicle.batteryLevel}%
              </div>
              <div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Range Remaining</div>
                <div className="text-xl font-bold text-neutral-900 dark:text-white">{vehicle.range} mi</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  ~{Math.round(vehicle.range / 3)} hours at current consumption
                </div>
              </div>
            </div>
          </div>
          
          {/* Animated Progress Bar */}
          <Progress 
            value={vehicle.batteryLevel} 
            className={`h-4 mb-4 ${isCritical ? 'animate-battery-pulse' : ''}`}
          />
          
          <div className={`text-sm ${isCritical ? 'text-red-700 dark:text-red-300' : 'text-orange-700 dark:text-orange-300'} flex items-center space-x-2`}>
            <AlertTriangle className="h-4 w-4" />
            <span>
              {isCritical 
                ? 'Critical: Find charging station immediately to avoid being stranded'
                : 'Recommendation: Charge soon to maintain optimal range'
              }
            </span>
          </div>
        </div>
        
        {/* Enhanced Nearest Station */}
        {nearestStation && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-2xl p-6 mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-lg text-ev-success flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Nearest Available Station
              </h4>
              <Badge variant="default" className="bg-ev-success">
                RECOMMENDED
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="font-bold text-lg text-neutral-900 dark:text-white">{nearestStation.name}</p>
                <div className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{nearestStation.address}</span>
                </div>
                <div className="flex items-center space-x-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-neutral-300'}`} />
                  ))}
                  <span className="text-sm text-neutral-600 dark:text-neutral-400 ml-2">4.5 • {nearestStation.networkProvider}</span>
                </div>
              </div>
              
              {/* Station Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center bg-white dark:bg-neutral-800 rounded-lg p-3">
                  <MapPin className="h-5 w-5 text-ev-primary mx-auto mb-1" />
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">Distance</div>
                  <div className="font-bold text-ev-success">{estimatedDistance} mi</div>
                </div>
                
                <div className="text-center bg-white dark:bg-neutral-800 rounded-lg p-3">
                  <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">ETA</div>
                  <div className="font-bold text-blue-600">{estimatedETA} min</div>
                </div>
                
                <div className="text-center bg-white dark:bg-neutral-800 rounded-lg p-3">
                  <Zap className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">Available</div>
                  <div className="font-bold text-green-600">{nearestStation.availablePorts}/{nearestStation.totalPorts}</div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-neutral-800 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-ev-primary" />
                    <span className="font-medium">{nearestStation.powerKw}kW Fast Charging</span>
                  </div>
                  <div className="text-neutral-600 dark:text-neutral-400">
                    ${nearestStation.pricePerKwh}/kWh
                  </div>
                </div>
                <div className="text-xs text-ev-success mt-2">
                  ⚡ 20% to 80% in ~{Math.round((60 * 75 * 0.6) / nearestStation.powerKw)} minutes
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Enhanced Action Buttons */}
        <div className="space-y-3">
          <div className="flex space-x-3">
            <Button 
              className="flex-1 gradient-primary text-white font-semibold py-3 hover:scale-105 transition-transform shadow-lg"
              onClick={onNavigateToStation}
            >
              <Navigation className="w-5 h-5 mr-2" />
              Navigate Now
            </Button>
            <Button 
              variant="outline"
              onClick={onViewAllStations}
              className="px-6 py-3"
            >
              View All Stations
            </Button>
          </div>
          
          {/* Emergency Options */}
          <div className="flex space-x-3">
            <Button variant="outline" size="sm" className="flex-1 text-xs">
              <Phone className="w-4 h-4 mr-1" />
              Roadside Assistance
            </Button>
            <Button 
              variant="ghost"
              size="sm"
              className="flex-1 text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              onClick={onClose}
            >
              <X className="w-4 h-4 mr-1" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
