import './App.css';
import 'antd/dist/reset.css'; // For AntD v5

import Home from './components/Home';
import SignUp from './components/SignUp';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import UserHome from './components/UserHome';
// import UserProfile from './components/UserProfile';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchResults from './components/SearchResults';
import { SearchProvider } from './context/SearchContext';
import LoginPage from './pages/LoginPage';
import BookDetailsPage from './pages/BookDetailsPage';
import ReviewPage from './pages/ReviewPage';
import UserProfilePage from './pages/UserProfilePage';

function App() {
  return (
    <div className="App">
      <SearchProvider> {/* Wrap the entire Router inside SearchProvider */}
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/profile/setup" element={<ProfileSetup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/user/home" element={<UserHome />} />
            <Route path="/user-profile" element={<UserProfilePage />} />
            <Route path="/book-details" element={<BookDetailsPage />} />
            <Route path="/reviews" element={<ReviewPage />} />
            <Route path="/search-results" element={<SearchResults />} />
          </Routes>
        </Router>
      </SearchProvider>
    </div>
  );
}

export default App;
