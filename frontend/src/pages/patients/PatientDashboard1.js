import React from "react";
import { Grid, Box, TextField } from "@mui/material";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/director/StatCard";
import PatientTable from "../../components/director/PatientTable";

function PatientDashboard() {
  // 🔥 Dummy data (replace with API later)
  const daysInRecovery = 24;
  const checkinsCompleted = 18;
  const totalJournals = 18;
  const upcomingSessions = 2;

  return (
    <>
      <DashboardHeader />

     <Grid container spacing={3}>
  {/* Days in Recovery */}
  <Grid item xs={12} md={3}>
    <StatCard
      title="Days in Recovery"
      value={daysInRecovery}
      color="#3f51b5"
    />
  </Grid>

  {/* Check-ins */}
  <Grid item xs={12} md={3}>
    <StatCard
      title="Check-ins Completed"
      value={checkinsCompleted}
      color="#ff9800"
    />
  </Grid>

  {/* Total Journals */}
  <Grid item xs={12} md={3}>
    <StatCard
      title="Total Journals"
      value={totalJournals}
      color="#4caf50"
    />
  </Grid>

  {/* Upcoming Sessions */}
  <Grid item xs={12} md={3}>
    <StatCard
      title="Upcoming Sessions"
      value={upcomingSessions}
      color="#f44336"
    />
  </Grid>
</Grid>

      {/* 🔍 Search (optional, can remove later) */}
      <Box sx={{ mt: 3, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search activity..."
          sx={{
            backgroundColor: "#fff",
            borderRadius: 1,
          }}
        />
      </Box>

      {/* 🔥 This table should be changed to Activity Table later */}
      <PatientTable />
    </>
  );
}

export default PatientDashboard;