import React from "react";
import { Grid, Box, TextField } from "@mui/material";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/director/StatCard";
import PatientTable from "../../components/director/PatientTable";

function StaffDashboard() {
  // 🔥 Dummy data for now (you will replace with API later)
  const totalPatients = 12;
  const highRiskPatients = 4;
  const alertsCount = 6;
  const trend = "+8"; // can be + or -

  return (
    <>
      <DashboardHeader />

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Patients Assigned"
            value={totalPatients}
            color="#3f51b5"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="High Risk Patients"
            value={highRiskPatients}
            color="#ff9800"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="Recent Alerts"
            value={alertsCount}
            color="#4caf50"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="Trends"
            value={`${trend}%`}
            color="#f44336"
          />
        </Grid>
      </Grid>

      {/* 🔍 Search Bar */}
      <Box sx={{ mt: 3, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search assigned patient..."
          sx={{
            backgroundColor: "#fff",
            borderRadius: 1,
          }}
        />
      </Box>

      {/* 🔥 IMPORTANT: This table should show ONLY assigned patients */}
      <PatientTable />
    </>
  );
}

export default StaffDashboard;