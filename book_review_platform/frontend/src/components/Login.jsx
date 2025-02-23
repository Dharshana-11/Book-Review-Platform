import React, { useState } from 'react';
import { Form, Input, Card, Image, Spin, message, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false); // Track if verification is pending

  const onFinish = async (values) => {
    const { username, password } = values;
    setLoading(true);
    localStorage.setItem('username', username);
  
    try {
      const response = await fetch('http://127.0.0.1:8000/accounts/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
  
      const responseData = await response.json();
      console.log('Server Response:', responseData);
  
      if (response.ok) {
        // This block only executes if login is successful
        localStorage.setItem('username', username);
        localStorage.setItem('access_token', responseData.token.access);
        localStorage.setItem('refresh_token', responseData.token.refresh);
        localStorage.setItem('user', JSON.stringify(responseData.user));
  
        // Reset verificationPending state since login is successful
        setVerificationPending(false);
  
        const user = responseData.user;
  
        // Check if profile is complete
        if (user.profile_complete) {
          console.log('Profile complete! Redirecting to /user/home');
          navigate('/user/home');
        } else {
          console.log('Profile incomplete! Redirecting to profile/setup');
          message.warning('Please complete your profile setup.');
          navigate('/profile/setup');
        }
  
        // Check if the user is verified
        if (user.is_verified === false) {
          setVerificationPending(true); // Show resend button only if verification is pending
          message.warning('Your account is not verified. Click the button below to resend verification email.', 5);
        }
      } else {
        // If login failed, check the response data for specific errors
        if (responseData.is_verified === false) {
          // Handle case where the account is not verified
          setVerificationPending(true); // Show resend button
          message.warning('Your account is not verified. Click the button below to resend verification email.', 5);
        } else if (responseData.profile_complete === false) {
          // Handle case where profile is incomplete
          message.warning('Your profile is incomplete. Please complete your profile setup.');
          navigate('/profile/setup');
        } else {
          // General error (e.g., invalid credentials)
          message.error(responseData.error || 'Invalid credentials. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login request failed:', error);
      message.error('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };  

  const handleResendVerification = async () => {
    const username = localStorage.getItem('username');
    try {
      const response = await fetch('http://127.0.0.1:8000/accounts/resend-verification/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const responseData = await response.json();
      if (response.ok) {
        message.success(responseData.message);
      } else {
        message.error(responseData.error || 'Failed to resend verification email');
      }
    } catch (error) {
      console.error('Resend verification request failed:', error);
      message.error('An error occurred. Please try again later.');
    }
  };

  const handleSignUpNavigation = () => {
    navigate('/signup');
  };

  return (
    <div className="sign-in-container">
      <Card
        title={
          <div className="ant-card-title">
            <Image src="images/logo_t.png" alt="Logo" />
            <span style={{ fontSize: '20px', fontWeight: '600', color: '#022140' }}>
              Dive back into Critique Cove!
            </span>
          </div>
        }
      >
        <Spin spinning={loading}>
          <div>
            <Form name="sign-in" initialValues={{ remember: true }} onFinish={onFinish} layout="vertical">
              <Form.Item name="username" rules={[{ required: true, message: 'Please input your username!' }]}>
                <Input prefix={<UserOutlined />} placeholder="Username" />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Password" />
              </Form.Item>
              <Form.Item>
                <button type="submit" className="ant-btn ant-btn-primary" disabled={loading}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </Form.Item>
              <div className="sign-up-footer">
                Don't have an account? <span onClick={handleSignUpNavigation}>Sign Up!</span>
              </div>
            </Form>
            {verificationPending && (
              <Button type="link" onClick={handleResendVerification} loading={loading}>
                Resend Verification Email
              </Button>
            )}
          </div>
        </Spin>
      </Card>
    </div>
  );
};

export default Login;