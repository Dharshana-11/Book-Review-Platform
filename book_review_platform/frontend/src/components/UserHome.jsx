import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Menu, Drawer, Image, Row, Col, Card } from "antd";
import { MenuOutlined, ShopOutlined, StarOutlined, AppstoreAddOutlined, BookOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import SearchBar from "./SearchBar";
import Recommendation from "./Recommendation";
import "../styles/UserHome.css";

const { Header, Content } = Layout;
const { Meta } = Card;

const UserHome = () => {
  const navigate = useNavigate();
  const [menuVisible, setMenuVisible] = useState(false);
  const [books, setBooks] = useState([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleMenuClick = (e) => {
    if (e.key === 'sign-out') {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("username");
      navigate('/');
    } else {
      navigate(`/${e.key}`);
      console.log(`${e.key} clicked`);
    }
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleDescriptionToggle = (bookId) => {
    setExpandedDescriptions((prevState) => ({
      ...prevState,
      [bookId]: !prevState[bookId],
    }));
  };

  const handleSearchComplete = (books) => {
    setBooks(books);
    setSearchPerformed(true);  // Mark that search was performed
  };

  return (
    <Layout>
      <Header className="header">
        <div className="left-section">
          <MenuOutlined className="menu-icon" onClick={toggleMenu} />
        </div>
        <div className="logo-section">
          <Image src="/images/logo_t.png" alt="Logo" className="logo" />
        </div>
        <div className="right-section">
          <SearchBar onSearchComplete={handleSearchComplete} />
        </div>
      </Header>

      <Drawer title="Menu" placement="left" closable={false} onClose={toggleMenu} open={menuVisible} width={250}>
        <Menu className="menu" onClick={handleMenuClick}>
          <Menu.Item key="user-profile" icon={<UserOutlined />}>My Profile</Menu.Item>
          <Menu.Item key="reviews-ratings" icon={<StarOutlined />}>My Reviews & Ratings</Menu.Item>
          <Menu.Item key="recommendation" icon={<AppstoreAddOutlined />}>Book Recommendations</Menu.Item>
          <Menu.Item key="shop" icon={<ShopOutlined />}>Search & Shop</Menu.Item>
          <Menu.Item key="catalogue" icon={<BookOutlined />}>Popular Book Catalogues</Menu.Item>
          <Menu.Item key="sign-out" icon={<LogoutOutlined />}>Sign Out</Menu.Item>
        </Menu>
      </Drawer>

      <Content className="content">
        {/* Only show recommendations if no search is performed */}
        {!searchPerformed && <Recommendation />}
        
        {/* Display search results if available */}
        {searchPerformed && books.length > 0 && (
          <Row gutter={[16, 16]}>
            {books.map((book) => (
              <Col span={8} key={book.id}>
                <Card
                  hoverable
                  className="book-card"
                  cover={<img src={book.volumeInfo.imageLinks?.thumbnail} alt={book.volumeInfo.title} className="book-image" />}
                >
                  <Meta
                    title={book.volumeInfo.title}
                    description={
                      <div className="book-author">
                        {book.volumeInfo.authors ? book.volumeInfo.authors.join(", ") : "Unknown Author"}
                      </div>
                    }
                  />
                  <div
                    className="book-description"
                    style={
                      expandedDescriptions[book.id]
                        ? { height: "auto", overflow: "visible", display: "block" }
                        : {
                            height: "60px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                          }
                    }
                  >
                    {book.volumeInfo.description || "No description available"}
                  </div>
                  {book.volumeInfo.description && (
                    <span
                      className="see-more"
                      onClick={() => handleDescriptionToggle(book.id)}
                    >
                      {expandedDescriptions[book.id] ? "See Less" : "See More"}
                    </span>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Content>
    </Layout>
  );
};

export default UserHome;
