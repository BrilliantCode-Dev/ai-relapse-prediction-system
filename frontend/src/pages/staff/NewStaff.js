import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import PersonalInfoSection from "./sections/PersonalInfoSection";
import ProfessionalInfoSection from "./sections/ProfessionalInfoSection";
import EmergencyContactSection from "./sections/EmergencyContactSection";
import EmployeeIdSection from "./sections/EmployeeIdSection";

function NewStaff() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const methods = useForm({
    defaultValues: {
      employeeId: "",
      fullName: "",
      email: "",
      phoneNumber: "",
      dateOfBirth: "",
      gender: "",
      address: "",

      role: "",
      department: "",
      qualification: "",
      specialization: "",
      yearsOfExperience: "",
      licenseNumber: "",
      dateJoined: new Date().toISOString().split("T")[0],
      employmentStatus: "full_time",

      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
    },
  });

  // Function to refresh the access token
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh");

      if (!refreshToken) {
        return null;
      }

      const response = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access", data.access);
        return data.access;
      } else {
        // Refresh failed - clear tokens and redirect to login
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        return null;
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      return null;
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      let token = localStorage.getItem("access");

      if (!token) {
        setError("No access token found. Please login again.");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      // First attempt
      let response = await fetch("http://127.0.0.1:8000/api/staff/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      // If token expired, try to refresh and retry
      if (response.status === 401) {
        console.log("Token expired, attempting to refresh...");

        const newToken = await refreshAccessToken();

        if (newToken) {
          // Retry with new token
          response = await fetch("http://127.0.0.1:8000/api/staff/create/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newToken}`,
            },
            body: JSON.stringify(data),
          });
        } else {
          // Refresh failed
          setError("Your session has expired. Please login again.");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }
      }

      const result = await response.json();

      if (!response.ok) {
        console.error("Backend error:", result);
        setError(result.error || JSON.stringify(result));
        return;
      }

      alert("Staff member registered successfully!");
      navigate("/director/staff/all");
    } catch (error) {
      console.error("Error creating staff:", error);
      setError(error.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Register New Staff Member
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Stack spacing={4}>
            {/* Employee ID Section */}
            <Paper sx={{ p: 3, bgcolor: "#f8f9fa" }}>
              <Typography variant="h6" mb={2} color="primary">
                Employee Identification
              </Typography>
              <EmployeeIdSection />
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" mb={2}>
                Personal Information
              </Typography>
              {/* Pass the employeeId value to PersonalInfoSection */}
              <PersonalInfoSection />
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" mb={2}>
                Professional Information
              </Typography>
              <ProfessionalInfoSection />
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" mb={2}>
                Emergency Contact
              </Typography>
              <EmergencyContactSection />
            </Paper>

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate("/director/staff/all")}
                disabled={loading}
                sx={{
                  borderColor: "#1976d2",
                  color: "#1976d2",
                  "&:hover": {
                    borderColor: "#0d47a1",
                    backgroundColor: "#e3f2fd",
                  },
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
                sx={{
                  background: "linear-gradient(to right, #1976d2, #0d47a1)",
                  color: "white",
                  fontWeight: "bold",
                  "&:hover": {
                    background: "linear-gradient(to right, #0d47a1, #051c4d)",
                    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.4)",
                  },
                }}
              >
                {loading ? "Saving..." : "Save Staff"}
              </Button>
            </Stack>
          </Stack>
        </form>
      </FormProvider>
    </Box>
  );
}

export default NewStaff;
