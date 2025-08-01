import { Card, CardContent } from "@/components/ui/card";
import { type ChargingStation } from "@shared/schema";
import { type StationWithDistance } from "@/lib/types";

interface StationListProps {
  stations: StationWithDistance[];
  onStationSelect: (station: ChargingStation) => void;
  selectedStation?: ChargingStation;
}

export default function StationList({ stations, onStationSelect, selectedStation }: StationListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-ev-success';
      case 'busy': return 'text-ev-warning';
      case 'full': return 'text-ev-error';
      default: return 'text-neutral-400';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'available': return 'bg-ev-success';
      case 'busy': return 'bg-ev-warning';
      case 'full': return 'bg-ev-error';
      default: return 'bg-neutral-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'busy': return 'Busy';
      case 'full': return 'Full';
      default: return 'Unknown';
    }
  };

  const calculateETA = (distance: number) => {
    // Estimate ETA based on distance (assuming 25 mph average city driving)
    const timeMinutes = Math.round((distance / 25) * 60);
    return `${timeMinutes} min`;
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-neutral-200">
      <div className="p-4 border-b border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900">Nearby Stations</h3>
        <p className="text-sm text-neutral-600 mt-1">Found {stations.length} stations</p>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {stations.map((station) => (
          <div
            key={station.id}
            className={`p-4 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors ${selectedStation?.id === station.id ? 'bg-blue-50 border-blue-200' : ''}`}
            onClick={() => onStationSelect(station)}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium text-neutral-900">{station.name}</h4>
                <p className="text-sm text-neutral-600">{station.address}</p>
              </div>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${getStatusDot(station.status)}`} />
                <span className={`text-xs font-medium ${getStatusColor(station.status)}`}>
                  {getStatusText(station.status)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-neutral-600">Distance: </span>
                <span className="font-medium">
                  {station.distance ? `${station.distance.toFixed(1)} mi` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-neutral-600">Speed: </span>
                <span className="font-medium">{station.powerKw}kW</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-neutral-600">
                <span>{station.availablePorts}</span> of <span>{station.totalPorts}</span> ports available
              </div>
              <div className="text-xs text-neutral-600">
                {station.status === 'full' ? (
                  <>Wait: ~25 min</>
                ) : (
                  <>ETA: {station.distance ? calculateETA(station.distance) : 'N/A'}</>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {stations.length === 0 && (
          <div className="p-8 text-center text-neutral-500">
            <p>No charging stations found matching your criteria.</p>
            <p className="text-sm mt-1">Try adjusting your search filters.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
