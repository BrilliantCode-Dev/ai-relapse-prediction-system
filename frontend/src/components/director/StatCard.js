import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

function StatCard({ title, value, color }) {

  const getIcon = () => {
    switch (title) {
      case "Active Patients":
        return <PeopleIcon sx={{ fontSize: 30 }} />;
      case "Completed Therapy Sessions":
        return <EventAvailableIcon sx={{ fontSize: 30 }} />;
      case "Available Notifications":
        return <NotificationsIcon sx={{ fontSize: 30 }} />;
      case "New Admissions":
        return <PersonAddIcon sx={{ fontSize: 30 }} />;
      default:
        return <PeopleIcon sx={{ fontSize: 30 }} />;
    }
  };

  return (
    <Card
      sx={{
        height: "130px",
        width: "180px",
        borderRadius: 3,
        backgroundColor: color,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        px: 3,

        transition: "all 0.3s ease",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",

        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        }
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2.5, // ✅ THIS FIXES SPACING
          width: "100%",
          p: "0 !important"
        }}
      >

        {/* 🔷 ICON */}
        <Box
          sx={{
            minWidth: 38, // ✅ keeps alignment consistent
            height: 38,
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {getIcon()}
        </Box>

        {/* 🔷 TEXT */}
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Typography
            variant="body2"
            sx={{
              opacity: 0.85,
              fontSize: "0.85rem",
              mb: 0.5
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              lineHeight: 1.2
            }}
          >
            {value}
          </Typography>
        </Box>

      </CardContent>
    </Card>
  );
}

export default StatCard;