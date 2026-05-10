import React from "react";
import { Box, Typography } from "@mui/material";

function DashboardHeader() {
  return (
    <Box sx={{ overflow: "hidden", whiteSpace: "nowrap", mb: 3 }}>
      <Typography
        variant="h5"
        fontWeight="bold"
        sx={{
          display: "inline-block",
          animation: "scrollText 15s linear infinite",
        }}
      >
        Welcome to FASAA Rehabilitation Center Patient Management System
      </Typography>

      <style>
        {`
          @keyframes scrollText {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        `}
      </style>
    </Box>
  );
}

export default DashboardHeader;
