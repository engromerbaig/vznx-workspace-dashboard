// components/FilterBar.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaCalendar, FaRedo, FaSortAmountDown, FaSortAlphaDown } from 'react-icons/fa';
import { MdSpeed, MdOutlineFilterAlt, MdOutlineFilterAltOff } from 'react-icons/md';
import { formatDate } from '@/utils/dateFormatter';
import { theme } from '@/theme';

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

interface DropdownProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}

const CustomDropdown = ({ label, value, options, onChange, icon }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full lg:w-auto" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200 text-white text-sm"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-white/80">{icon}</span>}
          <span className="font-medium whitespace-nowrap">{selectedOption?.label || label}</span>
        </div>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full lg:min-w-[200px] bg-white rounded-lg shadow-xl border border-[#2B35A0]/20 overflow-hidden z-50">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left text-sm transition-colors duration-150 ${
                value === option.value
                  ? 'bg-[#2B35A0]/10 text-[#2B35A0] font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

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
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const isActive = 
      filters.search !== '' ||
      filters.sortBy !== 'recent' ||
      filters.status !== 'all' ||
      filters.dateRange.start !== '' ||
      filters.dateRange.end !== '';
    
    setHasActiveFilters(isActive);
  }, [filters]);

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
    setFilters(prev => ({ ...prev, dateRange: { start, end } }));
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

  const sortOptions: { value: string; label: string }[] = [
    { value: 'recent', label: 'Recent First' },
    { value: 'oldest', label: 'Oldest First' }
  ];

  const nameOptions: { value: string; label: string }[] = [
    { value: 'name-asc', label: 'A to Z' },
    { value: 'name-desc', label: 'Z to A' }
  ];

  const progressOptions: { value: string; label: string }[] = [
    { value: 'progress-desc', label: 'High to Low' },
    { value: 'progress-asc', label: 'Low to High' }
  ];

  const statusOptions: { value: string; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'planning', label: 'Planning' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ];

  const getSortType = () => {
    if (['recent', 'oldest'].includes(filters.sortBy)) return 'date';
    if (['name-asc', 'name-desc'].includes(filters.sortBy)) return 'name';
    return 'progress';
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '...';
    try {
      return formatDate(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={`${theme.gradients.hero} rounded-xl shadow-lg border border-[#2B35A0]/30 p-4 mb-6 ${className}`}>
      
      {/* Mobile: Search + Filter Toggle */}
      <div className="lg:hidden">
        <div className="flex items-center gap-3 mb-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 text-sm" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/40 outline-none transition-all duration-200 text-white placeholder-white/60 text-sm"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200 text-white text-sm whitespace-nowrap"
          >
            {showFilters ? (
              <>
                <MdOutlineFilterAltOff className="text-lg" />
                <span>Hide</span>
              </>
            ) : (
              <>
                <MdOutlineFilterAlt className="text-lg" />
                <span>Filters</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile: Collapsible Filters */}
        {showFilters && (
          <div className="flex flex-col gap-3">
            {/* Sort by Date */}
            <CustomDropdown
              label="Date"
              value={getSortType() === 'date' ? filters.sortBy : 'recent'}
              options={sortOptions}
              onChange={(value) => handleSortChange(value as FilterOptions['sortBy'])}
              icon={<FaSortAmountDown />}
            />

            {/* Sort by Name */}
            <CustomDropdown
              label="Name"
              value={getSortType() === 'name' ? filters.sortBy : 'name-asc'}
              options={nameOptions}
              onChange={(value) => handleSortChange(value as FilterOptions['sortBy'])}
              icon={<FaSortAlphaDown />}
            />

            {/* Sort by Progress */}
            <CustomDropdown
              label="Progress"
              value={getSortType() === 'progress' ? filters.sortBy : 'progress-desc'}
              options={progressOptions}
              onChange={(value) => handleSortChange(value as FilterOptions['sortBy'])}
              icon={<MdSpeed />}
            />

            {/* Status Filter */}
            {showStatusFilter && (
              <CustomDropdown
                label="Status"
                value={filters.status}
                options={statusOptions}
                onChange={(value) => handleStatusChange(value as FilterOptions['status'])}
              />
            )}

            {/* Date Range Toggle */}
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`flex items-center justify-between gap-2 px-3 py-2 border rounded-lg transition-all duration-200 text-sm ${
                filters.dateRange.start || filters.dateRange.end
                  ? 'bg-white text-[#2B35A0] border-white'
                  : 'bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <FaCalendar className="text-sm" />
                <span>Date Range</span>
              </div>
            </button>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all duration-200 text-sm"
              >
                <FaRedo className="text-sm" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Desktop: All Filters in Row */}
      <div className="hidden lg:flex items-stretch gap-3">
        
        {/* Search Input */}
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/40 outline-none transition-all duration-200 text-white placeholder-white/60"
          />
        </div>

        {/* Sort by Date */}
        <CustomDropdown
          label="Date"
          value={getSortType() === 'date' ? filters.sortBy : 'recent'}
          options={sortOptions}
          onChange={(value) => handleSortChange(value as FilterOptions['sortBy'])}
          icon={<FaSortAmountDown />}
        />

        {/* Sort by Name */}
        <CustomDropdown
          label="Name"
          value={getSortType() === 'name' ? filters.sortBy : 'name-asc'}
          options={nameOptions}
          onChange={(value) => handleSortChange(value as FilterOptions['sortBy'])}
          icon={<FaSortAlphaDown />}
        />

        {/* Sort by Progress */}
        <CustomDropdown
          label="Progress"
          value={getSortType() === 'progress' ? filters.sortBy : 'progress-desc'}
          options={progressOptions}
          onChange={(value) => handleSortChange(value as FilterOptions['sortBy'])}
          icon={<MdSpeed />}
        />

        {/* Status Filter */}
        {showStatusFilter && (
          <CustomDropdown
            label="Status"
            value={filters.status}
            options={statusOptions}
            onChange={(value) => handleStatusChange(value as FilterOptions['status'])}
          />
        )}

        {/* Date Range Toggle */}
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-all duration-200 text-sm whitespace-nowrap ${
            filters.dateRange.start || filters.dateRange.end
              ? 'bg-white text-[#2B35A0] border-white'
              : 'bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20'
          }`}
        >
          <FaCalendar className="text-sm" />
          <span>Date Range</span>
        </button>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all duration-200 text-sm whitespace-nowrap"
          >
            <FaRedo className="text-sm" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Date Range Picker */}
      {showDatePicker && (
        <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleDateRangeChange(e.target.value, filters.dateRange.end)}
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/40 outline-none transition-all duration-200 text-white [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleDateRangeChange(filters.dateRange.start, e.target.value)}
                min={filters.dateRange.start}
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/40 outline-none transition-all duration-200 text-white [color-scheme:dark]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full border border-white/30">
              Search: <strong>{filters.search}</strong>
              <button
                onClick={() => handleSearchChange('')}
                className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
              >
                <FaTimes className="w-2.5 h-2.5" />
              </button>
            </span>
          )}
          {filters.sortBy !== 'recent' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full border border-white/30">
              {sortOptions.find(o => o.value === filters.sortBy)?.label ||
               nameOptions.find(o => o.value === filters.sortBy)?.label ||
               progressOptions.find(o => o.value === filters.sortBy)?.label}
            </span>
          )}
          {filters.status !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full border border-white/30">
              {statusOptions.find(o => o.value === filters.status)?.label}
              <button
                onClick={() => handleStatusChange('all')}
                className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
              >
                <FaTimes className="w-2.5 h-2.5" />
              </button>
            </span>
          )}
          {(filters.dateRange.start || filters.dateRange.end) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full border border-white/30">
              {formatDisplayDate(filters.dateRange.start)} to {formatDisplayDate(filters.dateRange.end)}
              <button
                onClick={() => handleDateRangeChange('', '')}
                className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
              >
                <FaTimes className="w-2.5 h-2.5" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}