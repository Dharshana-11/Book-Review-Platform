import React, { useEffect, useState, useCallback} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Rate, Modal, message } from 'antd';
import { LeftOutlined, ShoppingCartOutlined, StarFilled } from "@ant-design/icons";
import '../styles/BookDetails.css';

const BookDetails = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { book } = state || {};
    const [bookData, setBookData] = useState(null);
    const [rating, setRating] = useState(0);
    const [cumulativeRating, setCumulativeRating] = useState(null);
    const [existingRating, setExistingRating] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const GOOGLE_BOOKS_API_KEY = 'AIzaSyCwmn5oVKeeCbiFEbzJComNr1O2vK0bHXw';
    const { title, authors = [], description, imageLinks, categories } = bookData || {};
    
    // Fetch book data from Google Books API
    const fetchBookDetails = useCallback(async (bookId) => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${GOOGLE_BOOKS_API_KEY}`
        );
        const data = await response.json();
        if (data.volumeInfo) {
          setBookData(data.volumeInfo);
        }
      } catch (error) {
        console.error('Error fetching book data:', error);
      }
    }, []); 

    // Fetch ratings and existing rating from the backend
    const fetchRatings = useCallback(async (bookId) => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`http://127.0.0.1:8000/ratings/get-book-ratings/?bookId=${bookId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setCumulativeRating(data.average_rating ?? null);
          setExistingRating(data.user_rating ?? null);
        } else {
          throw new Error('Failed to fetch ratings');
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    }, []); 

    useEffect(() => {
      const fetchData = async () => {
        if (book?.id) {
          try {
            await fetchBookDetails(book.id);
            await fetchRatings(book.id);
          } catch (error) {
            console.error('Error in useEffect:', error);
          }
        }
      };
    
      fetchData();
    }, [book?.id, fetchBookDetails, fetchRatings]);  // Add functions here    

    // Function to decode HTML entities (like &rsquo; -> ')
    const decodeHtml = (html) => {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    };
    
    const formatDescription = (desc) => {
      if (!desc) return '';
      const decodedDescription = decodeHtml(desc);
      const formattedDescription = decodedDescription.replace(/\n/g, '<br />');
      const paragraphs = formattedDescription.split(/\n\s*\n/);
      return paragraphs
        .map((para, index) => `<p key=${index}>${para}</p>`)
        .join('');
    };

    const handleRatingChange = (value) => {
      setRating(value);
    };

    const handleRatingSubmit = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('http://localhost:8000/ratings/rate-book/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookId: book.id,
            rating: rating,
            title: title || "Unknown Title",
            authors: authors.length > 0 ? authors.join(", ") : "Unknown Author",
          }),
        });

        if (response.ok) {
          fetchRatings(book.id);  // Re-fetch cumulative rating
          setIsModalVisible(false);
          message.success('Rating submitted successfully!');
        } else {
          message.error('Failed to submit rating');
        }
      } catch (error) {
        message.error('Error submitting rating');
      }
    };

    const generateAmazonLink = (title) => {
      return `https://www.amazon.com/s?k=${encodeURIComponent(title)}`;
    };

    const showRatingModal = () => {
      if (existingRating !== null) {
        message.info("You have already rated this book. You can only edit your rating.");
      }
      setIsModalVisible(true);
    };
    
    const handleBackClick = () => {
      if (window.history.length > 1) {
        navigate(-1, { replace: true });  // replace: true to ensure history state is updated
        console.log("User Home navigated");
        console.log(window.history);
      } 
    };    

    return (
      <>
        <div className='back-btn-main'>
          <div className="back-btn-container">
            <Button type="link" onClick={handleBackClick} className="back-btn"><LeftOutlined /></Button>
          </div>
        </div>
        <div className="book-details-container">
          <div className="book-cover-section">
            <img src={imageLinks && imageLinks.thumbnail 
                ? `${imageLinks.thumbnail}&fife=w800` 
                : ""}
              alt={title}
              className="book-cover-large"
            />
            <Button
              className="shopping-link-button"
              type="primary"
              onClick={() => window.open(generateAmazonLink(title), "_blank")}
            > <ShoppingCartOutlined/>
              Buy on Amazon
            </Button>
            <Button className="add-ratings-button" onClick={showRatingModal}>
              <StarFilled/> Rate this book
            </Button>
          </div>

          <div className="book-info-section">
            <h1 className="book-title">{title}</h1>
            <div className="book-author">
              {authors.length > 0 ? `By ${authors.join(", ")}` : "By Unknown Author"}
            </div>

            <div className="book-rating">
              {cumulativeRating !== undefined && cumulativeRating !== null ? (
                <>
                  <Rate allowHalf value={cumulativeRating} disabled />
                  <span className="rating-value">{cumulativeRating.toFixed(1)}</span>
                </>
              ) : (
                <span style={{ fontStyle: 'italic', color: '#d3d3d3' }}>No ratings available</span>
              )}
            </div>

            <div
              className="book-description"
              dangerouslySetInnerHTML={{
                __html: formatDescription(description) || 'Description not available.',
              }}
            />
            <div className="book-genres">
              {categories && categories.length > 0 ? (
                Array.from(new Set(categories.flatMap(category => category.split(" / ")))).map((genre, index) => (
                  <span key={index} className="genre-tag">
                    {genre}
                  </span>
                ))
              ) : (
                <span>Genres not available</span>
              )}
            </div>
            <button
              type="button"
              className="view-reviews-button"
              onClick={() => navigate('/reviews', { state: { bookId: book.id, title: title, authors: authors } })}
            >
              View Reviews
            </button>

          </div>
        </div>

        <Modal
          title="Rate this Book"
          open={isModalVisible}
          onOk={handleRatingSubmit}
          onCancel={() => setIsModalVisible(false)}
          okText="Submit Rating"
          disabled={existingRating !== null}
        >
          <Rate allowHalf onChange={handleRatingChange} value={rating} />
          {existingRating !== null && (
            <p>You have already rated this book. Modify your rating if needed.</p>
          )}
        </Modal>
      </>
    );
};

export default BookDetails;
