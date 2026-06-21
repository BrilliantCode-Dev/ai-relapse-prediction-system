import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  Paper,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import InfoIcon from "@mui/icons-material/Info";

function PatientProfile() {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const navigate = useNavigate();

  const BASE_URL = "http://127.0.0.1:8000";

  const fetchPatientProfile = useCallback(
    async (token) => {
      try {
        setLoading(true);

        console.log(
          "Fetching patient profile with token:",
          token.substring(0, 20) + "...",
        );

        const response = await axios.get(`${BASE_URL}/api/clients/profile/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Patient profile response:", response.data);
        setPatient(response.data);
        setError(null);
        setDebugInfo(null);
      } catch (err) {
        console.error("Error fetching patient profile:", err);

        if (err.response) {
          console.log("Error status:", err.response.status);
          console.log("Error data:", err.response.data);
          console.log("Error headers:", err.response.headers);

          setDebugInfo({
            status: err.response.status,
            data: err.response.data,
            message: err.message,
          });
        }

        if (err.response?.status === 401) {
          const refreshed = await refreshToken();
          if (refreshed) {
            fetchPatientProfile(localStorage.getItem("access"));
          } else {
            setError("Session expired. Please login again.");
            setTimeout(() => navigate("/login"), 2000);
          }
        } else if (err.response?.status === 404) {
          setError("Patient profile not found. Please contact support.");
        } else if (err.response?.status === 400) {
          const errorMsg =
            err.response.data?.error ||
            "Bad request. Please check your account setup.";
          setError(errorMsg);
        } else {
          setError("Failed to load profile. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    [navigate],
  );

  const refreshToken = useCallback(async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      const response = await axios.post(`${BASE_URL}/api/token/refresh/`, {
        refresh,
      });

      if (response.data.access) {
        localStorage.setItem("access", response.data.access);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Token refresh error:", err);
      return false;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      console.log("Logged in user:", user);

      if (user.role !== "patient") {
        navigate("/director");
        return;
      }

      fetchPatientProfile(token);
    } catch (err) {
      console.error("Error parsing user data:", err);
      navigate("/login");
    }
  }, [navigate, fetchPatientProfile]);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const InfoSection = ({ title, icon, children }) => (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {icon}
          <Typography
            variant="h6"
            sx={{ ml: 1, fontWeight: 600, color: "#1976d2" }}
          >
            {title}
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {children}
      </CardContent>
    </Card>
  );

  const InfoRow = ({ label, value }) => (
    <Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={500}>
        {value || "N/A"}
      </Typography>
    </Box>
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (debugInfo) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto", display: "block" }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Debug Information
        </Alert>
        <Card sx={{ mb: 2, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Error Details:
          </Typography>
          <Typography>Status: {debugInfo.status}</Typography>
          <Typography>Message: {debugInfo.message}</Typography>
          <Typography>
            Response Data: {JSON.stringify(debugInfo.data, null, 2)}
          </Typography>
        </Card>
        <Button variant="contained" onClick={handleLogout}>
          Back to Login
        </Button>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={handleLogout}>
          Back to Login
        </Button>
      </Box>
    );
  }

  if (!patient) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          No patient profile found. Please contact support.
        </Alert>
        <Button variant="contained" onClick={handleLogout} sx={{ mt: 2 }}>
          Back to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", display: "block" }}>
      {/* HEADER - Original Style */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          background: "linear-gradient(135deg, #1976d2, #0d47a1)",
          color: "#fff",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold">
              My Profile
            </Typography>
            <Typography variant="body1">
              View and manage your personal information
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid>
        {/* PERSONAL INFORMATION - Full Width */}
        <Grid item xs={12}>
          <InfoSection
            title="Personal Information"
            icon={<PersonIcon color="primary" />}
          >
            <Box>
              <InfoRow label="Full Name" value={patient.fullName} />
              <InfoRow label="Date of Birth" value={formatDate(patient.dob)} />
              <InfoRow label="Gender" value={patient.gender || "N/A"} />
              <InfoRow
                label="Age"
                value={patient.age ? `${patient.age} years` : "N/A"}
              />
              <InfoRow
                label="Marital Status"
                value={patient.maritalStatus || "N/A"}
              />
              <InfoRow label="Occupation" value={patient.occupation || "N/A"} />
              <InfoRow
                label="Education"
                value={patient.educationStatus || "N/A"}
              />
            </Box>
          </InfoSection>
        </Grid>

        {/* CONTACT INFORMATION - Full Width */}
        <Grid item xs={12}>
          <InfoSection
            title="Contact Information"
            icon={<ContactMailIcon color="primary" />}
          >
            <Box>
              <InfoRow label="Phone Number" value={patient.phoneNumber} />
              <InfoRow label="Email Address" value={patient.email || "N/A"} />
              <InfoRow label="Address" value={patient.address || "N/A"} />
              <InfoRow
                label="Emergency Contact"
                value={patient.emergencyContact || "N/A"}
              />
              <InfoRow
                label="Emergency Phone"
                value={patient.emergencyPhone || "N/A"}
              />
            </Box>
          </InfoSection>
        </Grid>

        {/* MEDICAL INFORMATION - Full Width */}
        <Grid item xs={12}>
          <InfoSection
            title="Medical Information"
            icon={<MedicalServicesIcon color="primary" />}
          >
            <Box>
              <InfoRow
                label="Assigned Caregiver"
                value={patient.caregiverName || "N/A"}
              />
              <InfoRow
                label="Caregiver Phone"
                value={patient.caregiverPhone || "N/A"}
              />
              <InfoRow
                label="Care Plan"
                value={patient.carePlan || "Standard Recovery Plan"}
              />
              <InfoRow
                label="Medical History"
                value={patient.medicalHistory || "None"}
              />
              <InfoRow
                label="Physical Issues"
                value={patient.physicalHealthProblems || "None"}
              />
              <InfoRow
                label="Substance Use"
                value={patient.substanceAbuseCharacteristics || "None"}
              />
            </Box>
          </InfoSection>
        </Grid>

        {/* ADDITIONAL INFORMATION - Full Width */}
        <Grid item xs={12}>
          <InfoSection
            title="Additional Information"
            icon={<InfoIcon color="primary" />}
          >
            <Box>
              <InfoRow label="Blood Group" value={patient.bloodGroup || "O+"} />
              <InfoRow
                label="Allergies"
                value={patient.allergies || "No known allergies"}
              />
              <InfoRow label="Notes" value={patient.notes || "N/A"} />
              <InfoRow
                label="Date Registered"
                value={patient.date ? formatDate(patient.date) : "N/A"}
              />
              <InfoRow
                label="Last Updated"
                value={
                  patient.updated_at ? formatDate(patient.updated_at) : "N/A"
                }
              />
            </Box>
          </InfoSection>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PatientProfile;
