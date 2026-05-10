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
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

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
        }
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
    <Box >
      <Typography variant="h4" sx={{ mb: 3 }}>
        My Patients
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell><strong>Account #</strong></TableCell>
              <TableCell><strong>Full Name</strong></TableCell>
              <TableCell><strong>Age</strong></TableCell>
              <TableCell><strong>DOB</strong></TableCell>
              <TableCell><strong>Phone</strong></TableCell>
              <TableCell><strong>Occupation</strong></TableCell>
              <TableCell><strong>Marital Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No assigned patients
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient.id} hover>
                  <TableCell>{patient.accountNumber}</TableCell>
                  <TableCell>{patient.fullName}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{formatDate(patient.dob)}</TableCell>
                  <TableCell>{patient.phoneNumber}</TableCell>
                  <TableCell>{patient.occupation}</TableCell>
                  <TableCell>{patient.maritalStatus || "N/A"}</TableCell>

                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleView(patient)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
  open={dialogOpen} 
  onClose={handleCloseDialog}
  maxWidth="md"
  fullWidth
  scroll="paper"
>
  <DialogTitle>
    <Typography variant="h6">
      Patient Details: {selectedPatient?.fullName}
    </Typography>
  </DialogTitle>

  <Divider />

  <DialogContent dividers>
    {selectedPatient && (
      <Grid container spacing={3}>

        {/* 🔹 Personal Information */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                <strong>Personal Information</strong>
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Typography>Account: {selectedPatient.accountNumber}</Typography>
              <Typography>Full Name: {selectedPatient.fullName}</Typography>
              <Typography>DOB: {formatDate(selectedPatient.dob)}</Typography>
              <Typography>Age: {selectedPatient.age}</Typography>
              <Typography>Phone: {selectedPatient.phoneNumber}</Typography>
              <Typography>Occupation: {selectedPatient.occupation}</Typography>
              <Typography>Marital Status: {selectedPatient.maritalStatus || "N/A"}</Typography>
              <Typography>Address: {selectedPatient.address}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 🔹 Medical Info */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                <strong>Medical Info</strong>
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Typography>HIV Tested: {selectedPatient.hivTested ? "Yes" : "No"}</Typography>
              <Typography>TB Tested: {selectedPatient.tbTested ? "Yes" : "No"}</Typography>
              <Typography>Hypertension: {selectedPatient.hypertension ? "Yes" : "No"}</Typography>
              <Typography>Rehab: {selectedPatient.rehab ? "Yes" : "No"}</Typography>
              <Typography>Allergies: {selectedPatient.allergies}</Typography>
              <Typography>Medical History: {selectedPatient.medicalHistory}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 🔹 Mental & Behavioral */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                <strong>Mental & Behavioral</strong>
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Typography>
                Substance Abuse: {selectedPatient.substanceAbuseCharacteristics}
              </Typography>
              <Typography>
                See Things: {selectedPatient.seeThings ? "Yes" : "No"}
              </Typography>
              <Typography>
                Hear Voices: {selectedPatient.hearVoices ? "Yes" : "No"}
              </Typography>
              <Typography>
                Violent Tendencies: {selectedPatient.violentTendencies ? "Yes" : "No"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 🔹 Assigned Caregivers */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" color="primary" gutterBottom>
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

  <DialogActions>
    <Button onClick={handleCloseDialog}>Close</Button>
  </DialogActions>
</Dialog>
    </Box>
  );
}

export default MyPatients;