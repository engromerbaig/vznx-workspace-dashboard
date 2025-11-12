// components/FilterBar.tsx
'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaTimes, FaCalendar } from 'react-icons/fa';

export interface FilterOptions {
  search: string;
  sortBy: 'recent' | 'oldest' | 'name-asc' | 'name-desc' | 'progress-asc' | 'progress-desc';
  status: 'all' | 'planning' | 'in-progress' | 'completed';
  dateRange: {
    start: string;
    end: string;
  };
}

interface FilterBarProps {
  onFilterChange: (filters: FilterOptions) => void;
  showStatusFilter?: boolean;
  placeholder?: string;
  className?: string;
}

export default function FilterBar({
  onFilterChange,
  showStatusFilter = true,
  placeholder = 'Search...',
  className = ''
}: FilterBarProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    sortBy: 'recent',
    status: 'all',
    dateRange: {
      start: '',
      end: ''
    }
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Check if any filters are active
  useEffect(() => {
    const isActive = 
      filters.search !== '' ||
      filters.sortBy !== 'recent' ||
      filters.status !== 'all' ||
      filters.dateRange.start !== '' ||
      filters.dateRange.end !== '';
    
    setHasActiveFilters(isActive);
  }, [filters]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, onFilterChange]);

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleSortChange = (sortBy: FilterOptions['sortBy']) => {
    setFilters(prev => ({ ...prev, sortBy }));
  };

  const handleStatusChange = (status: FilterOptions['status']) => {
    setFilters(prev => ({ ...prev, status }));
  };

  const handleDateRangeChange = (start: string, end: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { start, end }
    }));
  };

  const handleReset = () => {
    setFilters({
      search: '',
      sortBy: 'recent',
      status: 'all',
      dateRange: { start: '', end: '' }
    });
    setShowDatePicker(false);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 text-black p-4 mb-6 ${className}`}>
      <div className="flex flex-col lg:flex-row gap-4">
        
        {/* Search Input */}
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-200"
          />
        </div>

        {/* Sort By Dropdown */}
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value as FilterOptions['sortBy'])}
            className="w-full lg:w-48 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-200 appearance-none bg-white cursor-pointer"
          >
            <option value="recent">Recent First</option>
            <option value="oldest">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="progress-asc">Progress (Low-High)</option>
            <option value="progress-desc">Progress (High-Low)</option>
          </select>
        </div>

        {/* Status Filter */}
        {showStatusFilter && (
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => handleStatusChange(e.target.value as FilterOptions['status'])}
              className="w-full lg:w-48 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-200 appearance-none bg-white cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        )}

        {/* Date Range Toggle */}
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-all duration-200 ${
            filters.dateRange.start || filters.dateRange.end
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-gray-300 hover:border-primary/50 text-gray-700'
          }`}
        >
          <FaCalendar />
          <span className="hidden sm:inline">Date Range</span>
        </button>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200"
          >
            <FaTimes />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Date Range Picker */}
      {showDatePicker && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleDateRangeChange(e.target.value, filters.dateRange.end)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleDateRangeChange(filters.dateRange.start, e.target.value)}
                min={filters.dateRange.start}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
              Search: {filters.search}
              <button
                onClick={() => handleSearchChange('')}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.sortBy !== 'recent' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
              Sort: {filters.sortBy}
            </span>
          )}
          {filters.status !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
              Status: {filters.status}
              <button
                onClick={() => handleStatusChange('all')}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </span>
          )}
          {(filters.dateRange.start || filters.dateRange.end) && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
              Date: {filters.dateRange.start || '...'} to {filters.dateRange.end || '...'}
              <button
                onClick={() => handleDateRangeChange('', '')}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}