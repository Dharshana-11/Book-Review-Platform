import React, { useState, useEffect } from 'react';
import '../styles/ProfileSetup.css';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Card, Select, Button, Avatar, Upload, message } from 'antd';
import { UserOutlined, UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState(null);
  const [genres, setGenres] = useState([]); // Store genres here

  // Fetch genres from the backend
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const token = localStorage.getItem('access_token'); // Get the token from localStorage
        if (!token) {
          message.error('No token found. Please log in.');
          return;
        }
  
        const response = await fetch('http://127.0.0.1:8000/accounts/genres/', {
          headers: {
            Authorization: `Bearer ${token}` // Include token in the header
          }
        });
        
        if (!response.ok) {
          throw new Error('Unauthorized');
        }
  
        const data = await response.json();
        setGenres(data); // Store the list of genres
      } catch (error) {
        message.error('Error fetching genres: ' + error.message);
      }
    };
  
    fetchGenres();
  }, []);  

  const handleSkip = () => {
    navigate('/user/home');
  };

  const handleBack = () => {
    navigate('/signup');
  };

  const handleProfilePicUpload = ({ file }) => {
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePic(reader.result); // Pfp updated with the uploaded image
    };
    reader.readAsDataURL(file);
  };

  const onFinish = async (values) => {
    try {
      const username = localStorage.getItem('username');
      const token = localStorage.getItem('access_token'); // Retrieve token from localStorage

      if (!token) {
        message.error('Authentication token not found. Please log in again.');
        navigate('/login');
        return;
      }

      const payload = {
        username,
        bio: values.bio,
        favoriteGenres: values.favoriteGenres, // This will send genre IDs
        profilePic: profilePic, // Base64-encoded image data
      };

      const response = await fetch('http://127.0.0.1:8000/accounts/profile/setup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Add token to Authorization header
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        message.success(data.message);
        navigate('/login');
      } else {
        const errorData = await response.json();
        message.error(errorData.error); // Error message
        console.log(errorData.error)
      }
    } catch (error) {
      message.error('An error occurred: ' + error.message);
      console.log(error.message)
    }
  };

  return (
    <div className="profile-setup-container">
      <Card
        title={
          <div className="card-header">
            <div className="card-navigation">
              <div className="card-back">
                <Button type="link" onClick={handleBack} className="back-button">
                  <ArrowLeftOutlined />
                </Button>
              </div>
              <div className="card-title">Set Up Your Profile</div>
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
        <Form layout="vertical" onFinish={onFinish} className="profile-setup-form">
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
                  return false; // Stop automatic upload
                }}
              >
                <button className="upload-btn">
                  <UploadOutlined />
                  Upload Picture
                </button>
              </Upload>
            </div>
          </Form.Item>

          <Form.Item name="bio" label="Bio" rules={[{ required: true, message: 'Please write a short bio!' }]}>
            <Input.TextArea rows={3} placeholder="Tell us about yourself" />
          </Form.Item>

          <Form.Item name="favoriteGenres" label="Favorite Genres" rules={[{ required: true, message: 'Please select your favorite genres!' }]}>
          <Select mode="multiple" placeholder="Select your favorite genres">
            {genres.map((genre) => (
              <Select.Option key={genre.id} value={genre.id}>
                {genre.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

          <Form.Item>
            <button type="submit" style={{ height: '45px' }}>
              Finish
            </button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProfileSetup;
