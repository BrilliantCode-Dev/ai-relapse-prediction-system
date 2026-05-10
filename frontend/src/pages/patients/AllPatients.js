import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Button,
  Box,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
} from "@mui/material";
import { Stack } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useNavigate } from "react-router-dom";

function AllPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [selectedCaregiver, setSelectedCaregiver] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      navigate("/login");
      return;
    }

    fetchPatients(token);
  }, [navigate]);

  const fetchPatients = async (token) => {
    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:8000/api/clients/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          return fetchPatients(localStorage.getItem("access"));
        } else {
          handleLogout();
          return;
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Patients data:", data);
      setPatients(data);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      const response = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access", data.access);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleView = (patient) => {
    setSelectedPatient(patient);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPatient(null);
  };

  const handleEdit = (id) => {
    console.log("Edit patient", id);
    navigate(`/director/patients/edit-patient/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        const token = localStorage.getItem("access");
        const response = await fetch(
          `http://127.0.0.1:8000/api/clients/${id}/`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          setPatients(patients.filter((p) => p.id !== id));
          console.log("Patient deleted successfully");
        } else {
          throw new Error("Failed to delete patient");
        }
      } catch (err) {
        console.error("Delete error:", err);
        setError("Failed to delete patient");
      }
    }
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Render boolean with chip
  const renderBoolean = (value) => {
    if (value === null || value === undefined) return "N/A";
    return value ? "Yes" : "No";
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
        <Button variant="contained" onClick={handleLogout}>
          Back to Login
        </Button>
      </Box>
    );
  }

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("access");

      const response = await fetch("http://127.0.0.1:8000/api/staff/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      // Filter only social workers (optional)
      const socialWorkers = data.filter(
        (staff) => staff.role === "social_worker",
      );

      setStaffList(socialWorkers);
    } catch (err) {
      console.error("Error fetching staff:", err);
    }
  };

  const handleOpenAssign = (clientId) => {
    setSelectedClientId(clientId);
    setAssignDialogOpen(true);
    fetchStaff();
  };

  const handleAssignCaregiver = async () => {
    try {
      const token = localStorage.getItem("access");

      const response = await fetch(
        "http://127.0.0.1:8000/api/clients/assign-caregiver/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            client_id: selectedClientId,
            caregiver_id: selectedCaregiver,
          }),
        },
      );

      if (response.ok) {
        alert("Caregiver assigned successfully");
        setAssignDialogOpen(false);
        setSelectedCaregiver("");
      } else {
        alert("Failed to assign caregiver");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = (format) => {
    if (format === "csv") {
      // Create CSV content
      const headers = [
        "Account Number",
        "Full Name",
        "Age",
        "Date of Birth",
        "Phone Number",
        "Occupation",
        "Marital Status",
        "Address",
        "Education Status",
        "Religious Affiliation",
      ];
      const csvContent = [
        headers.join(","),
        ...patients.map((patient) =>
          [
            patient.accountNumber,
            `"${patient.fullName}"`,
            patient.age,
            patient.dob,
            patient.phoneNumber,
            `"${patient.occupation || ""}"`,
            `"${patient.maritalStatus || ""}"`,
            `"${patient.address || ""}"`,
            `"${patient.educationStatus || ""}"`,
            `"${patient.religiousAffiliation || ""}"`,
          ].join(","),
        ),
      ].join("\n");

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `patients_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "pdf") {
      // For PDF, we'll use a simple approach - you might want to use a library like jsPDF
      alert(
        "PDF download feature will be implemented with a PDF library like jsPDF",
      );
    }
  };

  return (
    <Box sx={{ backgroundColor: "#f5f7fa", minHeight: "100vh"}}>
      {/* Header Section with Download Options */}
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
            All Patients
          </Typography>
          <Typography variant="body2" color="text.secondary">
            List of all registered patients in the system. You can view, edit,
            assign caregivers, or delete patient records.
          </Typography>
        </Box>

      
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
                      No patients found
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Start by adding your first patient
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate("/director/patients/new-patient")}
                      sx={{
                        background:
                          "linear-gradient(to right, #1976d2, #0d47a1)",
                      }}
                    >
                      + Add First Patient
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient, index) => (
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

                      <Tooltip title="Edit Patient">
                        <IconButton
                          color="success"
                          onClick={() => handleEdit(patient.id)}
                          size="small"
                          sx={{ "&:hover": { backgroundColor: "#e8f5e9" } }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Assign Caregiver">
                        <IconButton
                          color="info"
                          onClick={() => handleOpenAssign(patient.id)}
                          size="small"
                          sx={{ "&:hover": { backgroundColor: "#e1f5fe" } }}
                        >
                          <PersonAddIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete Patient">
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(patient.id)}
                          size="small"
                          sx={{ "&:hover": { backgroundColor: "#ffebee" } }}
                        >
                          <DeleteIcon fontSize="small" />
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
            <Grid container spacing={2}>
              {/* Personal Information */}
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
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      👤 Personal Information
                    </Typography>
                    <Divider sx={{ mb: 2, borderColor: "#e0e0e0" }} />

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Account Number
                        </Typography>
                        <Typography variant="body1">
                          {selectedPatient.accountNumber}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Full Name
                        </Typography>
                        <Typography variant="body1">
                          {selectedPatient.fullName}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Date of Birth
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(selectedPatient.dob)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Age
                        </Typography>
                        <Typography variant="body1">
                          {selectedPatient.age}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Marital Status
                        </Typography>
                        <Typography variant="body1">
                          {selectedPatient.maritalStatus || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Phone Number
                        </Typography>
                        <Typography variant="body1">
                          {selectedPatient.phoneNumber}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Occupation
                        </Typography>
                        <Typography variant="body1">
                          {selectedPatient.occupation}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Education Status
                        </Typography>
                        <Typography variant="body1">
                          {selectedPatient.educationStatus || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Religious Affiliation
                        </Typography>
                        <Typography variant="body1">
                          {selectedPatient.religiousAffiliation || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Address
                        </Typography>
                        <Typography variant="body1">
                          {selectedPatient.address}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Date Registered
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(selectedPatient.date)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Medical Information */}
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
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      ⚕️ Medical Information
                    </Typography>
                    <Divider sx={{ mb: 2, borderColor: "#e0e0e0" }} />

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Counselling
                        </Typography>
                        <Typography variant="body1">
                          {renderBoolean(selectedPatient.counselling)}
                        </Typography>
                        {selectedPatient.counsellingDetails && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            {selectedPatient.counsellingDetails}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          HIV Tested
                        </Typography>
                        <Typography variant="body1">
                          {renderBoolean(selectedPatient.hivTested)}
                        </Typography>
                        {selectedPatient.hivDetails && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            {selectedPatient.hivDetails}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          TB Tested
                        </Typography>
                        <Typography variant="body1">
                          {renderBoolean(selectedPatient.tbTested)}
                        </Typography>
                        {selectedPatient.tbDetails && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            {selectedPatient.tbDetails}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Hypertension
                        </Typography>
                        <Typography variant="body1">
                          {renderBoolean(selectedPatient.hypertension)}
                        </Typography>
                        {selectedPatient.hypertensionDetails && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            {selectedPatient.hypertensionDetails}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Rehab History
                        </Typography>
                        <Typography variant="body1">
                          {renderBoolean(selectedPatient.rehab)}
                        </Typography>
                        {selectedPatient.rehabHistory && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            {selectedPatient.rehabHistory}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Physical Health Problems
                        </Typography>
                        <Typography variant="body1">
                          {selectedPatient.physicalHealthProblems}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Medical History
                        </Typography>
                        <Typography variant="body1">
                          {selectedPatient.medicalHistory}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Allergies
                        </Typography>
                        <Typography variant="body1">
                          {selectedPatient.allergies}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Mental & Behavioral Assessment */}
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
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      🧠 Mental & Behavioral Assessment
                    </Typography>
                    <Divider sx={{ mb: 2, borderColor: "#e0e0e0" }} />

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Substance Abuse Characteristics
                        </Typography>
                        <Typography variant="body1">
                          {selectedPatient.substanceAbuseCharacteristics}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          See Things
                        </Typography>
                        <Typography variant="body1">
                          {renderBoolean(selectedPatient.seeThings)}
                        </Typography>
                        {selectedPatient.seeThingsDetails && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            {selectedPatient.seeThingsDetails}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Hear Voices
                        </Typography>
                        <Typography variant="body1">
                          {renderBoolean(selectedPatient.hearVoices)}
                        </Typography>
                        {selectedPatient.hearVoicesDetails && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            {selectedPatient.hearVoicesDetails}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Violent Tendencies
                        </Typography>
                        <Typography variant="body1">
                          {renderBoolean(selectedPatient.violentTendencies)}
                        </Typography>
                        {selectedPatient.violentTendenciesDetails && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            {selectedPatient.violentTendenciesDetails}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Weight Loss
                        </Typography>
                        <Typography variant="body1">
                          {renderBoolean(selectedPatient.weightLoss)}
                        </Typography>
                        {selectedPatient.weightLossDetails && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            {selectedPatient.weightLossDetails}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Need Assistance
                        </Typography>
                        <Typography variant="body1">
                          {renderBoolean(selectedPatient.needAssistance)}
                        </Typography>
                        {selectedPatient.needAssistanceDetails && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            {selectedPatient.needAssistanceDetails}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Assigned Social Workers
                        </Typography>

                        {selectedPatient.caregivers &&
                        selectedPatient.caregivers.length > 0 ? (
                          selectedPatient.caregivers.map((cg) => (
                            <Chip
                              key={cg.id || cg}
                              label={cg.full_name || cg}
                              color="primary"
                              size="small"
                              sx={{ mr: 1, mt: 1 }}
                            />
                          ))
                        ) : (
                          <Typography variant="body1">None assigned</Typography>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Files & Metadata */}
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
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      📁 Files & Metadata
                    </Typography>
                    <Divider sx={{ mb: 2, borderColor: "#e0e0e0" }} />

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Patient Picture
                        </Typography>
                        {selectedPatient.patientPicture ? (
                          <Button
                            variant="outlined"
                            size="small"
                            href={selectedPatient.patientPicture}
                            target="_blank"
                            sx={{ mt: 1 }}
                          >
                            View Photo
                          </Button>
                        ) : (
                          <Typography variant="body1">No photo</Typography>
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Signature
                        </Typography>
                        {selectedPatient.signature ? (
                          <Button
                            variant="outlined"
                            size="small"
                            href={selectedPatient.signature}
                            target="_blank"
                            sx={{ mt: 1 }}
                          >
                            View Signature
                          </Button>
                        ) : (
                          <Typography variant="body1">No signature</Typography>
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Created At
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(selectedPatient.created_at)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Updated At
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(selectedPatient.updated_at)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          User Account
                        </Typography>
                        <Typography variant="body1">
                          {selectedPatient.user
                            ? `Linked to user ID: ${selectedPatient.user}`
                            : "No user account linked"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, backgroundColor: "#f8f9fb", gap: 2 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ borderColor: "#ccc", color: "#333" }}
          >
            Close
          </Button>
          <Button
            onClick={() => {
              handleCloseDialog();
              handleEdit(selectedPatient?.id);
            }}
            variant="contained"
            sx={{
              background: "linear-gradient(to right, #1976d2, #0d47a1)",
              color: "white",
            }}
          >
            Edit Patient
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
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
            fontWeight: "bold",
            pb: 2,
          }}
        >
          Assign Social Worker
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ backgroundColor: "#f8f9fb", p: 3, mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel sx={{ fontWeight: "500" }}>
              Select Social Worker
            </InputLabel>
            <Select
              value={selectedCaregiver}
              onChange={(e) => setSelectedCaregiver(e.target.value)}
              label="Select Social Worker"
              sx={{
                borderRadius: 1,
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "#1976d2",
                  },
                },
              }}
            >
              {staffList.length === 0 ? (
                <MenuItem disabled>No social workers available</MenuItem>
              ) : (
                staffList.map((staff) => (
                  <MenuItem key={staff.id} value={staff.id}>
                    <strong>{staff.full_name}</strong>{" "}
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "0.85rem",
                        color: "#666",
                      }}
                    >
                      ({staff.role.replace(/_/g, " ").toUpperCase()})
                    </span>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, backgroundColor: "#f8f9fb", gap: 2 }}>
          <Button
            onClick={() => {
              setAssignDialogOpen(false);
              setSelectedCaregiver("");
            }}
            variant="outlined"
            sx={{ borderColor: "#ccc", color: "#333" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAssignCaregiver}
            disabled={!selectedCaregiver}
            sx={{
              background: "linear-gradient(to right, #1976d2, #0d47a1)",
              color: "white",
            }}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AllPatients;
