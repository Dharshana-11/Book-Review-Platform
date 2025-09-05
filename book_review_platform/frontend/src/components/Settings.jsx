import React, { useState } from "react";
import { Card, Button, Form, Input, Modal, message } from "antd";
import { LockOutlined, UserOutlined, DeleteOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import "../styles/Settings.css";
import AppHeader from "./AppHeader";
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [isUsernameModalVisible, setUsernameModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("access_token");
  
  const handlePasswordChange = async (values) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/accounts/change-password/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        message.success("Password updated successfully!");
        setPasswordModalVisible(false);
      } else {
        message.error("Failed to update password.");
      }
    } catch (error) {
      message.error("Failed to update password.");
    }
  };

  const handleUsernameChange = async (values) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/accounts/change-username/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        message.success("Username updated successfully!");
        setUsernameModalVisible(false);
      } else {
        message.error("Failed to update username.");
      }
    } catch (error) {
      message.error("Failed to update username.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/accounts/delete-account/", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        message.success("Account deleted successfully!");
        navigate('/');
      } else {
        message.error("Failed to delete account.");
      }
    } catch (error) {
      message.error("Failed to delete account.");
    }
  };

  return (
    <>
      <AppHeader />
      <Card className="settings-card">
        <Button icon={<ArrowLeftOutlined />} className="back-button" onClick={() => navigate(-1)}></Button>
        <h2 className="settings-title">Account Settings</h2>

        <div className="settings-button-container">
            <Button icon={<UserOutlined />} className="settings-button" onClick={() => setUsernameModalVisible(true)}>
                Change Username
            </Button>
            <Button icon={<LockOutlined />} className="settings-button" onClick={() => setPasswordModalVisible(true)}>
                Change Password
            </Button>
            <Button icon={<DeleteOutlined />} className="delete-button" onClick={() => setDeleteModalVisible(true)}>
                Delete Account
            </Button>
        </div>


        {/* Change Password Modal */}
        <Modal title="Change Password" open={isPasswordModalVisible} onCancel={() => setPasswordModalVisible(false)} footer={null}>
          <Form layout="vertical" onFinish={handlePasswordChange} initialValues={{ current_password: "", new_password: "" }}>
            <Form.Item 
              label="Current Password" 
              name="current_password" 
              rules={[{ required: true, message: "Please enter your current password" }]} 
            > 
              <Input.Password /> 
            </Form.Item>
            <Form.Item 
              label="New Password" 
              name="new_password" 
              rules={[{ required: true, message: "Please enter a new password" }]} 
            > 
              <Input.Password /> 
            </Form.Item>
            <Button type="primary" htmlType="submit" block>Update Password</Button>
          </Form>
        </Modal>

        {/* Change Username Modal */}
        <Modal title="Change Username" open={isUsernameModalVisible} onCancel={() => setUsernameModalVisible(false)} footer={null}>
          <Form layout="vertical" onFinish={handleUsernameChange}>
            <Form.Item 
              label="New Username" 
              name="new_username" 
              rules={[{ required: true, message: "Please enter a new username" }]} 
              initialValue=""  
            > 
              <Input />
            </Form.Item>
            <Button type="primary" htmlType="submit" block>Update Username</Button>
          </Form>
        </Modal>

        {/* Delete Account Confirmation */}
        <Modal title="Confirm Deletion" open={isDeleteModalVisible} onCancel={() => setDeleteModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setDeleteModalVisible(false)}>Cancel</Button>,
            <Button key="delete" type="primary" danger onClick={handleDeleteAccount}>Delete</Button>,
          ]}>
          <p>Are you sure you want to delete your account? This action cannot be undone.</p>
        </Modal>
      </Card>
    </>
  );
};

export default Settings;