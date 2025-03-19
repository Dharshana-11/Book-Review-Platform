import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Drawer, Image } from "antd";
import { MenuOutlined, UserOutlined, SearchOutlined, HomeOutlined, SettingOutlined, LogoutOutlined } from "@ant-design/icons";
import SearchBar from "./SearchBar";
import "../styles/Header.css";
import "../styles/UserHome.css";

const { Header } = Layout;

const AppHeader = ({ onSearchComplete }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuVisible, setMenuVisible] = useState(false);
  const searchInputRef = useRef(null); // Reference for search input

  // Focus search bar when navigating to /user/home
  useEffect(() => {
    if (location.pathname === "/user/home") {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300); // Ensure it waits for recommendations to load
    }
  }, [location.pathname]); // Runs when path changes

  const handleMenuClick = useCallback((e) => {
    setMenuVisible(false); // Always close menu

    if (e.key === "sign-out") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("username");
      navigate("/");
    } else if (e.key === "search") {
      if (location.pathname !== "/user/home") {
        navigate("/user/home");
      } else {
        // If already on /user/home, still focus search bar
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 300);
      }
    } else {
      navigate(`/${e.key}`);
    }
  }, [navigate, location.pathname]);

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
        {location.pathname === "/user/home" && <SearchBar ref={searchInputRef} onSearchComplete={onSearchComplete} />}
      </div>

      <Drawer title="Menu" placement="left" closable={false} onClose={toggleMenu} open={menuVisible} width={250}>
        <Menu className="menu" onClick={handleMenuClick}>
          <Menu.Item key="user/home" icon={<HomeOutlined />}>My Home</Menu.Item>
          <Menu.Item key="user-profile" icon={<UserOutlined />}>My Profile</Menu.Item>
          <Menu.Item key="search" icon={<SearchOutlined />}>Search for Books</Menu.Item>
          <Menu.Item key="settings" icon={<SettingOutlined />}>Settings</Menu.Item>
          <Menu.Item key="sign-out" icon={<LogoutOutlined />}>Sign Out</Menu.Item>
        </Menu>
      </Drawer>
    </Header>
  );
};

export default AppHeader;
