import { Zap, Bell, Settings, Sun, Moon, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { type Vehicle } from "@shared/schema";
import { useState } from "react";

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2);

  // Get vehicle data for connection status
  const { data: vehicle } = useQuery<Vehicle>({
    queryKey: ['/api/vehicle/current'],
  });

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header className="glass-effect border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 py-3">
          {/* Enhanced Logo Section */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="text-white h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">EVCharge</h1>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Smart EV Management</p>
            </div>
          </div>

          {/* Status Center */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {vehicle?.isConnected ? (
                <Wifi className="h-4 w-4 text-ev-success" />
              ) : (
                <WifiOff className="h-4 w-4 text-ev-error" />
              )}
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {vehicle?.isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>

            {/* Current Time */}
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              {getCurrentTime()}
            </div>

            {/* Battery Quick Status */}
            {vehicle && (
              <div className="flex items-center space-x-2 bg-white dark:bg-neutral-800 rounded-lg px-3 py-1 shadow-sm">
                <div className={`w-2 h-2 rounded-full ${vehicle.batteryLevel <= 20 ? 'bg-ev-error' : vehicle.batteryLevel <= 30 ? 'bg-ev-warning' : 'bg-ev-success'}`} />
                <span className="text-sm font-medium text-neutral-900 dark:text-white">
                  {vehicle.batteryLevel}%
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Notifications with Badge */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <Bell className="h-5 w-5" />
              </Button>
              {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center p-0 animate-bounce-in"
                >
                  {notificationCount}
                </Badge>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleDarkMode}
              className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Settings */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <Settings className="h-5 w-5" />
            </Button>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button variant="outline" size="sm" className="px-3">
                Menu
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
