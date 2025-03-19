import React, { useState, forwardRef } from "react";
import { Input, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useSearch } from "../context/SearchContext";
import "../styles/SearchBar.css";

const SearchBar = forwardRef(function SearchBar({ onSearchComplete }, ref) {
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const { handleSearch, setSearchQuery } = useSearch();

  const handleSearchQuery = () => {
    handleSearch(localSearchQuery);
    setSearchQuery(localSearchQuery);
  };

  return (
    <div className="search-bar-container">
      <Input
        ref={ref} // Attach the ref to allow focus
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
        style={{ width: "30px" }}
      />
    </div>
  );
});

export default SearchBar;
