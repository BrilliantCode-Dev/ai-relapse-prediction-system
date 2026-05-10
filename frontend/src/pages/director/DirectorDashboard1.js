import React from "react";
import { Grid, Container } from "@mui/material";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";

function DirectorDashboard() {
  return (
    <Container maxWidth="xl">
      <DashboardHeader />

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Active Patients"
            value="45"
            color="#3f51b5"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="Completed Therapy Sessions"
            value="12"
            color="#ff9800"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="Available Patient Notifications"
            value="189"
            color="#4caf50"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="New Patient Admissions"
            value="3"
            color="#f44336"
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default DirectorDashboard;
