import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(() => {
    const storedResults = sessionStorage.getItem('searchResults');
    return storedResults ? JSON.parse(storedResults) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // For error handling

  const GOOGLE_API_KEY = 'AIzaSyCwmn5oVKeeCbiFEbzJComNr1O2vK0bHXw';
  const GOOGLE_API_URL = 'https://www.googleapis.com/books/v1/volumes';

  const clearSearchResults = () => {
    setSearchResults([]);
    sessionStorage.removeItem('searchResults');
  };

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      clearSearchResults();
      return;
    }

    setIsLoading(true);
    setError(null); // Reset error state before new request

    try {
      const response = await fetch(`${GOOGLE_API_URL}?q=${query}&key=${GOOGLE_API_KEY}`);
      const data = await response.json();

      if (data.items) {
        const results = data.items.map((item) => ({
          id: item.id,
          volumeInfo: {
            title: item.volumeInfo.title || 'No title',
            authors: item.volumeInfo.authors || ['Unknown Author'],
            description: item.volumeInfo.description || 'No description available',
            imageLinks: item.volumeInfo.imageLinks || { thumbnail: '/images/default-cover.jpg' },
          },
        }));

        setSearchResults(results);
        sessionStorage.setItem('searchResults', JSON.stringify(results)); // Persist results
      } else {
        clearSearchResults();
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      setError('Failed to fetch search results.');
      clearSearchResults();
    } finally {
      setIsLoading(false);
    }
  }, [GOOGLE_API_URL, GOOGLE_API_KEY]); // Remove `searchQuery` from dependency list

  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery); // Trigger search when the query changes
    }
  }, [searchQuery, handleSearch]); // Only search when searchQuery changes

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        searchResults,
        clearSearchResults,
        isLoading,
        error, // Provide error state to be used by consumers
        handleSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
