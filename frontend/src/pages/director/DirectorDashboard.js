import React from "react";
import { Grid } from "@mui/material";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/director/StatCard";
import PatientTable from "../../components/director/PatientTable";
import { Box, TextField } from "@mui/material";


function DirectorDashboard() {
  return (
    <>
      <DashboardHeader />

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <StatCard title="Active Patients" value="45" color="#3f51b5" />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard title="Completed Therapy Sessions" value="12" color="#ff9800" />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard title="Available Notifications" value="189" color="#4caf50" />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard title="New Admissions" value="3" color="#f44336" />
        </Grid>
      </Grid>

      {/* 🔍 Search Bar (UI only for now) */}
<Box sx={{ mt: 3, mb: 3 }}>
  <TextField
    fullWidth
  size="small"
  placeholder="Search patient..."
  sx={{
    backgroundColor: "#fff",
    borderRadius: 1,
  }}
  />
</Box>


      <PatientTable />
    </>
  );
}

export default DirectorDashboard;
