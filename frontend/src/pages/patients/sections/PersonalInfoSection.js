import React, { useEffect } from "react";
import { Stack } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";

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
  const dob = useWatch({ control, name: "dob" });

  useEffect(() => {
    if (dob) {
      setValue("age", calculateAge(dob));
    }
  }, [dob, setValue]);

  return (
    <Stack spacing={2}>
      <MyDatePickerField name="date" label="Date" required />
      <MyTextField
        name="accountNumber"
        label="Account Number"
        required
        placeholder="Auto-generated or enter manually"
      />
      <MyTextField
        name="fullName"
        label="Full Name"
        required
        placeholder="Enter patient's full name"
      />
      <MyDatePickerField
        name="dob"
        label="Date of Birth"
        disableFuture
        required
      />
      <MyTextField
        name="age"
        label="Age"
        required
        disabled
        placeholder="Auto-calculated"
      />
      <MyTextField
        name="maritalStatus"
        label="Marital Status"
        required
        placeholder="e.g., Single, Married, Divorced"
      />
      <MyTextField
        name="address"
        label="Address"
        required
        placeholder="Enter residential address"
      />
      <MyTextField
        name="phoneNumber"
        label="Phone Number"
        required
        placeholder="Enter contact number"
      />
      <MyTextField
        name="occupation"
        label="Occupation"
        required
        placeholder="Enter patient's occupation"
      />
      <MyTextField
        name="educationStatus"
        label="Education Status"
        required
        placeholder="e.g., Primary, Secondary, Tertiary"
      />
      <MyTextField
        name="religiousAffiliation"
        label="Religious Affiliation"
        placeholder="e.g., Christian, Muslim, Jewish, Other"
      />
    </Stack>
  );
}

export default PersonalInfoSection;
