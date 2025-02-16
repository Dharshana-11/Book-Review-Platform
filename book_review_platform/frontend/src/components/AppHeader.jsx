import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Menu, Drawer, Image } from "antd";
import { MenuOutlined, UserOutlined, StarOutlined, HomeOutlined, SettingOutlined, BookOutlined, LogoutOutlined } from "@ant-design/icons";
import SearchBar from "./SearchBar";
import "../styles/Header.css";
import "../styles/UserHome.css"


const { Header } = Layout;

const AppHeader = ({ onSearchComplete }) => {
  const navigate = useNavigate();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleMenuClick = useCallback((e) => {
    if (e.key === "sign-out") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("username");
      navigate("/");
    } else {
      navigate(`/${e.key}`);
    }
  }, [navigate]);  

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  return (
    <Header className="header">
      <div className="left-section">
        <MenuOutlined className="menu-icon" onClick={toggleMenu} />
      </div>
      <div className="logo-section">
        <Image src="/images/logo_t.png" alt="Logo" className="logo" />
      </div>
      <div className="right-section">
        <SearchBar onSearchComplete={onSearchComplete} />
      </div>

      <Drawer title="Menu" placement="left" closable={false} onClose={toggleMenu} open={menuVisible} width={250}>
        <Menu className="menu" onClick={handleMenuClick}>
          <Menu.Item key="user/home" icon={<HomeOutlined />}>My Home</Menu.Item>
          <Menu.Item key="user-profile" icon={<UserOutlined />}>My Profile</Menu.Item>
          <Menu.Item key="reviews-ratings" icon={<StarOutlined />}>My Reviews & Ratings</Menu.Item>
          <Menu.Item key="settings" icon={<SettingOutlined />}>Settings</Menu.Item>
          <Menu.Item key="sign-out" icon={<LogoutOutlined />}>Sign Out</Menu.Item>
        </Menu>
      </Drawer>
    </Header>
  );
};

export default AppHeader;
