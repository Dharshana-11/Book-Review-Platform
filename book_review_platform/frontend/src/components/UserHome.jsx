import React from 'react';
import AppLayout from '../components/AppLayout'; // Use the global layout
import Recommendation from '../components/Recommendation';
import { useSearch } from '../context/SearchContext';
import '../styles/UserHome.css'

const UserHome = () => {
  const { searchQuery } = useSearch();

  return (
    <AppLayout>
      {!searchQuery && <Recommendation />}
      {/* If searchQuery exists, AppLayout will automatically show search results */}
    </AppLayout>
  );
};

export default UserHome;
