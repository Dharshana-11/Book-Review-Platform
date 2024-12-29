import React from 'react';
import { Image } from 'antd';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const navigate=useNavigate(); //Navigate function created
  const handleSignIn=()=>{
    navigate('/login')
  }
  const handleSignUp=()=>{
    navigate('/signup')
  }
  return (
    <div className="home-container">
      <div className="home-left">
        <Image width={708} src="/images/logo.jpg" alt="Logo" preview={false}/>
        <button className="sign-button" onClick={handleSignIn}>Sign In</button>
        <button className="sign-button" onClick={handleSignUp}>Sign Up</button>
      </div>
      <div className="home-right">
      <Image src="/images/home_cover.png" alt="Covers" preview={false}/>
      </div>
    </div>
  );
};

export default Home;
