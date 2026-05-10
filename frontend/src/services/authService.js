import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

export const loginUser = async (email, password) => {
  const response = await axios.post(`${BASE_URL}/api/token/`, {
    email,
    password,
  });

  // store tokens
  localStorage.setItem("access", response.data.access);
  localStorage.setItem("refresh", response.data.refresh);

  return response.data;
};
