import { Typography } from "@mui/material";

export default function RequiredLabel({ text }) {
  return (
    <Typography component="label" fontWeight={500}>
      {text}
      <span style={{ color: "red", marginLeft: 4 }}>*</span>
    </Typography>
  );
}
