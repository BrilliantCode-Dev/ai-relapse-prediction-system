import React from "react";
import "./Button.css";

function Button(props) {
  const { text, onClick, type = "button", children, variant = "primary" } = props;

  return (
    <button
      className={`app-btn ${variant}`}
      type={type}
      onClick={onClick}
    >
      {text || children}
    </button>
  );
}

export default Button;