import { useState, useEffect, useMemo } from "react";

/**
 * Real-time search hook with debouncing
 *
 * @param {Array} data - Array of records to search
 * @param {Array} searchFields - Array of field names to search in
 * @param {Number} debounceDelay - Debounce delay in ms (default: 150)
 * @returns {Object} - Search state and filtered results
 */
export const useRealtimeSearch = (data, searchFields, debounceDelay = 150) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceDelay]);

  // Filter records based on search query
  const filteredData = useMemo(() => {
    // If no search query, return all data
    if (!debouncedQuery.trim()) {
      return data;
    }

    const query = debouncedQuery.toLowerCase().trim();

    // Filter records that match the search query
    return data.filter((record) => {
      return searchFields.some((field) => {
        const value = record[field];

        // Skip if field doesn't exist or is null/undefined
        if (value === null || value === undefined) {
          return false;
        }

        // Convert to string and search (case-insensitive, partial match)
        return String(value).toLowerCase().includes(query);
      });
    });
  }, [data, debouncedQuery, searchFields]);

  return {
    searchQuery,
    setSearchQuery,
    filteredData,
    hasResults: filteredData.length > 0,
    isSearching: searchQuery.trim().length > 0,
    resultCount: filteredData.length,
  };
};
