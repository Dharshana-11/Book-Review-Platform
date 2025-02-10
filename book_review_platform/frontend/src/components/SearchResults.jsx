import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button } from 'antd';
import { useSearch } from '../context/SearchContext'; // Use the search context
import '../styles/UserHome.css';
import { LeftOutlined } from '@ant-design/icons';

const { Meta } = Card;

const SearchResults = () => {
  const { searchResults, clearSearchResults, setSearchQuery, searchQuery, handleSearch } = useSearch();  // Get search query and handleSearch function from context
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const navigate = useNavigate();

  useEffect(() => { 
    if (searchQuery) {
      handleSearch(searchQuery); // Trigger search when the query changes
    }
  }, [searchQuery, handleSearch]);  // Dependency array: re-run when searchQuery or handleSearch changes

  const handleDescriptionToggle = (bookId) => {
    setExpandedDescriptions((prevState) => ({
      ...prevState,
      [bookId]: !prevState[bookId],
    }));
  };

  const handleBack = () => {
    navigate(-1); // Navigate back first
    setTimeout(() => {
      setSearchQuery(''); // Clear the search query after navigating back
      clearSearchResults(); // Clear search results after navigation
    }, 0);
  };

  const handleBookClick = (book) => {
    navigate('/book-details', {
      state: { book, fromSearch: true }  // Set `fromSearch` state to track navigation source
    });
    clearSearchResults();  // Clear the search results when navigating to book details
  };

  return (
    <div className='search-results-container'>
      <div className='search-results-back-btn-container'>
        <Button type="link" onClick={handleBack} className='search-results-back-btn'>
          <LeftOutlined />
        </Button>
      </div>
      <Row gutter={[16, 16]}>
        {searchResults.map((book) => (
          <Col span={8} key={book.id}>
            <Card
              hoverable
              className="book-card"
              onClick={() => handleBookClick(book)} 
              cover={<img src={book.volumeInfo.imageLinks?.thumbnail} alt={book.volumeInfo.title} className="book-image" />}
            >
              <Meta
                title={book.volumeInfo.title}
                description={
                  <div className="searched-book-author">
                    {book.volumeInfo.authors ? book.volumeInfo.authors.join(", ") : "Unknown Author"}
                  </div>
                }
              />
              <div
                className="searched-book-description"
                style={
                  expandedDescriptions[book.id]
                    ? { height: "auto", overflow: "visible", display: "block" }
                    : {
                        height: "60px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                      }
                }
              >
                {book.volumeInfo.description || "No description available"}
              </div>
              {book.volumeInfo.description && (
                <span
                  className="see-more"
                  onClick={() => handleDescriptionToggle(book.id)}
                >
                  {expandedDescriptions[book.id] ? "See Less" : "See More"}
                </span>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default SearchResults;
