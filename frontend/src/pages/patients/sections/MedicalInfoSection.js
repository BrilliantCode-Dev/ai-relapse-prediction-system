import React from "react";
import { Stack } from "@mui/material";

import MyTextField from "../../../components/forms/MyTextField";
import QuestionWithDetails from "../../../components/forms/QuestionWithDetails";

function MedicalInfoSection() {
  return (
    <Stack spacing={2}>
      <QuestionWithDetails
        question="Previous counselling or psychiatric treatment?"
        radioName="counselling"
        detailsName="counsellingDetails"
      />

      <QuestionWithDetails
        question="Tested for HIV before?"
        radioName="hivTested"
        detailsName="hivDetails"
      />

      <QuestionWithDetails
        question="Tested for TB before?"
        radioName="tbTested"
        detailsName="tbDetails"
      />

      <MyTextField
        name="physicalHealthProblems"
        label="Physical health problems or disabilities"
        required
        placeholder="Describe any physical health issues or disabilities"
      />

      <QuestionWithDetails
        question="Screened for hypertension?"
        radioName="hypertension"
        detailsName="hypertensionDetails"
      />

      <QuestionWithDetails
        question="Previous Rehab History?"
        radioName="rehab"
        detailsName="rehabHistory"
      />

      <MyTextField
        name="medicalHistory"
        label="Medical History"
        required
        placeholder="Enter relevant medical history"
      />
      <MyTextField
        name="allergies"
        label="Allergies"
        required
        placeholder="List any known allergies"
      />
    </Stack>
  );
}

export default MedicalInfoSection;
