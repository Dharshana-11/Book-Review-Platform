import React from 'react';
import '../styles/Login.css';
import {useNavigate} from 'react-router-dom';
import { Form, Input, Card, Image} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const Login = () => {
  const navigate=useNavigate();
  const onFinish = (values) => {
    console.log('You have signed in:', values);
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
        <Form name="sign-in" initialValues={{ remember: true }} onFinish={onFinish} layout="vertical">
          <Form.Item name="username" rules={[{ required: true, message: 'Please input your username!' }]}>
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <button type="submit">Sign In</button>
          </Form.Item>
          <div className="sign-up-footer">
            Don't have an account?{' '}
            <span onClick={handleSignUpNavigation}>Sign Up!</span>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
