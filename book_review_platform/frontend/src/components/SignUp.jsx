import React, { useState } from 'react';
import '../styles/SignUp.css';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Card, Image, Spin, message } from 'antd';
import { MailOutlined, UserOutlined, LockOutlined, RightOutlined } from '@ant-design/icons';

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignInNavigation = () => {
    navigate('/login');
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/accounts/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const data = await response.json();
        message.success(data.message); // Success message

        // Show a message saying that a verification email has been sent
        message.info('Please check your inbox to verify your email.');

        // Check if token exists before accessing it
        if (data.token && data.token.access) {
          localStorage.setItem('access_token', data.token.access);
        }

        localStorage.setItem('username', values.username);
        navigate('/'); 
      } else {
        const errorData = await response.json();
        message.error(errorData.error); // Error message
      }
    } catch (error) {
      message.error('An error occurred: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sign-up-container">
      <Card
        title={
          <div className="ant-card-title">
            <Image src="images/logo_t.png" alt="Logo" />
            <span style={{ fontSize: '18px', fontWeight: '600', color: '#022140' }}>
              Join the critique crew<br />Your thoughts, our treasure!
            </span>
          </div>
        }
      >
        <Spin spinning={loading}>
          <Form name="sign-up" onFinish={onFinish} layout="vertical">
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your e-mail!' },
                { type: 'email', message: 'Please enter a valid e-mail!' },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="E-mail ID" />
            </Form.Item>
            <Form.Item name="username" rules={[{ required: true, message: 'Please input your username!' }]}>
              <Input prefix={<UserOutlined />} placeholder="Username" />
            </Form.Item>
            <Form.Item 
              name="password" 
              rules={[
                { 
                  required: true, 
                  message: 'Please input your password!' 
                },
                { 
                  pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/, 
                  message: 'Password must be at least 6 characters long, with at least 1 number and 1 special character!' 
                }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" />
            </Form.Item>
            <Form.Item>
              <button type="submit" className="continue-button">
                <span className="button-text">{loading ? 'Signing Up...' : 'Sign Up'}</span>
                <RightOutlined className="arrow-icon" />
              </button>
            </Form.Item>
            <div className="sign-in-footer">
              Already have an account?{' '}
              <span onClick={handleSignInNavigation}>Sign In!</span>
            </div>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default SignUp;
