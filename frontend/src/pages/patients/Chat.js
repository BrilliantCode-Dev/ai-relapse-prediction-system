import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Avatar,
  TextField,
  IconButton,
  Button,
  Chip
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";

export default function AIChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  const [userName, setUserName] = useState("");

  // Auto scroll
useEffect(() => {
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("access");

      const res = await axios.get(
        "http://127.0.0.1:8000/api/clients/profile/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const name = res.data.fullName; // ⚠️ make sure this matches your backend

      // ✅ set name
      setUserName(name);

      // ✅ set first bot message using real name
      setMessages([
        {
          sender: "bot",
          text: `Hello, ${name}! How are you feeling today?`,
        },
      ]);

    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  fetchUser();
}, []);

const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refresh");

    if (!refreshToken) {
      throw new Error("No refresh token found");
    }

    const response = await axios.post(
      "http://127.0.0.1:8000/api/token/refresh/",
      { refresh: refreshToken }
    );

    const newAccess = response.data.access;

    // ✅ save new access token
    localStorage.setItem("access", newAccess);

    return newAccess;

  } catch (error) {
    console.error("Token refresh failed:", error);

    // 🚨 optional: force logout
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    window.location.href = "/login";

    throw error;
  }
};

  // Handle Send
const handleSend = async () => {
  if (!input.trim()) return;

  const userMessage = { sender: "user", text: input };
  setMessages((prev) => [...prev, userMessage]);

  let token = localStorage.getItem("access");

  try {
    const res = await axios.post(
      "http://127.0.0.1:8000/api/clients/chat/",
      { message: input },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: res.data.reply },
    ]);

  } catch (error) {
    console.error("ERROR:", error);

    // 🔥 HANDLE TOKEN EXPIRY
    if (error.response?.status === 401) {
      try {
        const newToken = await refreshAccessToken();

        const retryRes = await axios.post(
          "http://127.0.0.1:8000/api/clients/chat/",
          { message: input },
          {
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          }
        );

        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: retryRes.data.reply },
        ]);

      } catch (refreshError) {
        console.error("Refresh failed:", refreshError);
      }
    } else {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Server error. Check backend." },
      ]);
    }
  }

  setInput("");
};

  // Quick Messages
  const handleQuickMessage = (text) => {
    setInput(text);
  };

  return (
    <Box display="flex" height="100vh">
      {/* MAIN CONTENT */}
      <Box flex={1}  display="flex" flexDirection="column">
        
        {/* 🔵 HEADER */}
        <Box
          sx={{
            p: 3,
            borderRadius: 3,
            background: "linear-gradient(90deg, #1976d2, #0d47a1)",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight="bold">
              AI Chat
            </Typography>
            <Typography variant="body2">
              Welcome back, {userName}
            </Typography>
          </Box>          
        </Box>
        

        {/* 💬 CHAT AREA */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 2,
            backgroundColor: "#f5f7fb",
            borderRadius: 3,
            mb: 2
          }}
        >
          {messages.map((msg, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                msg.sender === "user" ? "flex-end" : "flex-start"
              }
              mb={2}
            >
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  maxWidth: "60%",
                  backgroundColor:
                    msg.sender === "user" ? "#1976d2" : "#e0e0e0",
                  color: msg.sender === "user" ? "#fff" : "#000"
                }}
              >
                {msg.text}
              </Box>
            </Box>
          ))}

          <div ref={chatEndRef} />
        </Box>

        {/* ✍️ INPUT AREA */}
        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />

            <IconButton color="primary" onClick={handleSend}>
              <SendIcon />
            </IconButton>
          </Stack>

          {/* ⚡ QUICK ACTIONS */}
          <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
            {[
              "I'm feeling stressed",
              "I need some distraction",
              "I have a question"
            ].map((text) => (
              <Chip
                key={text}
                label={text}
                clickable
                onClick={() => handleQuickMessage(text)}
              />
            ))}
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}