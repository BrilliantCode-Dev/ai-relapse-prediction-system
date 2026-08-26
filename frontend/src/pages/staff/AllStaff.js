import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Divider,
  Grid,
  Tooltip,
  Stack,
  TextField,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";

function AllStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access");
      const response = await axios.get("http://127.0.0.1:8000/api/staff/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaff(response.data);
    } catch (err) {
      console.error("Error fetching staff:", err);
      setError("Failed to load staff list");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (member) => {
    setSelectedStaff(member);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedStaff(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        const token = localStorage.getItem("access");
        await axios.delete(`http://127.0.0.1:8000/api/staff/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchStaff(); // Refresh list
      } catch (err) {
        console.error("Error deleting staff:", err);
        alert("Failed to delete staff member");
      }
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      director: "#d32f2f",
      doctor: "#1976d2",
      nurse: "#0d47a1",
      psychologist: "#2e7d32",
      social_worker: "#f57c00",
      admin: "#6a1b9a",
    };
    return colors[role] || "#666";
  };

  const getRoleBackgroundColor = (role) => {
    const colors = {
      director: "#ffebee",
      doctor: "#e3f2fd",
      nurse: "#e1f5fe",
      psychologist: "#e8f5e9",
      social_worker: "#fff3e0",
      admin: "#f3e5f5",
    };
    return colors[role] || "#f5f5f5";
  };

  const getStatusColor = (status) => {
    if (status === "active") return "#2e7d32";
    if (status === "inactive") return "#d32f2f";
    return "#f57c00";
  };

  const getStatusBackgroundColor = (status) => {
    if (status === "active") return "#e8f5e9";
    if (status === "inactive") return "#ffebee";
    return "#fff3e0";
  };

  // Filter staff based on search and role
  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      !searchTerm ||
      member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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
        <Button variant="contained" onClick={fetchStaff}>
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
            Staff Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all staff members in the system. View, edit, or delete staff
            records.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => navigate("/staff/new")}
          sx={{
            background: "linear-gradient(to right, #1976d2, #0d47a1)",
            textTransform: "none",
            fontWeight: "600",
            px: 3,
          }}
        >
          + Add New Staff
        </Button>
      </Box>

      {/* Filter Section */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Search by name or employee ID..."
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
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          sx={{
            minWidth: 200,
            backgroundColor: "white",
            borderRadius: 1,
          }}
        >
          <MenuItem value="all">All Roles</MenuItem>
          <MenuItem value="director">Director</MenuItem>
          <MenuItem value="doctor">Doctor</MenuItem>
          <MenuItem value="nurse">Nurse</MenuItem>
          <MenuItem value="psychologist">Psychologist</MenuItem>
          <MenuItem value="social_worker">Social Worker</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
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
        <Table sx={{ minWidth: 900 }}>
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
                <strong>Employee ID</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Full Name</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Role</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Department</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Phone</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Status</strong>
              </TableCell>
              <TableCell sx={{ color: "white", textAlign: "center" }}>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      No staff members found
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {searchTerm || roleFilter !== "all"
                        ? "Try adjusting your filters"
                        : "Start by adding your first staff member"}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate("/staff/new")}
                      sx={{
                        background:
                          "linear-gradient(to right, #1976d2, #0d47a1)",
                      }}
                    >
                      + Add First Staff Member
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filteredStaff.map((member) => (
                <TableRow
                  key={member.id}
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
                    {member.employee_id}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "500" }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {member.full_name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography>{member.full_name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={member.role.replace(/_/g, " ")}
                      sx={{
                        backgroundColor: getRoleBackgroundColor(member.role),
                        color: getRoleColor(member.role),
                        fontWeight: "600",
                        textTransform: "capitalize",
                      }}
                    />
                  </TableCell>
                  <TableCell>{member.department}</TableCell>
                  <TableCell>{member.phone_number}</TableCell>
                  <TableCell>
                    <Chip
                      label={member.employment_status.replace(/_/g, " ")}
                      sx={{
                        backgroundColor: getStatusBackgroundColor(
                          member.employment_status,
                        ),
                        color: getStatusColor(member.employment_status),
                        fontWeight: "600",
                        textTransform: "capitalize",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="center"
                    >
                      <Tooltip title="View Details">
                        <IconButton
                          color="primary"
                          onClick={() => handleView(member)}
                          size="small"
                          sx={{ "&:hover": { backgroundColor: "#e3f2fd" } }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Edit Staff">
                        <IconButton
                          color="success"
                          onClick={() =>
                            navigate(`/director/staff/edit/${member.id}`)
                          }
                          size="small"
                          sx={{ "&:hover": { backgroundColor: "#e8f5e9" } }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete Staff">
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(member.id)}
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

      {/* Staff Details Dialog */}
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
            Staff Details: {selectedStaff?.full_name}
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
          {selectedStaff && (
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
                          Full Name
                        </Typography>
                        <Typography variant="body1">
                          {selectedStaff.full_name}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Employee ID
                        </Typography>
                        <Typography variant="body1">
                          {selectedStaff.employee_id}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Phone Number
                        </Typography>
                        <Typography variant="body1">
                          {selectedStaff.phone_number}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1">
                          {selectedStaff.email || "N/A"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Professional Information */}
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
                      💼 Professional Information
                    </Typography>
                    <Divider sx={{ mb: 2, borderColor: "#e0e0e0" }} />

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Role
                        </Typography>
                        <Chip
                          label={selectedStaff.role.replace(/_/g, " ")}
                          sx={{
                            backgroundColor: getRoleBackgroundColor(
                              selectedStaff.role,
                            ),
                            color: getRoleColor(selectedStaff.role),
                            fontWeight: "600",
                            textTransform: "capitalize",
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Department
                        </Typography>
                        <Typography variant="body1">
                          {selectedStaff.department}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Status
                        </Typography>
                        <Chip
                          label={selectedStaff.employment_status.replace(
                            /_/g,
                            " ",
                          )}
                          sx={{
                            backgroundColor: getStatusBackgroundColor(
                              selectedStaff.employment_status,
                            ),
                            color: getStatusColor(
                              selectedStaff.employment_status,
                            ),
                            fontWeight: "600",
                            textTransform: "capitalize",
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Hire Date
                        </Typography>
                        <Typography variant="body1">
                          {selectedStaff.hire_date
                            ? new Date(
                                selectedStaff.hire_date,
                              ).toLocaleDateString()
                            : "N/A"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, backgroundColor: "#f8f9fb" }}>
          <Button
            onClick={() =>
              navigate(`/director/staff/edit/${selectedStaff?.id}`)
            }
            variant="contained"
            sx={{
              background: "linear-gradient(to right, #1976d2, #0d47a1)",
            }}
          >
            Edit Staff
          </Button>
          <Button onClick={handleCloseDialog} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AllStaff;
