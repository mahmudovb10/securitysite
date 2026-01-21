import { AlertCircle } from "lucide-react";

export const NoResults = ({ searchQuery, onClear }) => (
  <div className="bg-white rounded-lg shadow p-12 text-center">
    <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-gray-700 mb-2">
      No matching records found
    </h3>
    <p className="text-gray-500 mb-4">
      No records match your search for{" "}
      <span className="font-semibold">"{searchQuery}"</span>
    </p>
    <p className="text-sm text-gray-400 mb-4">
      Try adjusting your search terms or clear the search to see all records
    </p>
    {onClear && (
      <button
        onClick={onClear}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        Clear Search
      </button>
    )}
  </div>
);
