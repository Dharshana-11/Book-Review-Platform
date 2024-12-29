import React, { useEffect, useState } from 'react';
import { Spin, Typography, message } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import '../styles/Recommendations.css';

const { Title } = Typography;

const Recommendation = () => {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const genresResponse = await fetch('http://127.0.0.1:8000/accounts/user/favorite-genres/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        });

        if (!genresResponse.ok) {
          const errorData = await genresResponse.json();
          throw new Error(errorData.error);
        }

        const { favoriteGenres } = await genresResponse.json();

        const minimumGenres = ['Top Picks for You', 'Trending Now', 'Critically Acclaimed'];
        const genres = [...favoriteGenres, ...minimumGenres.slice(favoriteGenres.length)];

        const googleBooksFetch = genres.map((genre) =>
          fetch(`https://www.googleapis.com/books/v1/volumes?q=subject:${genre}&maxResults=10`)
        );

        const googleBooksResponses = await Promise.all(googleBooksFetch);
        const booksData = await Promise.all(googleBooksResponses.map((res) => res.json()));

        const recommendationsByGenre = booksData.map((data, index) => ({
          genre: genres[index],
          books: (data.items || []).map((item) => ({
            id: item.id,
            title: item.volumeInfo.title,
            authors: item.volumeInfo.authors || ['Unknown Author'],
            image: item.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x190?text=No+Image',
          })),
        }));

        // Filter out empty genres
        const filteredRecommendations = recommendationsByGenre.filter((rec) => rec.books.length > 0);

        // Ensure at least 3 lists are displayed
        while (filteredRecommendations.length < 3) {
          filteredRecommendations.push({
            genre: minimumGenres[filteredRecommendations.length],
            books: [],
          });
        }

        setRecommendations(filteredRecommendations);
      } catch (error) {
        message.error(`Failed to fetch recommendations: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const scrollList = (id, direction) => {
    const list = document.getElementById(id);
    const scrollAmount = direction === 'left' ? -300 : 300;
    list.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className="enhanced-recommendation-container">
      {loading ? (
        <Spin tip="Fetching recommendations..." />
      ) : recommendations.length ? (
        recommendations.map((rec, index) => (
          <div key={rec.genre} className="enhanced-genre-section">
            <Title level={4} className="list-title">
              {index === 0 ? 'Top Picks for You' : index === 1 ? 'Trending Now' : rec.genre}
            </Title>
            {rec.books.length > 0 && (
              <div className="horizontal-list-wrapper">
                <LeftOutlined className="arrow-icon" onClick={() => scrollList(`list-${index}`, 'left')} />
                <div id={`list-${index}`} className="horizontal-list">
                  {rec.books.map((book) => (
                    <div key={book.id} className="book-item">
                      <img src={book.image} alt={book.title} className="book-cover" />
                      <p className="book-title">{book.title}</p>
                      <p className="book-authors">By: {book.authors.join(', ')}</p>
                    </div>
                  ))}
                </div>
                <RightOutlined className="arrow-icon" onClick={() => scrollList(`list-${index}`, 'right')} />
              </div>
            )}
          </div>
        ))
      ) : (
        <p>No recommendations available.</p>
      )}
    </div>
  );
};

export default Recommendation;
