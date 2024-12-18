import React from 'react';
import '../styles/SignUp.css';
import {useNavigate} from 'react-router-dom';
import { Form, Input, Card, Image} from 'antd';
import { MailOutlined, UserOutlined, LockOutlined, RightOutlined } from '@ant-design/icons';

const SignUp = () => {
  const navigate=useNavigate();
  const onFinish = (values) => {
    console.log('You have signed up:', values);
    navigate('/profile/setup')
  };
  const handleSignInNavigation=()=>{
    navigate('/login');
  }

  return (
    <div className="sign-up-container">
      <Card
        title={
          <div className="ant-card-title">
            <Image src="images/logo_t.png" alt="Logo" />
            <span style={{ fontSize: '18px', fontWeight: '600', color: '#022140' }}>
            Join the critique crew<br/>Your thoughts, our treasure!
            </span>
          </div>
        }
      >
        <Form name="sign-up" initialValues={{ remember: true }} onFinish={onFinish} layout="vertical">
          <Form.Item name="email" rules={[{required: true,message: 'Please input your e-mail!'}, {type: 'email', message: 'Please enter a valid e-mail!'},]}>           
            <Input prefix={<MailOutlined />} placeholder="E-mail ID" />
          </Form.Item>
          <Form.Item name="username" rules={[{ required: true, message: 'Please input your username!' }]}>
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <button type="submit" className="continue-button">
              <span className="button-text">Continue</span>
              <RightOutlined className="arrow-icon" />
            </button>
          </Form.Item>
          <div className="sign-in-footer">
            Already have an account?{' '}
            <span onClick={handleSignInNavigation}>Sign In!</span>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default SignUp;
