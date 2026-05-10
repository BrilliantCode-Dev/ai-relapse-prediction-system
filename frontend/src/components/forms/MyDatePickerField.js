import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Typography, Box } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import dayjs from "dayjs";

export default function MyDatePickerField(props) {
  const {
    label,
    name,
    required,
    disableFuture,
    width = "100%",
  } = props;

  const { control } = useFormContext();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width }}>
        {label && (
          <Typography fontWeight={500} mb={1}>
            {label}
            {required && <span style={{ color: "red" }}> *</span>}
          </Typography>
        )}

        <Controller
          name={name}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <DatePicker
              value={field.value ? dayjs(field.value) : null}
              onChange={(newValue) =>
                field.onChange(
                  newValue ? dayjs(newValue).format("YYYY-MM-DD") : ""
                )
              }
              disableFuture={disableFuture}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  placeholder: "DD/MM/YYYY",
                  error: !!error,
                  helperText: error?.message,
                  fullWidth: true,
                  variant: "outlined",
                },
              }}
            />
          )}
        />
      </Box>
    </LocalizationProvider>
  );
}