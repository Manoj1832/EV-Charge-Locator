import { Wifi, AlertTriangle, Zap, Car, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

  const getBatteryGradient = (level: number) => {
    if (level <= 20) return "gradient-error";
    if (level <= 30) return "gradient-warning";
    return "gradient-success";
  };

  const isLowBattery = vehicle.batteryLevel <= 30;
  const isCriticalBattery = vehicle.batteryLevel <= 15;

  const formatLastUpdated = () => {
    const now = new Date();
    const updated = new Date(vehicle.lastUpdated);
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  return (
    <Card className="glass-effect rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 mb-6 animate-slide-up">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <Car className="text-white h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{vehicle.name}</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Vehicle Status</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant={vehicle.isConnected ? "default" : "secondary"} className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              {vehicle.isConnected ? 'Connected' : 'Offline'}
            </Badge>
            <div className="text-right">
              <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatLastUpdated()}
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Battery Display */}
        <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {/* Enhanced Battery Visualization */}
              <div className="relative">
                <div className="w-24 h-40 bg-white dark:bg-neutral-800 border-4 border-neutral-300 dark:border-neutral-600 rounded-lg shadow-inner relative overflow-hidden">
                  {/* Battery Fill with Gradient */}
                  <div 
                    className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out ${getBatteryGradient(vehicle.batteryLevel)} ${isLowBattery ? 'animate-battery-pulse' : ''} ${isCriticalBattery ? 'animate-gradient' : ''}`}
                    style={{ height: `${Math.max(vehicle.batteryLevel, 3)}%` }}
                  />
                  
                  {/* Battery Level Text Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${vehicle.batteryLevel < 50 ? 'text-white' : 'text-neutral-800'} drop-shadow-lg`}>
                        {vehicle.batteryLevel}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Battery Terminal */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-t-sm" />
                  
                  {/* Charging Icon */}
                  {vehicle.batteryLevel < 100 && (
                    <div className="absolute top-2 right-2">
                      <Zap className="h-4 w-4 text-yellow-400 animate-charging" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1">
                <div className={`text-4xl font-bold mb-2 ${getBatteryColor(vehicle.batteryLevel)}`}>
                  {vehicle.batteryLevel}%
                </div>
                <Progress 
                  value={vehicle.batteryLevel} 
                  className="w-48 h-3 mb-3"
                />
                <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Battery Level</div>
                {isLowBattery && (
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${isCriticalBattery ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'} animate-bounce-in`}>
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {isCriticalBattery ? 'Critical Battery' : 'Low Battery Warning'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-card">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Range Remaining</div>
                <div className="text-xl font-bold text-neutral-900 dark:text-white">{vehicle.range} mi</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  ~{Math.round(vehicle.range / 3)} hours driving
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-card">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Current Location</div>
                <div className="text-lg font-semibold text-neutral-900 dark:text-white truncate">{vehicle.location}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {vehicle.latitude}, {vehicle.longitude}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-card">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Car className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Battery Capacity</div>
                <div className="text-xl font-bold text-neutral-900 dark:text-white">{vehicle.batteryCapacity} kWh</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {Math.round((vehicle.batteryLevel / 100) * vehicle.batteryCapacity)}kWh available
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
