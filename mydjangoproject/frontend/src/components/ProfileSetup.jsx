import React,{ useState } from 'react'
import '../styles/ProfileSetup.css';
import {useNavigate} from 'react-router-dom';
import { Form, Input, Card, Select, Button, Avatar, Upload} from 'antd';
import { UserOutlined, UploadOutlined, ArrowLeftOutlined} from '@ant-design/icons';

const ProfileSetup = () => {
    const navigate=useNavigate()
    const [profilePic, setProfilePic] = useState(null);

  const handleSkip = () => {
    navigate('/dashboard'); // Adjust route for skipping
  };
  
  const handleBack = () => {
    navigate('/signup'); // Adjust route for skipping
  };

  const onFinish = (values) => {
    console.log('Profile setup values:', values);
    navigate('/dashboard'); // Adjust route after completing the setup
  };

  const handleProfilePicUpload = ({ file }) => {
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePic(reader.result); // Update profile picture with the uploaded image
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className='profile-setup-container'>
      <Card 
        title={
            <div className="card-header">
            {/* Back, Title, and Skip */}
            <div className="card-navigation">
                {/* Back Arrow */}
                <div className="card-back">
                <Button type="link" onClick={handleBack} className="back-button">
                    <ArrowLeftOutlined/>
                </Button>
                </div>
                {/* Title */}
                <div className="card-title">Set Up Your Profile</div>
                {/* Skip Button */}
                <div className="card-skip">
                <Button type="link" onClick={handleSkip} className="skip-button">
                    <span>Skip</span>
                </Button>
                </div>
            </div>
            </div>
        }
        bordered={false}
        >

        <Form
          layout="vertical"
          onFinish={onFinish}
          className="profile-setup-form"
        >
          {/* Profile Picture */}
          <Form.Item label="Profile Picture" className="profile-pic-item">
            <div className="profile-pic-upload">
              <Avatar
                size={100}
                icon={!profilePic && <UserOutlined />}
                src={profilePic || null}
                className="profile-pic-avatar"
              />
              <Upload
                maxCount={1}
                showUploadList={false}
                beforeUpload={(file) => {
                  handleProfilePicUpload({ file });
                  return false; // Prevent automatic upload
                }}
              >
                <Button className="upload-btn" icon={<UploadOutlined />}>Upload Picture</Button>
              </Upload>
            </div>
          </Form.Item>

          {/* Bio */}
          <Form.Item
            name="bio"
            label="Bio"
            rules={[{ required: true, message: 'Please write a short bio!' }]}
          >
            <Input.TextArea rows={3} placeholder="Tell us about yourself" />
          </Form.Item>

          {/* Favorite Genres */}
          <Form.Item
            name="favoriteGenres"
            label="Favorite Genres"
            rules={[{ required: true, message: 'Please select your favorite genres!' }]}
          >
            <Select mode="multiple" placeholder="Select your favorite genres">
              <Select.Option value="fiction">Romance</Select.Option>
              <Select.Option value="non-fiction">Non-Fiction</Select.Option>
              <Select.Option value="fantasy">Fantasy</Select.Option>
              <Select.Option value="mystery">Mystery</Select.Option>
              <Select.Option value="sci-fi">Sci-Fi</Select.Option>
            </Select>
          </Form.Item>

          {/* Finish Button */}
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Finish
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default ProfileSetup
