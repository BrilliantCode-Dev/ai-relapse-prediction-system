import { Box, Button, Typography } from "@mui/material";
import { useForm } from "react-hook-form";

import MyTextField from "./forms/MyTextField1";
import MyDatePickerField from "./forms/MyDatePickerField1";
import MyMultiLineFields from "./forms/MyMultilineField1";
import MySelectField from "./forms/MySelectField1";

const Create = () => {
  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      name: "",
      start_date: null,
      end_date: null,
      comments: "",
      status: "",
    },
  });

  // === FORM SUBMISSION ===
  const onSubmit = async (data) => {
    try {
      // Convert Dayjs dates to ISO string if using DatePicker
      const payload = {
        ...data,
        start_date: data.start_date ? data.start_date.toISOString() : null,
        end_date: data.end_date ? data.end_date.toISOString() : null,
      };

      console.log("Submitting payload:", payload);

      // Send POST request to Django backend
      const response = await fetch("http://localhost:8000/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log("Server response:", result);

      // Optional: reset form after submission
      reset();
      alert("Patient added successfully!");
    } catch (error) {
      console.error("Submission error:", error);
      alert("Error submitting form. Check console for details.");
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            width: "100%",
            backgroundColor: "#00003f",
            mb: 2,
            p: 1,
          }}
        >
          <Typography sx={{ ml: 2, color: "#fff" }}>Add New Patient</Typography>
        </Box>

        {/* Form Body */}
        <Box
          sx={{
            display: "flex",
            width: "100%",
            boxShadow: 3,
            p: 4,
            flexDirection: "column",
          }}
        >
          {/* Row 1 */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 4,
            }}
          >
            <MyTextField
              label="Name"
              name="name"
              control={control}
              placeholder="Enter patient name"
              width="30%"
            />

            <MyDatePickerField
              label="Start Date"
              name="start_date"
              control={control}
              width="30%"
            />

            <MyDatePickerField
              label="End Date"
              name="end_date"
              control={control}
              width="30%"
            />
          </Box>

          {/* Row 2 */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <MyMultiLineFields
              label="Comments"
              name="comments"
              control={control}
              placeholder="Additional notes"
              width="30%"
            />

            <MySelectField
              label="Status"
              name="status"
              control={control}
              width="30%"
            />

            {/* Submit Button */}
            <Box sx={{ width: "30%", display: "flex", alignItems: "flex-end" }}>
              <Button type="submit" variant="contained" sx={{ width: "100%" }}>
                Submit
              </Button>
            </Box>
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default Create;
