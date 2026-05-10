import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

function StatCard({ title, value, color }) {
  return (
    <Card
      sx={{
        backgroundColor: color,
        color: "#fff",
        borderRadius: 2,
      }}
    >
      <CardContent>
        <Typography variant="body2">
          {title}
        </Typography>

        <Typography variant="h4" fontWeight="bold">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default StatCard;
