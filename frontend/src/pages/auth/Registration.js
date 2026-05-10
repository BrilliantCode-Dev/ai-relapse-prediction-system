import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stack,
  Paper,
  Alert,
  CircularProgress
} from "@mui/material";

function Registration() {
  // STEP 1: Define staff roles at the top
  const staffRoles = [
    "staff",
    "nurse",
    "social-worker",
    "family-therapist",
    "psychiatrist",
    "nurse-aid",
    "psychologist",
    "counsellor",
    "occupational-therapist"
  ];

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    accountNumber: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [availablePatients, setAvailablePatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  // STEP 2: Create staff state
  const [availableStaff, setAvailableStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [apiError, setApiError] = useState("");

  // STEP 1: Update useEffect with staff role detection
  useEffect(() => {
    if (formData.role === "patient") {
      fetchAvailablePatients();
    } else if (staffRoles.includes(formData.role)) {
      fetchAvailableStaff();
    } else {
      setAvailablePatients([]);
      setAvailableStaff([]);
      setApiError("");
    }
  }, [formData.role]);

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh");
      
      if (!refreshToken) {
        return null;
      }

      const response = await axios.post("http://127.0.0.1:8000/api/token/refresh/", {
        refresh: refreshToken
      });

      if (response.data.access) {
        localStorage.setItem("access", response.data.access);
        return response.data.access;
      }
      return null;
    } catch (err) {
      console.error("Token refresh failed:", err);
      return null;
    }
  };

  const fetchAvailablePatients = async (retry = true) => {
    setLoadingPatients(true);
    setApiError("");
    
    try {
      let accessToken = localStorage.getItem("access");
      
      if (!accessToken) {
        setApiError("You are not logged in. Please login again.");
        return;
      }

      const response = await axios.get("http://127.0.0.1:8000/api/clients/", {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      // Filter patients that don't have a user account yet
      const unassigned = response.data.filter(patient => !patient.user);
      setAvailablePatients(unassigned);
      
    } catch (err) {
      console.error("Error fetching patients:", err);
      
      if (err.response?.status === 401 && retry) {
        console.log("Token expired, attempting to refresh...");
        const newToken = await refreshAccessToken();
        
        if (newToken) {
          return fetchAvailablePatients(false);
        } else {
          setApiError("Your session has expired. Please login again.");
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          localStorage.removeItem("user");
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        }
      } else {
        setApiError(`Failed to load patient list: ${err.message}`);
      }
    } finally {
      setLoadingPatients(false);
    }
  };

  // STEP 3: Create staff fetch function
  const fetchAvailableStaff = async (retry = true) => {
    setLoadingStaff(true);
    setApiError("");

    try {
      let accessToken = localStorage.getItem("access");
      
      if (!accessToken) {
        setApiError("You are not logged in. Please login again.");
        return;
      }

      const response = await axios.get("http://127.0.0.1:8000/api/staff/", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      // Only staff without user accounts
      const unassigned = response.data.filter(staff => !staff.user);
      setAvailableStaff(unassigned);

    } catch (err) {
      console.error("Error fetching staff:", err);
      
      if (err.response?.status === 401 && retry) {
        console.log("Token expired, attempting to refresh...");
        const newToken = await refreshAccessToken();
        
        if (newToken) {
          return fetchAvailableStaff(false);
        } else {
          setApiError("Your session has expired. Please login again.");
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          localStorage.removeItem("user");
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        }
      } else {
        setApiError("Failed to load staff list");
      }
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    
    setError("");
    setApiError("");
  };

  const handlePatientSelect = (e) => {
    const accountNumber = e.target.value;
    
    // Find the selected patient
    const patient = availablePatients.find(p => p.accountNumber === accountNumber);
    
    if (patient) {
      // Auto-fill full name and phone number from the selected patient
      setFormData({
        ...formData,
        accountNumber: accountNumber,
        full_name: patient.fullName,
        phone: patient.phoneNumber,
        email: patient.email || ""
      });
    }
  };

  // STEP 7: Create staff auto-fill handler
  const handleStaffSelect = (e) => {
  const employeeNumber = e.target.value;

  const staff = availableStaff.find(
    s => s.employee_id === employeeNumber
  );

  if (staff) {
    setFormData({
      ...formData,
      accountNumber: employeeNumber,
      full_name: staff.full_name,        // ✅ FIXED
      phone: staff.phone_number,         // ✅ FIXED
      email: staff.email || ""
    });
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate for patients and staff
    if (formData.role === "patient" || staffRoles.includes(formData.role)) {
      if (!formData.accountNumber) {
        setError("Please select an account/employee number from the dropdown");
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      const accessToken = localStorage.getItem("access");

      // Prepare data to send
      let dataToSend = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        password: formData.password
      };
      
      // For patients, include account_number (snake_case)
      if (formData.role === "patient") {
        dataToSend.account_number = formData.accountNumber;
        console.log("Including account_number:", formData.accountNumber);
      }
      
      // For staff, include employee_number
      if (staffRoles.includes(formData.role)) {
        dataToSend.employee_number = formData.accountNumber;
        console.log("Including employee_number:", formData.accountNumber);
      }

      console.log("Sending data to backend:", dataToSend);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/patients/register/",
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Registration response:", response.data);
      alert("User registered successfully");

      // Reset form
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        role: "",
        password: "",
        accountNumber: "",
      });
      
      // Refresh the lists if needed
      if (formData.role === "patient") {
        fetchAvailablePatients();
      } else if (staffRoles.includes(formData.role)) {
        fetchAvailableStaff();
      }
      
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);
      
      // Handle error messages
      if (err.response?.data) {
        const errorData = err.response.data;
        
        if (typeof errorData === 'object') {
          // Check for specific error fields
          if (errorData.error) {
            setError(errorData.error);
          } else if (errorData.email) {
            setError(`Email: ${errorData.email.join(', ')}`);
          } else if (errorData.account_number) {
            setError(`Account Number: ${errorData.account_number.join(', ')}`);
          } else if (errorData.employee_number) {
            setError(`Employee Number: ${errorData.employee_number.join(', ')}`);
          } else {
            setError(JSON.stringify(errorData));
          }
        } else {
          setError(String(errorData));
        }
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Determine if dropdown should be shown (patient OR staff)
  const showDropdown = formData.role === "patient" || staffRoles.includes(formData.role);
  // Determine which data to use
  const dataList = formData.role === "patient" ? availablePatients : availableStaff;
  const isLoading = formData.role === "patient" ? loadingPatients : loadingStaff;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold">
          New User Registration
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Please complete all required fields
        </Typography>
      </Box>

      <Paper elevation={1} sx={{ p: 4 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {apiError && (
              <Alert 
                severity="error" 
                sx={{ mb: 2 }}
                action={
                  <Button color="inherit" size="small" onClick={() => {
                    if (formData.role === "patient") {
                      fetchAvailablePatients();
                    } else if (staffRoles.includes(formData.role)) {
                      fetchAvailableStaff();
                    }
                  }}>
                    Retry
                  </Button>
                }
              >
                {apiError}
              </Alert>
            )}

            {/* Full Name */}
            <Box>
              <Typography fontWeight={500} mb={1}>
                Full Name <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                name="full_name"
                placeholder="Enter full name"
                value={formData.full_name}
                onChange={handleChange}
                fullWidth
                disabled={(formData.role === "patient" || staffRoles.includes(formData.role)) && formData.accountNumber !== ""}
              />
            </Box>

            {/* Email */}
            <Box>
              <Typography fontWeight={500} mb={1}>
                Email Address <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                name="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
                fullWidth
              />
            </Box>

            {/* Contact */}
            <Box>
              <Typography fontWeight={500} mb={1}>
                Contact Number <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                disabled={(formData.role === "patient" || staffRoles.includes(formData.role)) && formData.accountNumber !== ""}
              />
            </Box>

            {/* Access Level */}
            <Box>
              <Typography fontWeight={500} mb={1}>
                Access Level <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                select
                name="role"
                value={formData.role}
                onChange={handleChange}
                fullWidth
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (!selected) {
                      return (
                        <Typography color="text.secondary">
                          Select your access level
                        </Typography>
                      );
                    }
                    return selected.charAt(0).toUpperCase() + selected.slice(1);
                  },
                }}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="director">Director</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="nurse">Nurse</MenuItem>
                <MenuItem value="patient">Patient</MenuItem>
                <MenuItem value="social-worker">Social Worker</MenuItem>
                <MenuItem value="family-therapist">Family Therapist</MenuItem>
                <MenuItem value="psychiatrist">Psychiatrist</MenuItem>
                <MenuItem value="nurse-aid">Nurse Aid</MenuItem>
                <MenuItem value="psychologist">Psychologist</MenuItem>
                <MenuItem value="counsellor">Counsellor</MenuItem>
                <MenuItem value="occupational-therapist">Occupational Therapist</MenuItem>  
              </TextField>
            </Box>

            {/* STEP 4 & 5: Account/Employee Number Dropdown */}
            {showDropdown && (
              <Box>
                <Typography fontWeight={500} mb={1}>
                  {formData.role === "patient" ? "Account Number" : "Employee Number"} 
                  <span style={{ color: "red" }}>*</span>
                </Typography>
                
                {isLoading ? (
                  <Box display="flex" alignItems="center" gap={2}>
                    <CircularProgress size={24} />
                    <Typography>
                      Loading {formData.role === "patient" ? "account" : "employee"} numbers...
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <TextField
                      select
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={formData.role === "patient" ? handlePatientSelect : handleStaffSelect}
                      fullWidth
                      required
                      SelectProps={{
                        displayEmpty: true,
                        renderValue: (selected) => {
                          if (!selected) {
                            return (
                              <Typography color="text.secondary">
                                Select {formData.role === "patient" ? "account number" : "employee number"}
                              </Typography>
                            );
                          }
                          return selected;
                        },
                      }}
                    >
                      <MenuItem value="" disabled>
                        <Typography color="text.secondary">
                          -- Select {formData.role === "patient" ? "account number" : "employee number"} --
                        </Typography>
                      </MenuItem>
                      
                      {dataList.length === 0 ? (
                        <MenuItem disabled>
                          <Typography color="text.secondary">
                            No unassigned {formData.role === "patient" ? "patients" : "staff"} found
                          </Typography>
                        </MenuItem>
                      ) : (
                        dataList.map((item) => (
                        <MenuItem 
                          key={formData.role === "patient" ? item.accountNumber : item.employee_id} 
                          value={formData.role === "patient" ? item.accountNumber : item.employee_id}
                        >
                          {formData.role === "patient"
                            ? `${item.accountNumber} - ${item.fullName}`
                            : `${item.employee_id} - ${item.full_name}`}
                        </MenuItem>
                      ))
                      )}
                    </TextField>

                    {dataList.length === 0 && !isLoading && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        No unassigned {formData.role === "patient" ? "patients" : "staff members"} found. All {formData.role === "patient" ? "patients" : "staff"} already have accounts.
                      </Alert>
                    )}

                    {formData.accountNumber && (
                      <Alert severity="success" sx={{ mt: 2 }}>
                        Selected: {formData.accountNumber}
                      </Alert>
                    )}
                  </>
                )}
              </Box>
            )}

            {/* Password */}
            <Box>
              <Typography fontWeight={500} mb={1}>
                Password <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                type="password"
                name="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
              />
            </Box>

            {/* Actions */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                pt: 3,
              }}
            >
              <Button variant="outlined">Cancel</Button>
              <Button 
                type="submit" 
                variant="contained"
                disabled={loading || isLoading}
              >
                {loading ? <CircularProgress size={24} /> : "Register"}
              </Button>
              <Button variant="outlined">All Users</Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

export default Registration;