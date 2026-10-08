import React from "react";
import "./Filter.css";

const Filter = ({searchTerm,setSearchTerm,selectedLocation,setSelectedLocation,minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  onSearch,
  onReset
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  return (
    <section className="filter">
      <form className="filter-inner" onSubmit={handleSubmit}>
        <input
          type="text"
          className="search-input"
          placeholder="Search hotel name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
        >
          <option value="">All Locations</option>
          <option value="salem">Salem</option>
          <option value="yercaud">Yercaud</option>
          <option value="fairlands">Fairlands</option>
          <option value="hasthampatti">Hasthampatti</option>
          <option value="junction">Junction</option>
          <option value="omalur">Omalur</option>
        </select>

        <select
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        >
          <option value="">Min price</option>
          <option value="1000">₹1,000</option>
          <option value="2500">₹2,500</option>
          <option value="5000">₹5,000</option>
        </select>

        <select
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        >
          <option value="">Max price</option>
          <option value="3000">₹3,000</option>
          <option value="5000">₹5,000</option>
          <option value="8000">₹8,000</option>
        </select>

        <button type="submit">Search</button>

        {(searchTerm || selectedLocation || minPrice || maxPrice) && (
          <button
            type="button"
            onClick={onReset}
            style={{ background: "#666", marginLeft: "4px" }}
          >
            Clear
          </button>
        )}
      </form>
    </section>
  );
};

export default Filter;

