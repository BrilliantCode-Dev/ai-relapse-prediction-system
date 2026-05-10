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
  Alert,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  InputAdornment,
  FormControl,
  Select,
  Grid,
  Divider,
  Avatar
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

function JournalRecords() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [journals, setJournals] = useState([]);
  const [filteredJournals, setFilteredJournals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [moodFilter, setMoodFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [patient, setPatient] = useState(null);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedJournal, setSelectedJournal] = useState(null);
  
  const BASE_URL = "http://127.0.0.1:8000";
  const moods = ["Happy", "Motivated", "Anxious", "Craving", "Stressed"];

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
      
      fetchJournals(token);
      fetchPatientProfile(token);
      
    } catch (err) {
      console.error("Error parsing user data:", err);
      navigate('/login');
    }
  }, [navigate]);

  const fetchPatientProfile = async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/clients/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      setPatient(response.data);
    } catch (err) {
      console.error("Error fetching patient profile:", err);
    }
  };

  const fetchJournals = async (token) => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/journal/entries/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log("Journals fetched:", response.data);
      setJournals(response.data);
      setFilteredJournals(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching journals:", err);
      
      if (err.response?.status === 401) {
        try {
          const refresh = localStorage.getItem('refresh');
          const refreshResponse = await axios.post(`${BASE_URL}/api/token/refresh/`, {
            refresh
          });
          
          if (refreshResponse.data.access) {
            localStorage.setItem('access', refreshResponse.data.access);
            fetchJournals(refreshResponse.data.access);
          } else {
            navigate('/login');
          }
        } catch (refreshErr) {
          navigate('/login');
        }
      } else {
        setError("Failed to load journal entries. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort journals
  useEffect(() => {
    let filtered = [...journals];
    
    if (searchTerm) {
      filtered = filtered.filter(journal => 
        journal.entry?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (moodFilter !== "all") {
      filtered = filtered.filter(journal => 
        journal.tags?.includes(moodFilter)
      );
    }
    
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    setFilteredJournals(filtered);
  }, [searchTerm, moodFilter, sortBy, journals]);

  const handleMenuOpen = (event, journal) => {
    setAnchorEl(event.currentTarget);
    setSelectedJournal(journal);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedJournal(null);
  };

  const handleViewJournal = () => {
    navigate(`/patient/journal/${selectedJournal.id}`);
    handleMenuClose();
  };

  const handleEditJournal = () => {
    navigate(`/patient/journal/edit/${selectedJournal.id}`);
    handleMenuClose();
  };

  const handleDeleteJournal = async () => {
    const token = localStorage.getItem('access');
    if (!token) {
      navigate('/login');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      try {
        await axios.delete(`${BASE_URL}/api/journal/entries/${selectedJournal.id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        
        fetchJournals(token);
        handleMenuClose();
      } catch (err) {
        console.error("Error deleting journal:", err);
        alert("Failed to delete journal entry. Please try again.");
      }
    } else {
      handleMenuClose();
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* 🔷 HEADER - Same style as PatientsJournal */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: "linear-gradient(to right, #1976d2, #0d47a1)",
          color: "#fff",
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Journal History
        </Typography>
        <Typography>View and manage your past journal entries</Typography>
      </Paper>

      

      {/* 🔍 FILTERS CARD */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Journal History
        </Typography>
        
        <Grid container spacing={2}>
          {/* Search */}
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          {/* Mood Filter */}
          <Grid item xs={6} md={3.5}>
            <FormControl fullWidth size="small">
              <Select
                value={moodFilter}
                onChange={(e) => setMoodFilter(e.target.value)}
                displayEmpty
              >
                <MenuItem value="all">All Moods</MenuItem>
                {moods.map((mood) => (
                  <MenuItem key={mood} value={mood}>{mood}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Sort */}
          <Grid item xs={6} md={3.5}>
            <FormControl fullWidth size="small">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* 📝 ERROR MESSAGE */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 📝 JOURNAL ENTRIES */}
      {!error && filteredJournals.length === 0 && (
        <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
          <Typography variant="body1" color="text.secondary">
            No journal entries found. Start writing your first entry!
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/director/patients/journal')}
            sx={{ mt: 2 }}
          >
            Write New Entry
          </Button>
        </Paper>
      )}

      {!error && filteredJournals.length > 0 && (
        filteredJournals.map((journal, index) => (
          <Paper key={journal.id || index} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            {/* Header with date and mood tags */}
            <Stack 
              direction="row" 
              justifyContent="space-between" 
              alignItems="flex-start"
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                  {formatDate(journal.date)}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {journal.tags?.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      color={tag === "Craving" ? "error" : "primary"}
                    />
                  ))}
                </Stack>
              </Box>
              
              <IconButton size="small" onClick={(e) => handleMenuOpen(e, journal)}>
                <MoreVertIcon />
              </IconButton>
            </Stack>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Journal content preview */}
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
              {journal.entry?.length > 300 
                ? `${journal.entry.substring(0, 300)}...` 
                : journal.entry}
            </Typography>
            
            {/* Action buttons */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={() => handleViewJournal()}
              >
                View
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => handleEditJournal()}
              >
                Edit
              </Button>
            </Stack>
          </Paper>
        ))
      )}

      {/* 🔘 BACK TO JOURNAL BUTTON */}
      <Stack direction="row" justifyContent="right" sx={{ mt: 2, mb: 3 }}>
        <Button
          variant="contained"
          onClick={() => navigate('/director/patients/journal')}
          sx={{ minWidth: 200 }}
        >
          Back to Journal
        </Button>
      </Stack>

      {/* Menu for journal actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewJournal}>
          <VisibilityIcon sx={{ mr: 1, fontSize: 20 }} /> View
        </MenuItem>
        <MenuItem onClick={handleEditJournal}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteJournal} sx={{ color: "error.main" }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default JournalRecords;