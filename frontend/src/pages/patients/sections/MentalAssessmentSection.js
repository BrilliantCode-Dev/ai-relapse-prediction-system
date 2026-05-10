import React from "react";
import { Stack } from "@mui/material";

import MyTextField from "../../../components/forms/MyTextField";
import QuestionWithDetails from "../../../components/forms/QuestionWithDetails";

function MentalAssessmentSection() {
  return (
    <Stack spacing={2}>
      <MyTextField
        name="substanceAbuseCharacteristics"
        label="Substance abuse characteristics"
        required
        placeholder="Describe substance abuse patterns and behaviors"
      />

      <QuestionWithDetails
        question="Does the patient see things others do not?"
        radioName="seeThings"
        detailsName="seeThingsDetails"
      />

      <QuestionWithDetails
        question="Does the patient hear voices?"
        radioName="hearVoices"
        detailsName="hearVoicesDetails"
      />

      <QuestionWithDetails
        question="Any violent tendencies?"
        radioName="violentTendencies"
        detailsName="violentTendenciesDetails"
      />

      <QuestionWithDetails
        question="Recent weight loss?"
        radioName="weightLoss"
        detailsName="weightLossDetails"
      />

      <QuestionWithDetails
        question="Needs assistance with personal care?"
        radioName="needAssistance"
        detailsName="needAssistanceDetails"
      />
    </Stack>
  );
}

export default MentalAssessmentSection;
