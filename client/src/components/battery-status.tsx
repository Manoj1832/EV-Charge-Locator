import { Wifi, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { type Vehicle } from "@shared/schema";

interface BatteryStatusProps {
  vehicle: Vehicle;
}

export default function BatteryStatus({ vehicle }: BatteryStatusProps) {
  const getBatteryColor = (level: number) => {
    if (level <= 20) return "text-ev-error";
    if (level <= 30) return "text-ev-warning";
    return "text-ev-success";
  };

  const getBatteryFillColor = (level: number) => {
    if (level <= 20) return "bg-ev-error";
    if (level <= 30) return "bg-ev-warning";
    return "bg-ev-success";
  };

  const isLowBattery = vehicle.batteryLevel <= 30;

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-neutral-200 mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Vehicle Status</h2>
          <div className="flex items-center space-x-2 text-sm text-neutral-600">
            <Wifi className={`h-4 w-4 ${vehicle.isConnected ? 'text-ev-success' : 'text-neutral-400'}`} />
            <span>{vehicle.isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Battery Level Display */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-4">
              <div className="relative w-20 h-20">
                {/* Battery Icon with Level */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-16 h-24 border-2 ${isLowBattery ? 'border-ev-error' : 'border-neutral-300'} rounded-sm relative bg-white`}>
                    {/* Battery Level Fill */}
                    <div 
                      className={`absolute bottom-0 left-0 right-0 rounded-sm transition-all duration-500 ${getBatteryFillColor(vehicle.batteryLevel)} ${isLowBattery ? 'animate-battery-pulse' : ''}`}
                      style={{ height: `${vehicle.batteryLevel}%` }}
                    />
                    {/* Battery Top */}
                    <div className={`absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-1 rounded-t-sm ${isLowBattery ? 'bg-ev-error' : 'bg-neutral-300'}`} />
                  </div>
                </div>
              </div>
              <div>
                <div className={`text-3xl font-bold ${getBatteryColor(vehicle.batteryLevel)}`}>
                  {vehicle.batteryLevel}%
                </div>
                <div className="text-sm text-neutral-600">Battery Level</div>
                {isLowBattery && (
                  <div className="text-sm text-ev-error font-medium mt-1 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Low Battery Warning
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Vehicle Info */}
          <div className="space-y-3">
            <div>
              <div className="text-sm text-neutral-600">Range Remaining</div>
              <div className="text-lg font-semibold text-neutral-900">{vehicle.range} miles</div>
            </div>
            <div>
              <div className="text-sm text-neutral-600">Location</div>
              <div className="text-sm text-neutral-900">{vehicle.location}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-600">Vehicle</div>
              <div className="text-sm text-neutral-900">{vehicle.name}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
