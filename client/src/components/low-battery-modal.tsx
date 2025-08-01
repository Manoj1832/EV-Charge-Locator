import { AlertTriangle, Navigation, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-left">
          {/* Alert Header */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-ev-error rounded-full flex items-center justify-center">
              <AlertTriangle className="text-white h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-ev-error">Low Battery Alert</h3>
              <p className="text-sm text-neutral-600">Your battery is critically low</p>
            </div>
          </div>
        </DialogHeader>
        
        {/* Battery Status */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold text-ev-error">{vehicle.batteryLevel}%</span>
            <span className="text-sm text-neutral-600">
              Range: <span className="font-medium">{vehicle.range} miles</span>
            </span>
          </div>
          
          {/* Battery Progress Bar */}
          <div className="w-full bg-neutral-200 rounded-full h-3 mb-2">
            <div 
              className="bg-ev-error rounded-full h-3 transition-all duration-300"
              style={{ width: `${vehicle.batteryLevel}%` }}
            />
          </div>
          
          <p className="text-sm text-neutral-600">
            ⚠️ We recommend charging immediately to avoid being stranded
          </p>
        </div>
        
        {/* Nearest Station Recommendation */}
        {nearestStation && (
          <div className="border border-green-300 bg-green-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-ev-success mb-2">Nearest Available Station</h4>
            <div className="space-y-2">
              <div>
                <p className="font-medium text-neutral-900">{nearestStation.name}</p>
                <p className="text-sm text-neutral-600">{nearestStation.address}</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-neutral-600">Distance: </span>
                  <span className="font-medium text-ev-success">0.8 mi</span>
                </div>
                <div>
                  <span className="text-neutral-600">ETA: </span>
                  <span className="font-medium text-ev-success">3 min</span>
                </div>
              </div>
              <div className="text-sm text-ev-success">
                ✓ {nearestStation.availablePorts} ports available • {nearestStation.powerKw}kW fast charging
              </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button 
            className="flex-1 bg-ev-primary hover:bg-blue-700 text-white"
            onClick={onNavigateToStation}
          >
            <Navigation className="w-4 h-4 mr-2" />
            Navigate Now
          </Button>
          <Button 
            variant="outline"
            onClick={onViewAllStations}
          >
            View All
          </Button>
        </div>
        
        {/* Dismiss Button */}
        <Button 
          variant="ghost"
          className="w-full mt-3 text-sm text-neutral-500 hover:text-neutral-700"
          onClick={onClose}
        >
          Dismiss for now
        </Button>
      </DialogContent>
    </Dialog>
  );
}
