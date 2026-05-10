import React from "react";

function InputField(props) {
  const { type, placeholder, value, onChange } = props;

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="input-field"
    />
  );
}

export default InputField;
