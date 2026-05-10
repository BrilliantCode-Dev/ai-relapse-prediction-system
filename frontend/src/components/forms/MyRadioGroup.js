import React from "react";
import {
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Box,
} from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

function MyRadioGroup({ name, label, row = true }) {
  const { control } = useFormContext();

  return (
    <Box>
      {label && <FormLabel sx={{ mb: 1 }}>{label}</FormLabel>}

      <Controller
        name={name}
        control={control}
        defaultValue=""
        render={({ field }) => (
          <RadioGroup row={row} {...field}>
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        )}
      />
    </Box>
  );
}

export default MyRadioGroup;
