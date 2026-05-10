import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Stack, 
  FormControlLabel, 
  Switch, 
  TextField, 
  InputAdornment,
  IconButton,
  Tooltip,
  Alert
} from "@mui/material";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Button from "../../components/forms/Button";
import PersonalInfoSection from "./sections/PersonalInfoSection";
import MedicalInfoSection from "./sections/MedicalInfoSection";
import MentalAssessmentSection from "./sections/MentalAssessmentSection";
import FileUploadSection from "./sections/FileUploadSection";
import RefreshIcon from "@mui/icons-material/Refresh";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BadgeIcon from "@mui/icons-material/Badge";

function NewPatient() {
  const [autoGenerateAccount, setAutoGenerateAccount] = useState(true);
  const [generatingAccount, setGeneratingAccount] = useState(false);
  const [accountError, setAccountError] = useState("");
  
  const methods = useForm({
    defaultValues: {
      accountNumber: "",
    }
  });

  const navigate = useNavigate();
  const { reset, setValue, watch } = methods;
  const accountNumber = watch("accountNumber");

  // Generate account number on mount if auto is enabled
  useEffect(() => {
    if (autoGenerateAccount) {
      generateAccountNumber();
    }
  }, [autoGenerateAccount]);

  // Function to generate account number with year
  const generateAccountNumber = async () => {
    setGeneratingAccount(true);
    setAccountError("");
    
    try {
      const accessToken = localStorage.getItem("access");
      const currentYear = new Date().getFullYear();
      
      // Try to get existing patients to determine the next sequence number
      const response = await fetch("http://localhost:8000/api/clients/", {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const patients = await response.json();
        
        // Filter patients with account numbers from current year
        const thisYearPatients = patients.filter(p => 
          p.accountNumber && p.accountNumber.startsWith(`P${currentYear}`)
        );
        
        if (thisYearPatients.length > 0) {
          // Extract sequence numbers and find the highest
          const sequences = thisYearPatients.map(p => {
            const match = p.accountNumber.match(/P\d{4}(\d{4})/);
            return match ? parseInt(match[1], 10) : 0;
          });
          
          const maxSequence = Math.max(...sequences);
          const nextSequence = (maxSequence + 1).toString().padStart(4, '0');
          const newAccountNumber = `P${currentYear}${nextSequence}`;
          setValue("accountNumber", newAccountNumber);
        } else {
          // First patient of the year
          const newAccountNumber = `P${currentYear}0001`;
          setValue("accountNumber", newAccountNumber);
        }
      } else {
        // Fallback if can't fetch patients
        const newAccountNumber = `P${currentYear}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        setValue("accountNumber", newAccountNumber);
      }
    } catch (error) {
      console.error("Error generating account number:", error);
      // Fallback with random number
      const currentYear = new Date().getFullYear();
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      setValue("accountNumber", `P${currentYear}${random}`);
    } finally {
      setGeneratingAccount(false);
    }
  };

  const toggleAutoGenerate = () => {
    setAutoGenerateAccount(!autoGenerateAccount);
    if (!autoGenerateAccount) {
      // Switching to auto - generate one
      generateAccountNumber();
    } else {
      // Switching to manual - clear the field
      setValue("accountNumber", "");
      setAccountError("");
    }
  };

  const handleClear = () => {
    reset();
    if (autoGenerateAccount) {
      generateAccountNumber();
    }
  };

  const handleViewPatients = () => {
    navigate("/director/patients/all-patients");
  };

  const onSubmit = async (data) => {
    try {
      // Validate account number in manual mode
      if (!autoGenerateAccount && !data.accountNumber) {
        setAccountError("Account number is required in manual mode");
        return;
      }

      // Validate account number format if manually entered
      if (!autoGenerateAccount && data.accountNumber) {
        const pattern = /^P\d{8}$/; // P + 8 digits (YYYY + 4 digits)
        if (!pattern.test(data.accountNumber)) {
          setAccountError("Account number must be in format: PYYYYxxxx (e.g., P20240001)");
          return;
        }
      }

      const formData = new FormData();

      formData.append("date", data.date || "");
      formData.append("dob", data.dob || "");

      Object.keys(data).forEach((key) => {
        if (
          key !== "date" &&
          key !== "dob" &&
          key !== "patientPicture" &&
          key !== "signature"
        ) {
          formData.append(key, data[key] ?? "");
        }
      });

      if (data.patientPicture) {
        formData.append("patientPicture", data.patientPicture);
      }

      if (data.signature) {
        formData.append("signature", data.signature);
      }

      let accessToken = localStorage.getItem("access");

      if (!accessToken) {
        alert("You are not logged in. Please login again.");
        navigate("/login");
        return;
      }

      // Try to send the request
      let response = await fetch("http://localhost:8000/api/clients/create/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      // If token expired, try to refresh it once
      if (response.status === 401) {
        console.log("Token expired, attempting to refresh...");
        
        const refreshToken = localStorage.getItem("refresh");
        
        if (refreshToken) {
          const refreshResponse = await fetch("http://localhost:8000/api/token/refresh/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              refresh: refreshToken,
            }),
          });

          if (refreshResponse.ok) {
            const newTokens = await refreshResponse.json();
            localStorage.setItem("access", newTokens.access);
            
            response = await fetch("http://localhost:8000/api/clients/create/", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${newTokens.access}`,
              },
              body: formData,
            });
          } else {
            alert("Your session has expired. Please login again.");
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            localStorage.removeItem("user");
            navigate("/login");
            return;
          }
        } else {
          alert("Your session has expired. Please login again.");
          navigate("/login");
          return;
        }
      }

      const responseText = await response.text();
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        result = { message: responseText };
      }

      if (response.ok) {
        alert(`Patient saved successfully! Account Number: ${data.accountNumber}`);
        methods.reset();
        if (autoGenerateAccount) {
          generateAccountNumber(); // Generate new number for next patient
        }
      } else {
        alert("Failed: " + JSON.stringify(result));
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("An error occurred: " + error.message);
    }
  };

  return (
    <FormProvider {...methods}>
      <Box>
        <Typography variant="h5" fontWeight="bold">
          New Patient Admission
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Please complete all required fields
        </Typography>

        {/* Account Number Section */}
        <Paper elevation={1} sx={{ p: 2.5, mb: 3, bgcolor: '#f8f9fa' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <BadgeIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Account Number
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={autoGenerateAccount}
                  onChange={toggleAutoGenerate}
                  color="primary"
                />
              }
              label={autoGenerateAccount ? "Auto-generate" : "Enter manually"}
            />
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              fullWidth
              label="Account Number"
              {...methods.register("accountNumber")}
              disabled={autoGenerateAccount}
              error={!!accountError}
              helperText={accountError}
              placeholder={autoGenerateAccount ? "Will be auto-generated" : "Enter account number (e.g., P20240001)"}
              InputProps={{
                startAdornment: autoGenerateAccount && (
                  <InputAdornment position="start">
                    <AutoAwesomeIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: autoGenerateAccount && (
                  <InputAdornment position="end">
                    <Tooltip title="Generate new number">
                      <IconButton 
                        onClick={generateAccountNumber}
                        disabled={generatingAccount}
                        edge="end"
                      >
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
          </Box>
          
          {autoGenerateAccount && accountNumber && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <strong>Generated Account Number:</strong> {accountNumber}
            </Alert>
          )}
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Format: PYYYYxxxx (e.g., P20240001, P20240002) where YYYY is the year
          </Typography>
        </Paper>

        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <Paper elevation={1} sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Personal Information
              </Typography>
              <PersonalInfoSection />
            </Paper>

            <Paper elevation={1} sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Medical Information
              </Typography>
              <MedicalInfoSection />
            </Paper>

            <Paper elevation={1} sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Mental & Behavioral Assessment
              </Typography>
              <MentalAssessmentSection />
            </Paper>

            <Paper elevation={1} sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Declaration
              </Typography>
              <FileUploadSection />
            </Paper>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button text="All Patients" onClick={handleViewPatients} />
              <Button text="Clear Form" onClick={handleClear} />
              <Button type="submit" text="Register Patient" />
            </Box>
          </Stack>
        </form>
      </Box>
    </FormProvider>
  );
}

export default NewPatient;