import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  Tooltip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";

function MyPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("access");

      const response = await fetch(
        "http://127.0.0.1:8000/api/clients/my-patients/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      setPatients(data);
    } catch (err) {
      setError("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (patient) => {
    setSelectedPatient(patient);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPatient(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: "bold", color: "#1a3a52", mb: 1 }}
        >
          My Patients
        </Typography>
        <Typography variant="body2" color="text.secondary">
          List of patients assigned to you. You can view patient details.
        </Typography>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <Table sx={{ minWidth: 800 }}>
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
                <strong>Account #</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Full Name</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Age</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>DOB</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Phone</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Occupation</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Marital Status</strong>
              </TableCell>
              <TableCell sx={{ color: "white", textAlign: "center" }}>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      No patients assigned yet
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Your assigned patients will appear here
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow
                  key={patient.id}
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
                    {patient.accountNumber}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "500" }}>
                    {patient.fullName}
                  </TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{formatDate(patient.dob)}</TableCell>
                  <TableCell>{patient.phoneNumber}</TableCell>
                  <TableCell>{patient.occupation}</TableCell>
                  <TableCell>{patient.maritalStatus || "N/A"}</TableCell>

                  <TableCell sx={{ textAlign: "center" }}>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="center"
                    >
                      <Tooltip title="View Details">
                        <IconButton
                          color="primary"
                          onClick={() => handleView(patient)}
                          size="small"
                          sx={{ "&:hover": { backgroundColor: "#e3f2fd" } }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Patient Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="lg"
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
            Patient Details: {selectedPatient?.fullName}
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
          {selectedPatient && (
            <Grid container spacing={3}>
              {/* 🔹 Personal Information */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      color="primary"
                      gutterBottom
                    >
                      <strong>Personal Information</strong>
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Typography>
                      Account: {selectedPatient.accountNumber}
                    </Typography>
                    <Typography>
                      Full Name: {selectedPatient.fullName}
                    </Typography>
                    <Typography>
                      DOB: {formatDate(selectedPatient.dob)}
                    </Typography>
                    <Typography>Age: {selectedPatient.age}</Typography>
                    <Typography>
                      Phone: {selectedPatient.phoneNumber}
                    </Typography>
                    <Typography>
                      Occupation: {selectedPatient.occupation}
                    </Typography>
                    <Typography>
                      Marital Status: {selectedPatient.maritalStatus || "N/A"}
                    </Typography>
                    <Typography>Address: {selectedPatient.address}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* 🔹 Medical Info */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      color="primary"
                      gutterBottom
                    >
                      <strong>Medical Info</strong>
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Typography>
                      HIV Tested: {selectedPatient.hivTested ? "Yes" : "No"}
                    </Typography>
                    <Typography>
                      TB Tested: {selectedPatient.tbTested ? "Yes" : "No"}
                    </Typography>
                    <Typography>
                      Hypertension:{" "}
                      {selectedPatient.hypertension ? "Yes" : "No"}
                    </Typography>
                    <Typography>
                      Rehab: {selectedPatient.rehab ? "Yes" : "No"}
                    </Typography>
                    <Typography>
                      Allergies: {selectedPatient.allergies}
                    </Typography>
                    <Typography>
                      Medical History: {selectedPatient.medicalHistory}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* 🔹 Mental & Behavioral */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      color="primary"
                      gutterBottom
                    >
                      <strong>Mental & Behavioral</strong>
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Typography>
                      Substance Abuse:{" "}
                      {selectedPatient.substanceAbuseCharacteristics}
                    </Typography>
                    <Typography>
                      See Things: {selectedPatient.seeThings ? "Yes" : "No"}
                    </Typography>
                    <Typography>
                      Hear Voices: {selectedPatient.hearVoices ? "Yes" : "No"}
                    </Typography>
                    <Typography>
                      Violent Tendencies:{" "}
                      {selectedPatient.violentTendencies ? "Yes" : "No"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* 🔹 Assigned Caregivers */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      color="primary"
                      gutterBottom
                    >
                      <strong>Assigned Social Workers</strong>
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {selectedPatient.caregivers?.length > 0 ? (
                      selectedPatient.caregivers.map((cg) => (
                        <Typography key={cg.id || cg}>
                          {cg.full_name || cg}
                        </Typography>
                      ))
                    ) : (
                      <Typography>No caregivers assigned</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            padding: 2,
            backgroundColor: "#f8f9fb",
            borderTop: "1px solid #e0e0e0",
            justifyContent: "flex-end",
          }}
        >
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            sx={{
              background: "linear-gradient(to right, #1976d2, #0d47a1)",
              color: "white",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MyPatients;
