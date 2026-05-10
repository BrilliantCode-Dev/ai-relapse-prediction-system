import React from "react";
import { TextField, MenuItem } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

function MySelectField({ name, label, options = [], required = false }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      rules={{ required: required ? `${label} is required` : false }}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          select
          fullWidth
          size="small"
          label={label}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}

export default MySelectField;