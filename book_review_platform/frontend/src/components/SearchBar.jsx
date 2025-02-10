import React, { useState } from "react";
import { Input, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
// import axios from "axios";
import { useSearch } from '../context/SearchContext';
import '../styles/SearchBar.css'

const SearchBar = ({ onSearchComplete }) => {
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  // const [loading, setLoading] = useState(false);
  const { handleSearch, setSearchQuery } = useSearch();

  const handleSearchQuery = () => {
    handleSearch(localSearchQuery);
    setSearchQuery(localSearchQuery)
  };

  return (
    <div className="search-bar-container">
      <Input
        className="search-bar"
        placeholder="Search a book by title, author or genre"
        value={localSearchQuery}
        onChange={(e) => setLocalSearchQuery(e.target.value)}
        onPressEnter={handleSearchQuery}
        style={{ fontSize: "12px" }}
      />
      <Button
        className="search-btn"
        type="primary"
        icon={<SearchOutlined />}
        onClick={handleSearchQuery}
        // loading={loading}
        style={{ width: "30px" }}
      ></Button>
    </div>
  );
};

export default SearchBar;
