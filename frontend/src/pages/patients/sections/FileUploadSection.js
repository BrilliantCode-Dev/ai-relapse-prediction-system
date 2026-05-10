import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Stack,
  Typography,
  Box,
  Button,
  Paper
} from "@mui/material";

function UploadBox({ label, name }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={null}
      render={({ field }) => {
        const file = field.value;

        return (
          <Box
            sx={{
              border: "2px dashed #d0d0d0",
              borderRadius: 2,
              p: 3
            }}
          >
            <Typography fontWeight={600} mb={2}>
              {label} *
            </Typography>

            <Stack spacing={2}>
{file && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    borderRadius: 2,
                    width: "fit-content",
                    bgcolor: "#fafafa"
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "#e3f2fd",
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      color: "#1976d2"
                    }}
                  >
                    IMG
                  </Box>

                  <Box>
                    <Typography fontSize={14} fontWeight={500}>
                      {file.name}
                    </Typography>
                    <Typography fontSize={12} color="text.secondary">
                      {(file.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Box>
                </Paper>
              )}

              <Button
                variant="outlined"
                component="label"
                sx={{ width: "fit-content" }}
              >
                Upload file
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    field.onChange(e.target.files[0]);
                  }}
                />
              </Button>

              
            </Stack>
          </Box>
        );
      }}
    />
  );
}

function FileUploadSection() {
  return (
    <Stack spacing={4}>
      <UploadBox
        label="Patient Photo"
        name="patientPicture"
      />

      <UploadBox
        label="Patient Signature"
        name="signature"
      />
    </Stack>
  );
}

export default FileUploadSection;
