import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Avatar,
  Chip,
  TextField,
  MenuItem,
  IconButton,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

function RelapseRiskMonitor() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem("access");

        const res = await axios.get(
          "http://127.0.0.1:8000/api/clients/ai-alerts/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setAlerts(res.data);
      } catch (error) {
        console.error("Error fetching alerts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  return (
    <Box>
      {/* HEADER */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Relapse Risk Monitor
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Monitor patients flagged with potential relapse risks.
      </Typography>

      {/* FILTER */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField placeholder="Search patient..." size="small" fullWidth />

        <TextField select size="small" defaultValue="all">
          <MenuItem value="all">All Risk Levels</MenuItem>
          <MenuItem value="high">High</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="low">Low</MenuItem>
        </TextField>
      </Stack>

      {/* TABLE */}
      <Paper sx={{ borderRadius: 3 }}>
        {/* HEADER ROW */}
        <Stack
          direction="row"
          sx={{
            px: 2,
            py: 2,
            fontWeight: "bold",
            borderBottom: "1px solid #eee",
            backgroundColor: "#fafafa",
          }}
        >
          <Box sx={{ width: "20%" }}>Patient</Box>
          <Box sx={{ width: "10%" }}>Risk Level</Box>
          <Box sx={{ width: "8%" }}>Score</Box>
          <Box sx={{ width: "12%" }}>Alert Type</Box>
          <Box sx={{ width: "15%" }}>Trigger Source</Box>
          <Box sx={{ width: "15%" }}>Message</Box>
          <Box sx={{ width: "12%" }}>Date & Time</Box>
          <Box sx={{ width: "8%" }}>Action</Box>
        </Stack>

        {/* DATA */}
        {loading ? (
          <Typography sx={{ p: 3 }}>Loading alerts...</Typography>
        ) : alerts.length === 0 ? (
          <Typography sx={{ p: 3 }}>No alerts yet</Typography>
        ) : (
          alerts.map((a, index) => (
            <Stack
              key={index}
              direction="row"
              alignItems="center"
              sx={{
                px: 2,
                py: 2,
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              {/* Patient */}
              <Box sx={{ width: "20%" }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar>{a.patient_name?.[0]}</Avatar>
                  <Typography>{a.patient_name}</Typography>
                </Stack>
              </Box>

              {/* Risk Level */}
              <Box sx={{ width: "10%" }}>
                <Chip
                  label={a.risk_level}
                  sx={{
                    backgroundColor:
                      a.risk_level === "HIGH"
                        ? "#ffebee"
                        : a.risk_level === "MEDIUM"
                        ? "#fff3e0"
                        : "#e8f5e9",
                    color:
                      a.risk_level === "HIGH"
                        ? "#d32f2f"
                        : a.risk_level === "MEDIUM"
                        ? "#f57c00"
                        : "#2e7d32",
                  }}
                />
              </Box>

              {/* Risk Score */}
              <Box sx={{ width: "8%" }}>
                <Typography fontWeight="bold">
                  {a.risk_score || 0}/10
                </Typography>
              </Box>

              {/* Alert Type */}
              <Box sx={{ width: "12%" }}>
                <Typography>{a.alert_type || a.prediction}</Typography>
              </Box>

              {/* Trigger Source */}
              <Box sx={{ width: "15%" }}>
                <Typography>
                  {a.trigger_source || "AI Model"}
                </Typography>
              </Box>

              {/* Message */}
              <Box sx={{ width: "15%" }}>
                {a.reasons?.map((r, i) => (
                  <Typography key={i} variant="body2">
                    "{r}"
                  </Typography>
                ))}
              </Box>

              {/* Date */}
              <Box sx={{ width: "12%" }}>
                <Typography variant="caption">
                  {new Date(a.created_at).toLocaleString()}
                </Typography>
              </Box>

              {/* Action */}
              <Box sx={{ width: "8%" }}>
                <IconButton
                  onClick={() => console.log("View alert:", a)}
                >
                  <VisibilityIcon />
                </IconButton>
              </Box>
            </Stack>
          ))
        )}
      </Paper>
    </Box>
  );
}

export default RelapseRiskMonitor;