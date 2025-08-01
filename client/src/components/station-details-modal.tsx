import { X, Navigation, Heart, Zap, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type ChargingStation } from "@shared/schema";

interface StationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: ChargingStation | null;
  onStartNavigation: () => void;
}

export default function StationDetailsModal({
  isOpen,
  onClose,
  station,
  onStartNavigation,
}: StationDetailsModalProps) {
  if (!station) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-ev-success';
      case 'busy': return 'text-ev-warning';
      case 'full': return 'text-ev-error';
      default: return 'text-neutral-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available Now';
      case 'busy': return 'Busy';
      case 'full': return 'All Ports Occupied';
      default: return 'Unknown Status';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-neutral-900">{station.name}</h3>
          </div>
        </DialogHeader>
        
        {/* Station Status */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${station.status === 'available' ? 'bg-ev-success' : station.status === 'busy' ? 'bg-ev-warning' : 'bg-ev-error'}`} />
            <span className={`font-medium ${getStatusColor(station.status)}`}>
              {getStatusText(station.status)}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm text-neutral-600">Distance</div>
            <div className="font-semibold">0.8 miles</div>
          </div>
        </div>
        
        {/* Station Image Placeholder */}
        <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg mb-6 flex items-center justify-center">
          <div className="text-center">
            <Zap className="w-12 h-12 text-ev-primary mx-auto mb-2" />
            <p className="text-sm text-neutral-600">Charging Station</p>
          </div>
        </div>
        
        {/* Station Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-neutral-50 rounded-lg p-4">
            <div className="text-sm text-neutral-600 mb-1">Available Ports</div>
            <div className="text-2xl font-bold text-ev-success">{station.availablePorts}</div>
            <div className="text-xs text-neutral-500">of {station.totalPorts} total</div>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <div className="text-sm text-neutral-600 mb-1">Charging Speed</div>
            <div className="text-2xl font-bold text-ev-primary">{station.powerKw}</div>
            <div className="text-xs text-neutral-500">kW DC Fast</div>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <div className="text-sm text-neutral-600 mb-1">Est. Arrival</div>
            <div className="text-lg font-bold text-neutral-900">3 min</div>
            <div className="text-xs text-neutral-500">via shortest route</div>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <div className="text-sm text-neutral-600 mb-1">Cost</div>
            <div className="text-lg font-bold text-neutral-900">${station.pricePerKwh}</div>
            <div className="text-xs text-neutral-500">per kWh</div>
          </div>
        </div>
        
        {/* Connector Types */}
        <div className="mb-6">
          <h4 className="font-semibold text-neutral-900 mb-3">Available Connectors</h4>
          <div className="flex flex-wrap gap-2">
            {station.connectorTypes.map((connector) => (
              <div key={connector} className="flex items-center space-x-2 bg-neutral-100 px-3 py-2 rounded-lg">
                <Zap className="w-4 h-4" />
                <span className="text-sm">{connector}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Amenities */}
        <div className="mb-6">
          <h4 className="font-semibold text-neutral-900 mb-3">Amenities</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {station.amenities.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-ev-success" />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button 
            className="flex-1 bg-ev-primary hover:bg-blue-700 text-white"
            onClick={onStartNavigation}
          >
            <Navigation className="w-4 h-4 mr-2" />
            Start Navigation
          </Button>
          <Button variant="outline" size="icon">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
