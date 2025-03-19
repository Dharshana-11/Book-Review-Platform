import React, { useState } from 'react';
import { Form, Input, Card, Image, Spin, message, Button } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
// import { FaChevronLeft } from 'react-icons/fa';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false); // Track forgot password form visibility

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
        // Handle successful login and set tokens
        localStorage.setItem('username', username);
        localStorage.setItem('access_token', responseData.token.access);
        localStorage.setItem('refresh_token', responseData.token.refresh);
        localStorage.setItem('user', JSON.stringify(responseData.user));

        setVerificationPending(false);
        const user = responseData.user;

        // Handle profile completion and verification status
        if (user.profile_complete) {
          navigate('/user/home');
        } else {
          message.warning('Please complete your profile setup.');
          navigate('/profile/setup');
        }

        if (user.is_verified === false) {
          setVerificationPending(true);
          message.warning('Your account is not verified. Click the button below to resend verification e-mail.', 5);
        }
      } else {
        if (responseData.is_verified === false) {
          setVerificationPending(true);
          message.warning('Your account is not verified. Click the button below to resend verification e-mail.', 5);
        } else {
          setVerificationPending(false);
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
        message.error(responseData.error || 'Failed to resend verification e-mail');
      }
    } catch (error) {
      console.error('Resend verification request failed:', error);
      message.error('An error occurred. Please try again later.');
    }
  };

  const handleForgotPassword = async (email) => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/accounts/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const responseData = await response.json();
      if (response.ok) {
        message.success(responseData.message); // Success message after sending the email
      } else {
        message.error(responseData.error || 'Failed to send reset password email');
      }
    } catch (error) {
      console.error('Forgot password request failed:', error);
      message.error('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpNavigation = () => {
    navigate('/signup');
  };

  const handleForgotPasswordNavigation = () => {
    setForgotPassword(true); // Show the forgot password form
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
            {!forgotPassword ? (
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
                <div className="forgot-password-footer">
                  <span onClick={handleForgotPasswordNavigation}>Forgot Password?</span>
                </div>
              </Form>
            ) : (
              // Forgot Password Form
              <Form name="forgot-password" onFinish={({ email }) => handleForgotPassword(email)} layout="vertical">
                <Form.Item name="email" rules={[{ required: true, message: 'Please input your e-mail!' }]}>
                  <Input prefix={<MailOutlined />} placeholder="Enter your e-mail" />
                </Form.Item>
                <Form.Item>
                  <button type="submit" className="ant-btn ant-btn-primary" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </Form.Item>
                <div className="back-to-login-footer">
                  <span onClick={() => setForgotPassword(false)}>
                    Back to Login
                  </span>
                </div>
              </Form>
            )}
            {verificationPending && (
              <Button type="link" onClick={handleResendVerification} loading={loading}>
                Resend Verification E-mail
              </Button>
            )}
          </div>
        </Spin>
      </Card>
    </div>
  );
};

export default Login;
