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
  const [error, setError] = useState(null);

  // Use environment variable instead of hardcoded key
  const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_BOOKS_API_KEY;
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
    setError(null);

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
        sessionStorage.setItem('searchResults', JSON.stringify(results));
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
  }, [GOOGLE_API_URL, GOOGLE_API_KEY]);

  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  }, [searchQuery, handleSearch]);

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        searchResults,
        clearSearchResults,
        isLoading,
        error,
        handleSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
