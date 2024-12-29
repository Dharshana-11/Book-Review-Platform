import React,{useState} from 'react';
import '../styles/Login.css';
import {useNavigate} from 'react-router-dom';
import { Form, Input, Card, Image, Spin, message} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const Login = () => {
  const navigate=useNavigate();
  const [loading, setLoading] = useState(false);  
  // const [errorMessage, setErrorMessage] = useState('');

  const onFinish = async (values) => {
    const { username, password } = values;
    setLoading(true); 
    // setErrorMessage(''); // Reset error msg

    try {
      const response = await fetch('http://127.0.0.1:8000/accounts/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const responseData = await response.json();
      // console.log('Response Data:', responseData);
      if (response.ok) {
        localStorage.setItem('username', values.username);
        localStorage.setItem('access_token', responseData.access);
        localStorage.setItem('refresh_token', responseData.refresh);
        navigate('/user/home');
      } else {
        // const errorMessage = responseData.error || 'Invalid credentials. Please try again.';
        // setErrorMessage(errorMessage); 
        message.error(responseData.error || 'Invalid credentials. Please try again.')
      }
    } catch (error) {
      console.error('Error during login:', error);
      message.error('An error occurred. Please try again later.');
      // setErrorMessage('An error occurred. Please try again later.'); 
    } finally {
      setLoading(false); 
    }
  };
  
  const handleSignUpNavigation=()=>{
    navigate('/signup')
  }

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
            Don't have an account?{' '}
            <span onClick={handleSignUpNavigation}>Sign Up!</span>
          </div>
        </Form>
        {/* {errorMessage && <div className="error-message">{errorMessage}</div>}  */}
        </Spin>
      </Card>
    </div>
  );
};

export default Login;
