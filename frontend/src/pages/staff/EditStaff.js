import React from "react";
import { Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

function EditStaff() {
  const { id } = useParams();
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Edit Staff</Typography>
      <Typography variant="body1">Editing staff member ID: {id}</Typography>
      <Typography variant="body2">Coming soon...</Typography>
    </Box>
  );
}

export default EditStaff;