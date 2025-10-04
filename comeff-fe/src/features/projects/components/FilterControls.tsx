import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface FilterControlsProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  onClearFilters: () => void;
}

export const FilterControls = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  onClearFilters,
}: FilterControlsProps) => {
  return (
    <div className="p-4 bg-card rounded-lg border border-border/50 space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search projects by name or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-primary">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Funding">Currently Funding</SelectItem>
              <SelectItem value="Succeeded">Successfully Funded</SelectItem>
              <SelectItem value="Active">Go live</SelectItem>
            </SelectContent>
          </Select>
        </div>


        {/* Sorting Dropdown */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-primary">Sort By</label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newly Listed</SelectItem>
              <SelectItem value="oldest">Oldest Listed</SelectItem>
              <SelectItem value="highest_funding">Highest Funding</SelectItem>
              <SelectItem value="lowest_funding">Lowest Funding</SelectItem>
              <SelectItem value="highest_roi">Highest ROI</SelectItem>
              <SelectItem value="lowest_roi">Lowest ROI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        <div className="flex justify-end items-end">
          <Button variant="outline" onClick={onClearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>

    </div>
  );
};