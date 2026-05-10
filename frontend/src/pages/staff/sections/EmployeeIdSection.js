import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  InputAdornment,
  Alert,
  Grid,
  CircularProgress,
  Typography,
  Button
} from "@mui/material";
import { useFormContext } from "react-hook-form";
import RefreshIcon from "@mui/icons-material/Refresh";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BadgeIcon from "@mui/icons-material/Badge";

// Token refresh function
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refresh");
    if (!refreshToken) return null;

    const response = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("access", data.access);
      return data.access;
    }
    return null;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  }
};

function EmployeeIdSection() {
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [idError, setIdError] = useState("");
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  
  const employeeId = watch("employeeId");

  // Generate employee ID on mount if auto is enabled
  useEffect(() => {
    if (autoGenerate && !employeeId) {
      generateEmployeeId();
    }
  }, [autoGenerate]); // Only run when autoGenerate changes

  const generateEmployeeId = async () => {
    setGenerating(true);
    setIdError("");
    
    try {
      let accessToken = localStorage.getItem("access");
      
      if (!accessToken) {
        setIdError("No access token found. Please login again.");
        return;
      }

      let response = await fetch("http://127.0.0.1:8000/api/staff/", {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      // If token expired, try to refresh
      if (response.status === 401) {
        const newToken = await refreshAccessToken();
        
        if (newToken) {
          accessToken = newToken;
          response = await fetch("http://127.0.0.1:8000/api/staff/", {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            }
          });
        } else {
          throw new Error("Session expired. Please login again.");
        }
      }

      const currentYear = new Date().getFullYear();

      if (response.ok) {
        const staff = await response.json();
        
        // Filter staff with employee IDs from current year
        const thisYearStaff = staff.filter(s => 
          s.employee_id && s.employee_id.startsWith(`EMP${currentYear}`)
        );
        
        if (thisYearStaff.length > 0) {
          // Extract sequence numbers and find the highest
          const sequences = thisYearStaff.map(s => {
            const match = s.employee_id.match(/EMP\d{4}(\d{4})/);
            return match ? parseInt(match[1], 10) : 0;
          });
          
          const maxSequence = Math.max(...sequences);
          const nextSequence = (maxSequence + 1).toString().padStart(4, '0');
          const newEmployeeId = `EMP${currentYear}${nextSequence}`;
          setValue("employeeId", newEmployeeId, { shouldValidate: true });
          console.log("Generated ID:", newEmployeeId); // Debug log
        } else {
          // First staff of the year
          const newEmployeeId = `EMP${currentYear}0001`;
          setValue("employeeId", newEmployeeId, { shouldValidate: true });
          console.log("First ID of year:", newEmployeeId); // Debug log
        }
      } else {
        // Fallback if can't fetch staff
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const newEmployeeId = `EMP${currentYear}${random}`;
        setValue("employeeId", newEmployeeId, { shouldValidate: true });
        console.log("Fallback ID:", newEmployeeId); // Debug log
      }
    } catch (error) {
      console.error("Error generating employee ID:", error);
      setIdError(error.message || "Failed to generate employee ID");
      
      // Fallback with random number
      const currentYear = new Date().getFullYear();
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const newEmployeeId = `EMP${currentYear}${random}`;
      setValue("employeeId", newEmployeeId, { shouldValidate: true });
    } finally {
      setGenerating(false);
    }
  };

  const toggleAutoGenerate = () => {
    setAutoGenerate(!autoGenerate);
    if (!autoGenerate) {
      // Switching to auto - generate one
      generateEmployeeId();
    } else {
      // Switching to manual - clear the field
      setValue("employeeId", "", { shouldValidate: true });
      setIdError("");
    }
  };

  // Validate employee ID format if manually entered
  const validateManualId = (value) => {
    if (!autoGenerate && value) {
      const pattern = /^EMP\d{8}$/; // EMP + 8 digits (YYYY + 4 digits)
      if (!pattern.test(value)) {
        return "Employee ID must be in format: EMPYYYYxxxx (e.g., EMP20240001)";
      }
    }
    return true;
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <BadgeIcon color="primary" />
          <Typography variant="subtitle1" fontWeight="600">
            Employee ID
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={autoGenerate}
              onChange={toggleAutoGenerate}
              color="primary"
              size="small"
            />
          }
          label={autoGenerate ? "Auto-generate" : "Enter manually"}
        />
      </Box>

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={autoGenerate ? 8 : 12}>
          <TextField
            fullWidth
            size="small"
            label="Employee ID"
            {...register("employeeId", { 
              required: !autoGenerate ? "Employee ID is required in manual mode" : false,
              validate: validateManualId
            })}
            error={!!errors.employeeId || !!idError}
            helperText={errors.employeeId?.message || idError}
            disabled={autoGenerate}
            placeholder={autoGenerate ? "Will be auto-generated" : "Enter employee ID (e.g., EMP20240001)"}
            value={employeeId || ""}
            InputProps={{
              startAdornment: autoGenerate && employeeId && (
                <InputAdornment position="start">
                  <AutoAwesomeIcon color="action" fontSize="small" />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        
        {autoGenerate && (
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="outlined"
              onClick={generateEmployeeId}
              disabled={generating}
              size="small"
              startIcon={generating ? <CircularProgress size={16} /> : <RefreshIcon />}
            >
              Generate New
            </Button>
          </Grid>
        )}
      </Grid>
      
      {autoGenerate && employeeId && !idError && (
        <Alert severity="info" sx={{ mt: 2 }} icon={<AutoAwesomeIcon />}>
          <strong>Generated Employee ID:</strong> {employeeId}
        </Alert>
      )}
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Format: EMPYYYYxxxx (e.g., EMP20240001, EMP20240002) where YYYY is the year
      </Typography>
    </Box>
  );
}

export default EmployeeIdSection;