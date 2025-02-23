import React, { useEffect } from 'react';
import { useSearch } from '../context/SearchContext';
import AppHeader from '../components/AppHeader';
import SearchResults from '../components/SearchResults';
import { debounce } from '../utils/debounce'; 
import { useLocation } from 'react-router-dom';

const AppLayout = ({ children }) => {
  const { searchQuery, searchResults, handleSearch, clearSearchResults } = useSearch();
  const location = useLocation(); 

  useEffect(() => {
    if (searchQuery && !location.pathname.includes('/book-details')) {
      const debouncedSearch = debounce(handleSearch, 500);
      debouncedSearch(searchQuery);
    }
  }, [searchQuery, location.pathname, handleSearch]);  // Include handleSearch here
  

  useEffect(() => {
    // Clear search results when navigating to the book details page
    if (location.pathname.includes('/book-details')) {
      clearSearchResults();
    }
  }, [location.pathname, clearSearchResults]); // Track changes to location.pathname

  return (
    <div>
      <AppHeader />
      {searchQuery && searchResults.length > 0 && !location.pathname.includes('/book-details') ? (
        <SearchResults />
      ) : (
        <div className="page-content">{children}</div>
      )}
    </div>
  );
};

export default AppLayout;
