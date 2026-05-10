import * as React from "react";
import { TextField, Typography, Box } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

export default function MyTextField(props) {
  const { name, label, placeholder, required = false, width, ...rest } = props;

  const { control } = useFormContext();

  return (
    <Box sx={{ width: width || "100%" }}>
      {/* ===== LABEL ===== */}
      {label && (
        <Typography fontWeight={500} mb={1}>
          {label}
          {required && <span style={{ color: "red", marginLeft: 4 }}>*</span>}
        </Typography>
      )}

      {/* ===== INPUT ===== */}
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            value={field.value ?? ""}
            fullWidth
            size="small"
            variant="outlined"
            placeholder={placeholder}
            error={!!error}
            helperText={error?.message}
            {...rest}
          />
        )}
      />
    </Box>
  );
}
