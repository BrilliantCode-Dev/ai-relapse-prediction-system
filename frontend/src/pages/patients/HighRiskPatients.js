import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Avatar,
  Chip,
  Divider,
} from "@mui/material";

function HighRiskPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem("access");

        const res = await axios.get(
          "http://127.0.0.1:8000/api/clients/alerts/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setPatients(res.data);
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
      {/* PAGE TITLE */}
      <Typography variant="h4" gutterBottom>
        Alerts & Relapse Risk
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        AI-powered predictions and alerts for patients at risk of relapse
      </Typography>

      {/* CARD */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h6">High Risk Patients</Typography>
            <Typography variant="caption" color="text.secondary">
              Patients with high probability of relapse based on AI prediction
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* TABLE HEADER */}
        <Stack
          direction="row"
          spacing={4}
          sx={{ px: 1, py: 1, fontWeight: "bold", color: "gray" }}
        >
          <Box sx={{ width: "25%" }}>Patient</Box>
          <Box sx={{ width: "15%" }}>Risk Score</Box>
          <Box sx={{ width: "15%" }}>Risk Level</Box>
          <Box sx={{ width: "30%" }}>AI Prediction</Box>
          <Box sx={{ width: "15%" }}>Last Alert</Box>
        </Stack>

        <Divider />

        {loading ? (
          <Typography>Loading alerts...</Typography>
        ) : patients.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <Typography>No alerts yet</Typography>
          </Box>
        ) : (
          patients.map((p, index) => (
            <Stack
              key={index}
              direction="row"
              spacing={4}
              alignItems="center"
              sx={{ px: 1, py: 2 }}
            >
              {/* Patient */}
              <Box sx={{ width: "25%" }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar>{p.patient_name?.[0]}</Avatar>
                  <Typography>{p.patient_name}</Typography>
                </Stack>
              </Box>

              {/* Risk Score */}
              <Box sx={{ width: "15%" }}>
                <Typography>{p.risk_score || 0}%</Typography>
              </Box>

              {/* Risk Level */}
              <Box sx={{ width: "15%" }}>
                <Chip
                  label={p.risk_level}
                  color={
                    p.risk_level === "Very High"
                      ? "error"
                      : p.risk_level === "High"
                        ? "warning"
                        : "success"
                  }
                />
              </Box>

              {/* Prediction + Reasons */}
              <Box sx={{ width: "30%" }}>
                <Typography>{p.prediction}</Typography>

                {p.reasons?.map((r, i) => (
                  <Typography key={i} variant="caption" display="block">
                    • {r}
                  </Typography>
                ))}
              </Box>

              {/* Time */}
              <Box sx={{ width: "15%" }}>
                <Typography variant="caption">
                  {new Date(p.created_at).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          ))
        )}
      </Paper>
    </Box>
  );
}

export default HighRiskPatients;
