import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { type SearchFilters } from "@/lib/types";

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export default function SearchFiltersComponent({ filters, onFiltersChange }: SearchFiltersProps) {
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleFilter = (key: keyof SearchFilters) => {
    onFiltersChange({ ...filters, [key]: !filters[key] });
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-neutral-200 mb-6">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Find Charging Stations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by location, name, or address..."
                value={filters.query}
                onChange={(e) => updateFilter('query', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Distance Filter */}
          <div>
            <Select
              value={filters.distance.toString()}
              onValueChange={(value) => updateFilter('distance', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Within 5 miles</SelectItem>
                <SelectItem value="10">Within 10 miles</SelectItem>
                <SelectItem value="25">Within 25 miles</SelectItem>
                <SelectItem value="50">Within 50 miles</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Connector Type Filter */}
          <div>
            <Select
              value={filters.connectorType}
              onValueChange={(value) => updateFilter('connectorType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Connectors</SelectItem>
                <SelectItem value="Tesla">Tesla Supercharger</SelectItem>
                <SelectItem value="CCS">CCS</SelectItem>
                <SelectItem value="CHAdeMO">CHAdeMO</SelectItem>
                <SelectItem value="Type 2">Type 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Quick Filter Chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant={filters.showAvailableOnly ? "default" : "secondary"}
            size="sm"
            onClick={() => toggleFilter('showAvailableOnly')}
            className={filters.showAvailableOnly ? 'bg-ev-success hover:bg-ev-success/90' : ''}
          >
            Available Now
          </Button>
          <Button
            variant={filters.showFastChargingOnly ? "default" : "secondary"}
            size="sm"
            onClick={() => toggleFilter('showFastChargingOnly')}
          >
            Fast Charging
          </Button>
          <Button
            variant={filters.show24hOnly ? "default" : "secondary"}
            size="sm"
            onClick={() => toggleFilter('show24hOnly')}
          >
            24/7 Access
          </Button>
          <Button
            variant={filters.showFreeParkingOnly ? "default" : "secondary"}
            size="sm"
            onClick={() => toggleFilter('showFreeParkingOnly')}
          >
            Free Parking
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
