import { useNavigate } from "react-router-dom";

// inside component
const navigate = useNavigate();

if (response.token) {
  localStorage.setItem("token", response.token);
  navigate("/login");  // redirect to Login.js after successful registration
}
