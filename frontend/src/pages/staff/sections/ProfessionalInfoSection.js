import React from "react";
import { Stack } from "@mui/material";

import MyTextField from "../../../components/forms/MyTextField";
import MyDatePickerField from "../../../components/forms/MyDatePickerField";
import MySelectField from "../../../components/forms/MySelectField";

function ProfessionalInfoSection() {
  return (
    <Stack spacing={2}>
      <MySelectField
        name="role"
        label="Role"
        required
        options={[
          { value: "nurse", label: "Nurse" },
          { value: "nurse_aid", label: "Nurse Aid" },
          { value: "psychiatric_nurse", label: "Psychiatric Nurse" },
          { value: "psychologist", label: "Psychologist" },
          { value: "social_worker", label: "Social Worker" },
          { value: "occupational_therapist", label: "Occupational Therapist" },
          { value: "counselor", label: "Counselor" },
          { value: "doctor", label: "Doctor" },
          { value: "admin", label: "Administrator" },
          { value: "director", label: "Director" },
        ]}
      />

      <MySelectField
        name="department"
        label="Department"
        required
        options={[
          { value: "medical", label: "Medical" },
          { value: "nursing", label: "Nursing" },
          { value: "psychology", label: "Psychology" },
          { value: "social_work", label: "Social Work" },
          { value: "therapy", label: "Therapy" },
          { value: "administration", label: "Administration" },
          { value: "management", label: "Management" },
          { value: "counseling", label: "Counseling" },
        ]}
      />

      <MyTextField
        name="qualification"
        label="Qualification"
        required
        placeholder="e.g., BSc Nursing, MD, MSW"
      />

      <MyTextField
        name="specialization"
        label="Specialization"
        placeholder="e.g., Emergency Care, Mental Health"
      />

      <MyTextField
        name="years_of_experience"
        label="Years of Experience"
        type="number"
        placeholder="Enter number of years"
      />

      <MyTextField
        name="license_number"
        label="License Number"
        placeholder="Enter professional license number"
      />

      <MyDatePickerField name="date_joined" label="Date Joined" required />

      <MySelectField
        name="employment_status"
        label="Employment Status"
        required
        options={[
          { value: "full_time", label: "Full Time" },
          { value: "part_time", label: "Part Time" },
          { value: "contract", label: "Contract" },
          { value: "intern", label: "Intern" },
        ]}
      />
    </Stack>
  );
}

export default ProfessionalInfoSection;
