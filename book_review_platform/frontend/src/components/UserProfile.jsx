import React, { useEffect, useState } from "react";
import { Card, Avatar, Button, Form, Input, Select, message, Spin, Modal, Row, Col, Upload } from "antd";
import { UserOutlined, EditOutlined, LeftOutlined } from "@ant-design/icons";
import "../styles/UserProfile.css"; // Import the CSS file
import api from "../api/axiosInstance";
import API_ENDPOINTS from "../api/endpoints";
import BASE_URL from "../config";

const { TextArea } = Input;
const { Option } = Select;

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [genres, setGenres] = useState([]); // State to hold genre list
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]); // State to track the file list

  // Fetch Profile and Genres
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.PROFILE);
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        message.error("Failed to fetch user profile.");
      } finally {
        setLoading(false);
      }
    };

    const fetchGenres = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.GENRES);
        setGenres(response.data); // Assuming genres are returned as an array of { id, name, key }
      } catch (error) {
        console.error("Error fetching genres:", error);
        message.error("Failed to fetch genres.");
      }
    };

    fetchProfile();
    fetchGenres();
  }, []);


  const handleSave = async (values) => {
    const slugs = values.favoriteGenres
      .filter((genre) => genre)  // Remove any null or undefined values
      .map((genre) => genre);    // These should be slugs, as the dropdown sends `genre.key`
  
    if (slugs.length === 0) {
      message.error("Please select at least one genre.");
      return;
    }
  
    const formData = new FormData();
    formData.append("bio", values.bio || userData.bio);
    formData.append("favorite_genres", JSON.stringify(slugs));  // Send slugs to the backend
  
    if (fileList.length > 0 && fileList[0] instanceof File) {
      formData.append("profile_pic", fileList[0]);
    }
  
    // Debugging: Log formData contents
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
  
    submitFormData(formData);
  };
  
  
  const submitFormData = async (formData) => {
    try {
      const response = await api.put(API_ENDPOINTS.PROFILE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUserData(response.data);
      message.success("Profile updated successfully!");
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Failed to update profile.");
    }
  };
    
  if (loading || !userData || genres.length === 0) {
    return <Spin spinning={loading} />;
  }

  return (
    <>
      <Card className="user-profile-card">
        <div className="user-profile-header">
          <Button
            className="profile-back-button"
            onClick={() => window.history.back()}
            icon={<LeftOutlined />}
          />
          <Button
            className="profile-edit-button"
            icon={<EditOutlined />}
            onClick={() => setIsModalVisible(true)}
          />
        </div>

        <div className="user-avatar-container">
        <Avatar
          size={100}
          src={
            userData.profile_pic
              ? `${BASE_URL}${userData.profile_pic}?t=${new Date().getTime()}`
              : null
          }
          icon={!userData.profile_pic ? <UserOutlined /> : null}
        />

        </div>

        <div className="user-profile-details">
          <Row>
            <Col span={12}><strong>Username:</strong></Col>
            <Col span={12}>{userData.username || "N/A"}</Col>
          </Row>
          <Row>
            <Col span={12}><strong>Bio:</strong></Col>
            <Col span={12}>{userData.bio || "N/A"}</Col>
          </Row>
          <Row>
            <Col span={12}><strong>Favorite Genres:</strong></Col>
            <Col span={12}>
              {userData.favorite_genres
                .map((slug) => genres.find((genre) => genre.key === slug)?.name || slug)
                .join(", ")}
            </Col>
          </Row>
        </div>
      </Card>

      <Modal
        title="Edit Profile"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form layout="vertical" onFinish={handleSave}>
          <Form.Item label="Bio" name="bio" initialValue={userData.bio}>
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item label="Favorite Genres" name="favoriteGenres" initialValue={userData.favorite_genres}>
            <Select mode="multiple" placeholder="Select genres">
              {genres.map((genre) => (
                <Option key={genre.id} value={genre.key}>
                  {genre.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Profile Picture">
            <Upload
              listType="picture-card"
              showUploadList={false}
              beforeUpload={(file) => {
                setFileList([file]);
                return false;
              }}
            >
              {fileList.length > 0 ? (
                <img
                  src={URL.createObjectURL(fileList[0])}
                  alt="profile"
                  style={{ width: "100%" }}
                />
              ) : (
                <div>
                  <UserOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Save
          </Button>
        </Form>
      </Modal>
    </>
  );
};

export default UserProfile;
