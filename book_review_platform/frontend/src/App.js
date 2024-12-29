import './App.css';
import 'antd/dist/reset.css'; // For AntD v5
// import '@ant-design/v5-patch-for-react-19';
import Home from './components/Home';
import Login from './components/Login';
import SignUp from './components/SignUp';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import UserHome from './components/UserHome';
import UserProfile from './components/UserProfile';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Router>
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/login" element={<Login/>} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/profile/setup" element={<ProfileSetup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/user/home" element={<UserHome />} />
                <Route path="/user-profile" element={<UserProfile />} />
            </Routes>
        </Router>
    </div>
  );
}

export default App;
