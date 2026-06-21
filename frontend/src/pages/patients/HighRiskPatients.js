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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
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

function HighRiskPatients() {
  const [patients, setPatients] = useState([]);
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
        "http://127.0.0.1:8000/api/clients/alerts/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPatients(res.data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      setError("Failed to load high-risk patient alerts");
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
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      !searchTerm ||
      (patient.patient_name &&
        patient.patient_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRisk =
      riskFilter === "all" || patient.risk_level === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const getRiskColor = (riskLevel) => {
    if (
      riskLevel === "High" ||
      riskLevel === "Very High" ||
      riskLevel === "HIGH"
    )
      return "#dc2626";
    if (riskLevel === "Moderate" || riskLevel === "MEDIUM") return "#d97706";
    return "#16a34a";
  };

  const getRiskBackgroundColor = (riskLevel) => {
    if (
      riskLevel === "High" ||
      riskLevel === "Very High" ||
      riskLevel === "HIGH"
    )
      return "#fee2e2";
    if (riskLevel === "Moderate" || riskLevel === "MEDIUM") return "#fef3c7";
    return "#dcfce7";
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
            Alerts & Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-powered predictions and alerts for patients at risk of relapse.
            Monitor and manage high-risk patients effectively.
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
          <MenuItem value="Very High">Very High</MenuItem>
          <MenuItem value="High">High</MenuItem>
          <MenuItem value="Moderate">Moderate</MenuItem>
          <MenuItem value="Low">Low</MenuItem>
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
                <strong>AI Prediction</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Last Alert</strong>
              </TableCell>
              <TableCell sx={{ color: "white", textAlign: "center" }}>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      No high-risk patient alerts found
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
              filteredPatients.map((patient, index) => (
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
                        {patient.patient_name?.[0]?.toUpperCase()}
                      </Avatar>
                      <Typography>{patient.patient_name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={patient.risk_level}
                      sx={{
                        backgroundColor: getRiskBackgroundColor(
                          patient.risk_level
                        ),
                        color: getRiskColor(patient.risk_level),
                        fontWeight: "600",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: "600" }}>
                    {patient.risk_score || 0}%
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {patient.prediction}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {new Date(patient.created_at).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Tooltip title="View Alert Details">
                      <IconButton
                        color="primary"
                        onClick={() => handleView(patient)}
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
                              selectedAlert.risk_level
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
                          {selectedAlert.risk_score || 0}%
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Timestamp
                        </Typography>
                        <Typography variant="body1">
                          {new Date(
                            selectedAlert.created_at
                          ).toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Prediction & Reasons */}
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
                      🤖 AI Prediction
                    </Typography>
                    <Divider sx={{ mb: 2, borderColor: "#e0e0e0" }} />

                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {selectedAlert.prediction}
                    </Typography>

                    {selectedAlert.reasons &&
                    selectedAlert.reasons.length > 0 ? (
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "600", mb: 1 }}
                        >
                          Risk Factors:
                        </Typography>
                        <Stack spacing={1}>
                          {selectedAlert.reasons.map((reason, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                p: 1,
                                backgroundColor: "#fff9e6",
                                borderLeft: "4px solid #f57c00",
                                borderRadius: 1,
                              }}
                            >
                              <Typography variant="body2">
                                • {reason}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No specific risk factors recorded
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

export default HighRiskPatients;
