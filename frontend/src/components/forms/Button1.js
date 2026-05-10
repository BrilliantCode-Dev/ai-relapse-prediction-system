import React from "react";

function Button(props) {
  const { text, onClick } = props;

  return (
    <button className="login-btn" onClick={onClick}>
      {text}
    </button>
  );
}

export default Button;
