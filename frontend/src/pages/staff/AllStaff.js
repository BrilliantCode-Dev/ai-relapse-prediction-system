import React, { useEffect, useState } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, IconButton,
  Chip, Avatar, CircularProgress, Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

function AllStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('access');
      const response = await axios.get("http://127.0.0.1:8000/api/staff/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaff(response.data);
    } catch (err) {
      console.error("Error fetching staff:", err);
      setError("Failed to load staff list");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        const token = localStorage.getItem('access');
        await axios.delete(`http://127.0.0.1:8000/api/staff/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
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
      'director': 'error',
      'doctor': 'secondary',
      'nurse': 'primary',
      'psychologist': 'success',
      'social_worker': 'warning',
      'admin': 'info'
    };
    return colors[role] || 'default';
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Staff Management</Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/staff/new')}
        >
          Add New Staff
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.employee_id}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar>{member.full_name.charAt(0)}</Avatar>
                    {member.full_name}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={member.role.replace('_', ' ')} 
                    color={getRoleColor(member.role)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{member.department}</TableCell>
                <TableCell>{member.phone_number}</TableCell>
                <TableCell>
                  <Chip 
                    label={member.employment_status.replace('_', ' ')} 
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => navigate(`/staff/${member.id}`)}>
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton onClick={() => navigate(`/staff/edit/${member.id}`)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(member.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default AllStaff;