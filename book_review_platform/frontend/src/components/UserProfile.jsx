import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Avatar, Button, Form, Input, Select, message, Spin, Modal, Row, Col, Upload } from "antd";
import { UserOutlined, EditOutlined, LeftOutlined } from '@ant-design/icons';
import '../styles/UserProfile.css'; // Import the CSS file

const { TextArea } = Input;
const { Option } = Select;

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [genres, setGenres] = useState([]); // State to hold genre list
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);  // State to track the file list

  // const handleChange = (info) => {
  //   // Ensure the file is valid before updating the fileList
  //   const file = info.file.originFileObj || info.file;
  //   if (file instanceof File) {
  //     setFileList([file]);
  //   } else {
  //     console.error("Invalid file type for profile picture upload.");
  //   }
  // };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        message.error("No token found in localStorage!");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/accounts/profile/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP status ${response.status}`);
        }
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        message.error("Error fetching user profile.");
      } finally {
        setLoading(false);
      }
    };

    const fetchGenres = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/accounts/genres/");
        if (response.status === 200) {
          setGenres(response.data); // Assuming genres are returned as an array of {id, name}
        }
      } catch (error) {
        console.error("Error fetching genres:", error);
        message.error("Error fetching genres.");
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
      const response = await axios.put(
        "http://127.0.0.1:8000/accounts/profile/", // API endpoint
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`, // Bearer token for authentication
            "Content-Type": "multipart/form-data", // Ensure correct content type for file uploads
          },
        }
      );
      // Update user data in the state with the response data
      setUserData(response.data);
      message.success("Profile updated successfully!");
      setIsModalVisible(false);  // Close the modal after successful update
    } catch (error) {
      console.error("Profile update error:", error.response || error);
      message.error(`Failed to update profile: ${error.response?.data?.detail || error.message}`);
    }
  };
  

  // Ensure userData and genres are available before rendering the form
  if (loading || !userData || genres.length === 0) {
    return <Spin spinning={loading} />;
  }

  return (
    <>
      <Card className="user-profile-card">
        <div className="user-profile-header">
          <div className="back-button-container"><Button className="back-button" onClick={() => window.history.back()} icon={<LeftOutlined />} ></Button></div>
          <div className="edit-button-container"><Button className="edit-button" icon={<EditOutlined />} onClick={() => setIsModalVisible(true)}></Button></div>
        </div>

        <div className="user-avatar-container">
        <Avatar
          size={100}
          src={
            userData.profile_pic && typeof userData.profile_pic === "string"
              ? `http://127.0.0.1:8000${userData.profile_pic}` // For existing image URL
              : userData.profile_pic instanceof File
              ? URL.createObjectURL(userData.profile_pic) // For new file preview
              : null // Fallback when there's no image
          }
          icon={!userData.profile_pic ? <UserOutlined /> : null}
          alt={userData?.user?.username || "N/A"}
          className="user-avatar"
        />

        </div>

        <div className="user-profile-details">
          <Row>
            <Col span={12}><strong>Username:</strong></Col>
            <Col span={12}>{userData.username || "N/A"}</Col>
          </Row>
          <Row>
            <Col span={12}><strong>Bio:</strong></Col>
            <Col span={12}>{userData.bio}</Col>
          </Row>
          <Row>
            <Col span={12}><strong>Favorite Genres:</strong></Col>
            <Col span={12}>{
              userData.favorite_genres
                .map(slug => {
                  // Find the genre name by matching slug (key) from genres
                  const genre = genres.find(genre => genre.key === slug);
                  return genre ? genre.name : slug;  // Fallback to slug if genre not found
                })
                .join(", ") }
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
        <Form layout="vertical" onFinish={(values) => { console.log("Form submitted:", values); handleSave(values); }}>
          <Form.Item label="Bio" name="bio" initialValue={userData.bio}>
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item
  label="Favorite Genres"
  name="favoriteGenres"
  initialValue={userData.favorite_genres}  // Pass slugs here, as the backend sends slugs
>
  <Select mode="multiple" placeholder="Select genres">
    {console.log("GENRES:",genres)}
    {genres.map((genre) => (
      <Option key={genre.id} value={genre.key}> {/* Use genre.key (slug) as value */}
        {genre.name}
      </Option>
    ))}
  </Select>
</Form.Item>


          <Form.Item label="Profile Picture" name="profile_pic">
            <Upload
              name="profile_pic"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={(file) => {
                setFileList([file]); // Ensure file is added to fileList
                return false; // Prevent default upload behavior
              }}
            >
              {fileList.length > 0 ? (
                <img
                  src={URL.createObjectURL(fileList[0])} // Preview uploaded image
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
