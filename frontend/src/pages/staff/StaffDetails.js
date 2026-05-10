import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Button
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Work as WorkIcon
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function StaffDetails() {
  const [staffData, setStaffData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchStaffProfile();
  }, []);

  const fetchStaffProfile = async () => {
    try {
      const accessToken = localStorage.getItem("access");
      
      if (!accessToken) {
        console.log("No access token found");
        navigate("/login");
        return;
      }

      console.log("Fetching staff profile...");
      
      // Try to get staff profile
      const response = await axios.get("http://127.0.0.1:8000/api/staff/profile/", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      console.log("Staff profile response:", response.data);
      setStaffData(response.data);
      setLoading(false);
      
    } catch (err) {
      console.error("Error fetching staff profile:", err);
      console.error("Error response:", err.response?.data);
      
      if (err.response?.status === 401) {
        navigate("/login");
      } else if (err.response?.status === 404) {
        setError("Staff profile not found. Please contact administrator.");
      } else {
        setError("Failed to load staff profile: " + (err.response?.data?.error || err.message));
      }
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Get user info from localStorage as fallback
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Format role name for display
  const formatRole = (role) => {
    if (!role) return "Staff";
    return role
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" disableGutters >
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Box display="flex" gap={2}>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Retry
          </Button>
          <Button variant="outlined" onClick={handleLogout}>
            Go to Login
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{  mb: 4 }} disableGutters>
      {/* Welcome Section */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 4, 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white"
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: "rgba(255,255,255,0.2)",
              fontSize: 40
            }}
          >
            {user.full_name?.charAt(0) || staffData?.full_name?.charAt(0) || "S"}
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              Hello, {user.full_name || staffData?.full_name || "Staff Member"}!
            </Typography>
            <Typography variant="subtitle1">
              Welcome to your Staff Dashboard
            </Typography>
            <Chip 
              label={formatRole(user.role || staffData?.role)} 
              sx={{ 
                 
                bgcolor: "rgba(255,255,255,0.2)", 
                color: "white",
                fontWeight: "bold"
              }} 
            />
          </Box>
        </Box>
      </Paper>

      {/* Personal Details Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PersonIcon color="primary" />
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Full Name
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {staffData?.full_name || user.full_name || "Not provided"}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Employee ID
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {staffData?.employee_id || "Not assigned"}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Role
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formatRole(staffData?.role || user.role)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <EmailIcon color="primary" />
                Contact Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email Address
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {user.email || staffData?.email || "Not provided"}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Phone Number
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {staffData?.phone_number || "Not provided"}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Status */}
        <Grid item xs={12}>
          <Alert severity="success" >
            ✓ Your account is active and verified. You are logged in as <strong>{formatRole(user.role)}</strong>.
          </Alert>
        </Grid>
      </Grid>
    </Container>
  );
}

export default StaffDetails;