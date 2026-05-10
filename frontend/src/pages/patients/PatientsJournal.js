import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Stack,
  Paper,
  CircularProgress,
  Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function PatientsJournal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [entry, setEntry] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  const tags = ["Happy", "Motivated", "Anxious", "Craving", "Stressed"];

  const BASE_URL = "http://127.0.0.1:8000";

  // 🔐 AUTHENTICATION CHECK
  useEffect(() => {
    const token = localStorage.getItem('access');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      console.log("Logged in user:", user);
      
      if (user.role !== 'patient' && user.role !== 'director') {
        navigate('/login');
        return;
      }

      setLoading(false);
    } catch (err) {
      console.error("Error parsing user data:", err);
      navigate('/login');
    }
  }, [navigate]);

  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('access');
    
    if (!token) {
      navigate('/login');
      return;
    }

    const data = {
      entry,
      tags: selectedTags,
      date: new Date().toISOString(),
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/clients/journal/`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      console.log("Journal entry saved:", response.data);
      setEntry("");
      setSelectedTags([]);
      alert("Journal entry saved successfully!");
      
    } catch (err) {
      console.error("Error saving journal:", err);
      
      if (err.response?.status === 401) {
        try {
          const refresh = localStorage.getItem('refresh');
          const refreshResponse = await axios.post(`${BASE_URL}/api/token/refresh/`, {
            refresh
          });
          
          if (refreshResponse.data.access) {
            localStorage.setItem('access', refreshResponse.data.access);
            handleSave();
          } else {
            navigate('/login');
          }
        } catch (refreshErr) {
          navigate('/login');
        }
      } else {
        alert("Failed to save journal entry. Please try again.");
      }
    }
  };

  const handleViewRecords = () => {
    const token = localStorage.getItem('access');
    if (!token) {
      navigate('/login');
      return;
    }
    navigate("/director/patients/journal-records");
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/login')}>
          Back to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box>  {/* 🔥 REMOVED ALL PADDING */}
      
      {/* 🔷 HEADER */}
      <Paper
        sx={{
          p: 3,              // 🔥 REMOVED PADDING
          mb: 3,            // 🔥 REMOVED MARGIN
          borderRadius: 3,   // 🔥 REMOVED BORDER RADIUS (optional)
          background: "linear-gradient(to right, #1976d2, #0d47a1)",          
          color: "#fff",
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Journal
        </Typography>
        <Typography>Write about your thoughts and progress</Typography>
      </Paper>

      {/* 🧾 JOURNAL CARD */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>  {/* 🔥 REMOVED PADDING */}
        <Typography variant="h6" gutterBottom>
          My Journal
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={2}>
          How are you feeling today? Write about your experiences, thoughts and progress on your journey.
        </Typography>

        {/* ✍️ TEXT AREA */}
        <TextField
          fullWidth
          multiline
          rows={5}
          placeholder="Write about your day here..."
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* 🏷 TAGS */}
        <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              clickable
              color={selectedTags.includes(tag) ? "primary" : "default"}
              onClick={() => handleTagClick(tag)}
            />
          ))}
        </Stack>

        {/* 🔘 BUTTONS */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={handleViewRecords}
          >
            View Records
          </Button>

          <Button variant="contained" onClick={handleSave}>
            Save Entry
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default PatientsJournal;