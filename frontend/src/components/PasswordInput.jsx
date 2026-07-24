// frontend/src/components/PasswordInput.jsx
import React, { useState } from 'react';

const PasswordInput = ({ label, value, onChange, placeholder, id, required = false, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShow = () => setShowPassword(!showPassword);

  return (
    <div className="form-group password-group">
      <label htmlFor={id}>{label}</label>
      <div className="password-wrapper">
        <input
          type={showPassword ? 'text' : 'password'}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          {...props}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={toggleShow}
          tabIndex="-1"
        >
          <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;