import React from 'react';
import PropTypes from 'prop-types';

const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        className="input search-input"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

export default SearchBar;
