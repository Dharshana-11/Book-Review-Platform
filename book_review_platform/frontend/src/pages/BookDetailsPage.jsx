import React, { useEffect, useState } from 'react';
import BookDetails from '../components/BookDetails';
import AppLayout from '../components/AppLayout'; // Use the global layout
import { useLocation, useNavigate } from 'react-router-dom';

const BookDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookData, setBookData] = useState(null);

  useEffect(() => {
    if (location.state && location.state.book) {
      setBookData(location.state.book);
    } else {
      navigate('/search-results'); // Redirect if no book data
    }
  }, [location.state, navigate]);

  return (
    <AppLayout>
      {bookData ? <BookDetails book={bookData} /> : <p>Loading...</p>}
    </AppLayout>
  );
};

export default BookDetailsPage;
