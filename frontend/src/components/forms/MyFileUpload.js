import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

function MyFileUpload({ name, label, accept = "image/*", required }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={null}
      render={({ field }) => (
        <Box>
          <Typography fontWeight={500} mb={1}>
            {label} {required && "*"}
          </Typography>

          <Button variant="outlined" component="label">
            Upload File
            <input
              type="file"
              hidden
              accept={accept}
              onChange={(e) => field.onChange(e.target.files[0])}
            />
          </Button>

          {field.value && (
            <Typography variant="body2" mt={1}>
              Selected: {field.value.name}
            </Typography>
          )}
        </Box>
      )}
    />
  );
}

export default MyFileUpload;
