import React from "react";
import { Search, X } from "lucide-react";

export const SearchInput = ({
  value,
  onChange,
  placeholder = "Search records...",
  totalRecords,
  filteredCount,
  className = "",
}) => {
  const handleClear = () => {
    onChange("");
  };

  return (
    <div className={`mb-6 ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          autoComplete="off"
          aria-label="Search records"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            aria-label="Clear search"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Results Counter */}
      {value && (
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Showing <span className="font-semibold">{filteredCount}</span> of{" "}
            {totalRecords} records
          </span>
          {filteredCount === 0 && (
            <span className="text-red-500">No matches found</span>
          )}
        </div>
      )}
    </div>
  );
};
