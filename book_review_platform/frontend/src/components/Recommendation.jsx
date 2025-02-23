import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, Typography, message } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import '../styles/Recommendations.css';

const { Title } = Typography;

const Recommendation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);

  // Function to get the book cover image by ISBN from the external API
  const getBookCoverByISBN = async (isbn) => {
    try {
      const response = await fetch(`https://bookcover.longitood.com/bookcover/${isbn}`);
      const data = await response.json();
      return data.url; // Return the cover image URL
    } catch (error) {
      console.error('Error fetching book cover:', error);
      return 'https://via.placeholder.com/128x190?text=No+Image'; // Fallback if error
    }
  };

  // Function to shuffle the array (for randomizing book recommendations)
  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Fetch favorite genres from the backend
        const genresResponse = await fetch('http://127.0.0.1:8000/accounts/user/favorite-genres/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        });

        if (!genresResponse.ok) {
          const errorData = await genresResponse.json();
          throw new Error(errorData.error);
        }

        const { favoriteGenres } = await genresResponse.json();

        // Ensure at least 3 genres
        const minimumGenres = ['Top Picks for You', 'Trending Now', 'Critically Acclaimed'];
        let genres = [...favoriteGenres];

        // If fewer than 3 favorite genres, add random genres
        if (favoriteGenres.length < 3) {
          const randomGenres = ['Science Fiction', 'Fantasy', 'Non-fiction', 'Romance', 'Mystery'];
          genres = [...favoriteGenres, ...randomGenres.slice(0, 3 - favoriteGenres.length)];
        }

        // Merge with minimum genres if there are still fewer than 3 genres
        genres = [...genres, ...minimumGenres.slice(genres.length)];

        // Google Books API key
        const GOOGLE_BOOKS_API_KEY = 'AIzaSyCwmn5oVKeeCbiFEbzJComNr1O2vK0bHXw';

        // Function to fetch books with a delay to avoid rate limits
        const fetchBooksWithDelay = async (genres, delay = 300) => {
          const responses = [];

          for (let i = 0; i < genres.length; i++) {
            const genre = genres[i];
            try {
              // Fetch books published after 2010
              const response = await fetch(
                `https://www.googleapis.com/books/v1/volumes?q=subject:${genre}+&maxResults=40&orderBy=relevance&publishedDate=2010-01-01&key=${GOOGLE_BOOKS_API_KEY}`
              );
              const data = await response.json();
              responses.push(data);

              // Delay between requests to avoid API rate limits
              if (i < genres.length - 1) await new Promise((resolve) => setTimeout(resolve, delay));
            } catch (error) {
              console.error(`Error fetching books for genre: ${genre}, error`);
              responses.push({ items: [] }); // Push an empty response for failed requests
            }
          }

          return responses;
        };

        // Fetch books with a delay
        const booksData = await fetchBooksWithDelay(genres, 300);

        // Map genres and books data to the desired structure, but only include books with large/extraLarge covers
        const recommendationsByGenre = await Promise.all(booksData.map(async (data, index) => ({
          genre: genres[index],
          books: await Promise.all((data.items || []).map(async (item) => ({
            kind: item.kind,
            id: item.id,
            etag: item.etag,
            selfLink: item.selfLink,
            volumeInfo: {
              title: item.volumeInfo?.title || 'No Title',
              authors: item.volumeInfo?.authors || ['Unknown Author'],
              publisher: item.volumeInfo?.publisher || 'Unknown Publisher',
              publishedDate: item.volumeInfo?.publishedDate || 'Unknown Date',
              description: item.volumeInfo?.description || 'No description available',
              imageLinks: {
                // Get ISBN from industryIdentifiers and fetch cover image from the external API
                thumbnail: await getBookCoverByISBN(
                  item.volumeInfo?.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier || ''
                ),
              },
              industryIdentifiers: item.volumeInfo?.industryIdentifiers || [],
            },
            accessInfo: item.accessInfo,
            saleInfo: item.saleInfo,
            searchInfo: item.searchInfo,
          }))),
        })));


        // Ensure at least 3 lists are displayed
        while (recommendationsByGenre.length < 3) {
          recommendationsByGenre.push({
            genre: minimumGenres[recommendationsByGenre.length],
            books: [],
          });
        }

        // Randomize the books for each genre (to prevent always showing the same set)
        const randomizedRecommendations = recommendationsByGenre.map((rec) => ({
          ...rec,
          books: shuffleArray(rec.books),
        }));

        setRecommendations(randomizedRecommendations);
      } catch (error) {
        message.error(`Failed to fetch recommendations: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // Function to handle scrolling
  const scrollList = (id, direction) => {
    const list = document.getElementById(id);
    const scrollAmount = direction === 'left' ? -300 : 300;
    list.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleBookClick = (book) => {
    console.log(book);
    navigate('/book-details', {
      state: { book }, // Pass the book details to the new route
    });
  };

  const isValidImage = (imageUrl) => {
    return typeof imageUrl === 'string' && !imageUrl.includes('placeholder');
  };

  return (
    <div className="enhanced-recommendation-container">
      {loading ? (
        <Spin tip="Fetching recommendations...">
          <div style={{ minHeight: '100px' }} />
        </Spin>
      ) : (
        recommendations.length ? (
          recommendations.map((rec, index) => (
            <div key={rec.genre} className="enhanced-genre-section">
              <Title level={4} className="list-title">
                {index === 0 ? 'Top Picks for You' : index === 1 ? 'Trending Now' : rec.genre}
              </Title>
              {rec.books.length > 0 && (
                <div className="horizontal-list-wrapper">
                  <LeftOutlined className="arrow-icon" onClick={() => scrollList(`list-${index}`, 'left')} />
                  <div id={`list-${index}`} className="horizontal-list">
                    {rec.books.map((book) => {
                      const imageUrl = book.volumeInfo.imageLinks?.thumbnail;
                      if (!isValidImage(imageUrl)) return null;

                      return (
                        <div
                          key={book.id}
                          className="book-item"
                          onClick={() => handleBookClick(book)}
                          style={{ cursor: 'pointer' }}
                        >
                          <img src={imageUrl} alt={book.volumeInfo.title} className="book-cover" />
                          <p className="recommended-book-title">{book.volumeInfo.title}</p>
                          <p className="recommended-book-authors">By: {book.volumeInfo.authors.join(', ')}</p>
                        </div>
                      );
                    })}
                  </div>
                  <RightOutlined className="arrow-icon" onClick={() => scrollList(`list-${index}`, 'right')} />
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No recommendations available.</p>
        )
      )}
    </div>
  );
};

export default Recommendation;
