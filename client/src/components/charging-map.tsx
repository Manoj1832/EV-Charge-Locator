import { useState } from "react";
import { Plus, Minus, Navigation } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type ChargingStation } from "@shared/schema";

interface ChargingMapProps {
  stations: ChargingStation[];
  userLocation: { latitude: number; longitude: number };
  onStationSelect: (station: ChargingStation) => void;
  selectedStation?: ChargingStation;
}

export default function ChargingMap({ stations, userLocation, onStationSelect, selectedStation }: ChargingMapProps) {
  const [zoom, setZoom] = useState(13);

  const getStationColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-ev-success';
      case 'busy': return 'bg-ev-warning';
      case 'full': return 'bg-ev-error';
      default: return 'bg-neutral-400';
    }
  };

  const handleZoomIn = () => setZoom(Math.min(zoom + 1, 18));
  const handleZoomOut = () => setZoom(Math.max(zoom - 1, 8));

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="h-96 bg-neutral-100 relative">
        {/* Map placeholder with street background */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('data:image/svg+xml;base64,${btoa(`
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" stroke-width="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="#f9fafb"/>
                <rect width="100%" height="100%" fill="url(#grid)"/>
                <path d="M50 150 Q150 100 350 200" stroke="#d1d5db" stroke-width="3" fill="none"/>
                <path d="M100 250 Q200 200 300 300" stroke="#d1d5db" stroke-width="2" fill="none"/>
                <path d="M150 50 Q250 100 350 150" stroke="#d1d5db" stroke-width="2" fill="none"/>
                <rect x="80" y="120" width="60" height="40" fill="#f3f4f6" stroke="#d1d5db"/>
                <rect x="200" y="180" width="80" height="50" fill="#f3f4f6" stroke="#d1d5db"/>
                <rect x="150" y="280" width="70" height="45" fill="#f3f4f6" stroke="#d1d5db"/>
                <text x="110" y="145" font-family="Arial" font-size="8" fill="#6b7280">Building</text>
                <text x="235" y="210" font-family="Arial" font-size="8" fill="#6b7280">Mall</text>
                <text x="180" y="305" font-family="Arial" font-size="8" fill="#6b7280">Office</text>
              </svg>
            `)}')`
          }}
        />
        
        {/* Map Overlay Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <Button
            size="icon"
            variant="outline"
            className="w-10 h-10 bg-white shadow-lg hover:bg-neutral-50"
            onClick={handleZoomIn}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="w-10 h-10 bg-white shadow-lg hover:bg-neutral-50"
            onClick={handleZoomOut}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="w-10 h-10 bg-white shadow-lg hover:bg-neutral-50"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Station Markers */}
        {stations.slice(0, 6).map((station, index) => {
          const positions = [
            { top: '20%', left: '32%' },
            { top: '40%', left: '48%' },
            { top: '32%', right: '24%' },
            { top: '60%', left: '25%' },
            { top: '70%', right: '30%' },
            { top: '55%', left: '60%' },
          ];
          
          const position = positions[index] || { top: '50%', left: '50%' };
          
          return (
            <button
              key={station.id}
              className={`absolute w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 ${getStationColor(station.status)} ${selectedStation?.id === station.id ? 'ring-2 ring-blue-500' : ''}`}
              style={position}
              onClick={() => onStationSelect(station)}
            >
              <span className="text-white text-sm">⚡</span>
            </button>
          );
        })}
        
        {/* Current Location Marker */}
        <div className="absolute w-4 h-4 bg-ev-primary rounded-full border-2 border-white shadow-lg animate-pulse" style={{ top: '48%', left: '40%' }} />
      </div>
      
      {/* Map Legend */}
      <div className="p-4 border-t border-neutral-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-ev-success rounded-full" />
              <span className="text-neutral-600">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-ev-warning rounded-full" />
              <span className="text-neutral-600">Busy</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-ev-error rounded-full" />
              <span className="text-neutral-600">Full</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-neutral-600">
            <div className="w-3 h-3 bg-ev-primary rounded-full" />
            <span>Your Location</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
