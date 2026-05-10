import React from "react";
import { Stack } from "@mui/material";

import MyTextField from "../../../components/forms/MyTextField";

function EmergencyContactSection() {
  return (
    <Stack spacing={2}>
      <MyTextField
        name="emergency_contact_name"
        label="Emergency Contact Name"
        required
        placeholder="Enter emergency contact person's name"
      />

      <MyTextField
        name="emergency_contact_phone"
        label="Emergency Contact Phone"
        required
        placeholder="Enter emergency contact number"
      />

      <MyTextField
        name="emergency_contact_relation"
        label="Relationship"
        required
        placeholder="e.g., Spouse, Parent, Sibling"
      />
    </Stack>
  );
}

export default EmergencyContactSection;
