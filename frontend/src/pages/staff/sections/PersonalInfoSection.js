import React, { useEffect } from "react";
import { Stack } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";

import MySelectField from "../../../components/forms/MySelectField";
import MyTextField from "../../../components/forms/MyTextField";
import MyDatePickerField from "../../../components/forms/MyDatePickerField";

function calculateAge(dob) {
  if (!dob) return "";
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();

  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

function PersonalInfoSection() {
  const { control, setValue } = useFormContext();
  const dob = useWatch({ control, name: "date_of_birth" });
  const employeeId = useWatch({ control, name: "employeeId" }); // Watch the employeeId value from wherever it's generated

  useEffect(() => {
    if (dob) {
      setValue("age", calculateAge(dob));
    }
  }, [dob, setValue]);

  // Sync employeeId to employee_id whenever it changes
  useEffect(() => {
    if (employeeId) {
      setValue("employee_id", employeeId, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [employeeId, setValue]);

  return (
    <Stack spacing={2}>
      {/* Employee ID Field - Auto-filled */}
      <MyTextField
        name="employee_id"
        label="Employee ID"
        required
        InputProps={{
          readOnly: true,
          sx: { bgcolor: "#f5f5f5" },
        }}
      />

      <MyTextField
        name="full_name"
        label="Full Name"
        required
        placeholder="Enter staff member's full name"
      />

      <MyTextField
        name="email"
        label="Email Address"
        required
        placeholder="Enter email address"
      />

      <MyTextField
        name="phone_number"
        label="Phone Number"
        required
        placeholder="Enter contact number"
      />

      <MyDatePickerField
        name="date_of_birth"
        label="Date of Birth"
        disableFuture
        required
      />

      <MyTextField name="age" label="Age" disabled />

      <MySelectField
        name="gender"
        label="Gender"
        required
        options={[
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "other", label: "Other" },
        ]}
      />

      <MyTextField
        name="address"
        label="Address"
        required
        placeholder="Enter residential address"
      />
    </Stack>
  );
}

export default PersonalInfoSection;
