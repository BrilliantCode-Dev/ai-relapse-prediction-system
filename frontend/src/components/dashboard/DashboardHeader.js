import React from "react";
import { Typography, Box } from "@mui/material";

function DashboardHeader() {
  return (
    <Box sx={{ overflow: "hidden", whiteSpace: "nowrap", mb: 3 }}>
      <Typography
        fontWeight="bold"
        sx={{
          animation: "scroll 15s linear infinite",
          display: "inline-block"
        }}
      >
        Welcome to FASAA Rehabilitation Center Patient Management System
      </Typography>

      <style>
        {`
          @keyframes scroll {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        `}
      </style>
    </Box>
  );
}

export default DashboardHeader;
