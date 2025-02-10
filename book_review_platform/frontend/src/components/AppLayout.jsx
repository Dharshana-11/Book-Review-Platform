import React, { useEffect } from 'react';
import { useSearch } from '../context/SearchContext';
import AppHeader from '../components/AppHeader';
import SearchResults from '../components/SearchResults';
import { debounce } from '../utils/debounce'; // Import debounce utility
import { useLocation } from 'react-router-dom'; // Import useLocation to track page navigation

const AppLayout = ({ children }) => {
  const { searchQuery, searchResults, handleSearch, clearSearchResults } = useSearch();
  const location = useLocation(); // Get the current location to track page navigation

  useEffect(() => {
    if (searchQuery && !location.pathname.includes('/book-details')) {  // Only search if we're not on the book details page
      const debouncedSearch = debounce(handleSearch, 500);
      debouncedSearch(searchQuery); // Use the debounced function
    }
  }, [searchQuery, handleSearch, location.pathname]); // Dependencies include searchQuery, handleSearch, and location.pathname

  useEffect(() => {
    // Clear search results when the user navigates to the book details page
    if (location.pathname.includes('/book-details')) {
      clearSearchResults(); // Optionally clear search results to prevent UI conflicts
    }
  }, [location.pathname, clearSearchResults]);

  return (
    <div>
      {/* The search bar should always be visible */}
      <AppHeader />

      {/* If there are search results, show them; otherwise, show page content */}
      {searchQuery && searchResults.length > 0 && !location.pathname.includes('/book-details') ? (
        <SearchResults />
      ) : (
        <div className="page-content">{children}</div>
      )}
    </div>
  );
};

export default AppLayout;
