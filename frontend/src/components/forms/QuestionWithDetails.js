import React from "react";
import { Box } from "@mui/material";
import { useFormContext } from "react-hook-form";
import MyRadioGroup from "./MyRadioGroup";
import MyTextField from "./MyTextField";

function QuestionWithDetails({ question, radioName, detailsName }) {
  const { watch } = useFormContext();
  const answer = watch(radioName);

  return (
    <Box>
      <MyRadioGroup name={radioName} label={question} />

      {answer === "yes" && (
        <MyTextField
          name={detailsName}
          placeholder="If yes, provide details"
          required
        />
      )}
    </Box>
  );
}

export default QuestionWithDetails;
