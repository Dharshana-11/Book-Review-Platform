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
// import BookDetails from './components/BookDetails';
import ProtectedRoute from './components/ProtectedRoute';
import EmailVerification from './components/EmailVerification';

function App() {
  return (
    <div className="App">
      <SearchProvider> 
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/profile/setup" element={<ProfileSetup />} />
            <Route path="/verify-email/:uidb64/:token" element={<EmailVerification />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/user/home" element={<ProtectedRoute> <UserHome /> </ProtectedRoute>} />
            <Route path="/user-profile" element={<ProtectedRoute> <UserProfilePage /> </ProtectedRoute>} />
            <Route path="/book-details" element={<ProtectedRoute> <BookDetailsPage/> </ProtectedRoute>} />
            <Route path="/reviews" element={<ProtectedRoute> <ReviewPage /> </ProtectedRoute>} />
            <Route path="/search-results" element={<ProtectedRoute> <SearchResults /> </ProtectedRoute>} />
          </Routes>
        </Router>
      </SearchProvider>
    </div>
  );
}

export default App;
