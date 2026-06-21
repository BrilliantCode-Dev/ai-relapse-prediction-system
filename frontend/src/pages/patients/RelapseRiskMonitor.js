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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Divider,
  Grid,
  Tooltip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";

function RelapseRiskMonitor() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access");

      const res = await axios.get(
        "http://127.0.0.1:8000/api/clients/ai-alerts/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setAlerts(res.data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      setError("Failed to load relapse risk alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (alert) => {
    setSelectedAlert(alert);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAlert(null);
  };

  // Filter alerts based on search and risk level
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      !searchTerm ||
      (alert.patient_name &&
        alert.patient_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRisk =
      riskFilter === "all" || alert.risk_level === riskFilter.toUpperCase();
    return matchesSearch && matchesRisk;
  });

  const getRiskColor = (riskLevel) => {
    if (riskLevel === "HIGH") return "#d32f2f";
    if (riskLevel === "MEDIUM") return "#f57c00";
    return "#2e7d32";
  };

  const getRiskBackgroundColor = (riskLevel) => {
    if (riskLevel === "HIGH") return "#ffebee";
    if (riskLevel === "MEDIUM") return "#fff3e0";
    return "#e8f5e9";
  };

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

  if (error) {
    return (
      <Box sx={{ m: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchAlerts}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      {/* Header Section */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 3,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: "bold", color: "#1a3a52", mb: 1 }}
          >
            Relapse Risk Monitor
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor patients flagged with potential relapse risks. View
            AI-generated alerts and risk assessments.
          </Typography>
        </Box>
      </Box>

      {/* Filter Section */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Search patient name..."
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            backgroundColor: "white",
            borderRadius: 1,
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: "#1976d2",
              },
            },
          }}
        />

        <TextField
          select
          size="small"
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          sx={{
            minWidth: 200,
            backgroundColor: "white",
            borderRadius: 1,
          }}
        >
          <MenuItem value="all">All Risk Levels</MenuItem>
          <MenuItem value="high">High Risk</MenuItem>
          <MenuItem value="medium">Medium Risk</MenuItem>
          <MenuItem value="low">Low Risk</MenuItem>
        </TextField>
      </Stack>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <Table sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow
              sx={{
                background: "linear-gradient(to right, #1976d2, #0d47a1)",
                "& th": {
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "0.95rem",
                  padding: "16px",
                  borderBottom: "none",
                },
              }}
            >
              <TableCell sx={{ color: "white" }}>
                <strong>Patient Name</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Risk Level</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Risk Score</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Alert Type</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Trigger Source</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Date & Time</strong>
              </TableCell>
              <TableCell sx={{ color: "white", textAlign: "center" }}>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAlerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      No relapse risk alerts found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm || riskFilter !== "all"
                        ? "Try adjusting your filters"
                        : "All patients are currently at low risk"}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filteredAlerts.map((alert, index) => (
                <TableRow
                  key={index}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#f5f7fa",
                      transition: "background-color 0.2s",
                    },
                    borderBottom: "1px solid #e0e0e0",
                    "&:last-child td": { borderBottom: "none" },
                  }}
                >
                  <TableCell sx={{ fontWeight: "500" }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {alert.patient_name?.[0]?.toUpperCase()}
                      </Avatar>
                      <Typography>{alert.patient_name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={alert.risk_level}
                      sx={{
                        backgroundColor: getRiskBackgroundColor(
                          alert.risk_level,
                        ),
                        color: getRiskColor(alert.risk_level),
                        fontWeight: "600",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: "600" }}>
                    {alert.risk_score || 0}/10
                  </TableCell>
                  <TableCell>{alert.alert_type || alert.prediction}</TableCell>
                  <TableCell>{alert.trigger_source || "AI Model"}</TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {new Date(alert.created_at).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Tooltip title="View Alert Details">
                      <IconButton
                        color="primary"
                        onClick={() => handleView(alert)}
                        size="small"
                        sx={{ "&:hover": { backgroundColor: "#e3f2fd" } }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Alert Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(to right, #1976d2, #0d47a1)",
            color: "white",
            pb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "white" }}>
            Alert Details: {selectedAlert?.patient_name}
          </Typography>
          <IconButton
            onClick={handleCloseDialog}
            size="small"
            sx={{ color: "white" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent dividers sx={{ backgroundColor: "#f8f9fb", p: 3 }}>
          {selectedAlert && (
            <Grid container spacing={3}>
              {/* Alert Information */}
              <Grid item xs={12} md={6}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    border: "2px solid #e0e0e0",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      borderColor: "#1976d2",
                    },
                    transition: "all 0.3s",
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: "#1976d2",
                        fontWeight: "bold",
                        mb: 2,
                      }}
                    >
                      🚨 Alert Information
                    </Typography>
                    <Divider sx={{ mb: 2, borderColor: "#e0e0e0" }} />

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Patient Name
                        </Typography>
                        <Typography variant="body1">
                          {selectedAlert.patient_name}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Risk Level
                        </Typography>
                        <Chip
                          label={selectedAlert.risk_level}
                          sx={{
                            backgroundColor: getRiskBackgroundColor(
                              selectedAlert.risk_level,
                            ),
                            color: getRiskColor(selectedAlert.risk_level),
                            fontWeight: "600",
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Risk Score
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: "600" }}>
                          {selectedAlert.risk_score || 0}/10
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Alert Type
                        </Typography>
                        <Typography variant="body1">
                          {selectedAlert.alert_type || selectedAlert.prediction}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Trigger Source
                        </Typography>
                        <Typography variant="body1">
                          {selectedAlert.trigger_source || "AI Model"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Timestamp
                        </Typography>
                        <Typography variant="body1">
                          {new Date(selectedAlert.created_at).toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Reasons/Message */}
              <Grid item xs={12} md={6}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    border: "2px solid #e0e0e0",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      borderColor: "#1976d2",
                    },
                    transition: "all 0.3s",
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: "#1976d2",
                        fontWeight: "bold",
                        mb: 2,
                      }}
                    >
                      💡 Risk Reasons
                    </Typography>
                    <Divider sx={{ mb: 2, borderColor: "#e0e0e0" }} />

                    {selectedAlert.reasons &&
                    selectedAlert.reasons.length > 0 ? (
                      <Stack spacing={1.5}>
                        {selectedAlert.reasons.map((reason, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              p: 1.5,
                              backgroundColor: "#fff9e6",
                              borderLeft: "4px solid #f57c00",
                              borderRadius: 1,
                            }}
                          >
                            <Typography variant="body2">{reason}</Typography>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No specific reasons recorded
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, backgroundColor: "#f8f9fb" }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RelapseRiskMonitor;
