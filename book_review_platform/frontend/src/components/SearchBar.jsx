import React, { useState } from "react";
import { Input, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import axios from "axios";

const SearchBar = ({ onSearchComplete }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery) return; // If search query is empty, no request made
    setLoading(true);
    try {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}`
      );
      onSearchComplete(response.data.items || []);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-bar-container">
      <Input
        className="search-bar"
        placeholder="Search a book by title, author or genre"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onPressEnter={handleSearch}
        style={{fontSize:'12px'}}
      />
      <Button
        className="search-btn"
        type="primary"
        icon={<SearchOutlined />}
        onClick={handleSearch}
        loading={loading}
        style={{ width: "30px" }}
      ></Button>
    </div>
  );
};

export default SearchBar;
