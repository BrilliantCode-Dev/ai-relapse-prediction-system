import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Button,
  Stack,
  Chip,
  Alert,
  FormGroup,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function PatientCheckIn() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 😊 1. Mood Check
  const [mood, setMood] = useState("");
  const [moodIntensity, setMoodIntensity] = useState(5);

  // 🔥 2. Craving Check
  const [hadCraving, setHadCraving] = useState("");
  const [cravingStrength, setCravingStrength] = useState(5);
  const [cravingDuration, setCravingDuration] = useState("");
  const [resistedCraving, setResistedCraving] = useState("");

  // ⚠️ 3. Triggers
  const [hadTriggers, setHadTriggers] = useState("");
  const [selectedTriggers, setSelectedTriggers] = useState([]);

  // 🚶 4. Behavior
  const [positiveActions, setPositiveActions] = useState([]);
  const [isolated, setIsolated] = useState("");

  // 🏥 5. Health & Mental State
  const [sleepHours, setSleepHours] = useState(7);
  const [stressLevel, setStressLevel] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);

  // 🧠 6. Final Question
  const [confidence, setConfidence] = useState(5);

  // Risk score
  const [riskScore, setRiskScore] = useState(null);
  const [riskLevel, setRiskLevel] = useState("");

  const BASE_URL = "http://127.0.0.1:8000";

  const moodOptions = [
    { value: "Good", emoji: "😊", label: "Good" },
    { value: "Okay", emoji: "😐", label: "Okay" },
    { value: "Sad", emoji: "😔", label: "Sad" },
    { value: "Anxious", emoji: "😰", label: "Anxious" },
    { value: "Angry", emoji: "😡", label: "Angry" },
  ];

  const triggerOptions = [
    "Stress",
    "Boredom",
    "Loneliness",
    "Friends/Peer pressure",
    "Environment (places)",
    "Emotional distress",
  ];

  const positiveActionOptions = [
    "Exercise",
    "Work/School",
    "Socializing",
    "Hobbies",
    "Therapy/Support group",
  ];

  const cravingDurationOptions = [
    "Minutes",
    "Less than 1 hour",
    "Several hours",
    "Most of the day",
  ];

  const handleTriggerChange = (trigger) => {
    setSelectedTriggers((prev) =>
      prev.includes(trigger)
        ? prev.filter((t) => t !== trigger)
        : [...prev, trigger],
    );
  };

  const handlePositiveActionChange = (action) => {
    setPositiveActions((prev) =>
      prev.includes(action)
        ? prev.filter((a) => a !== action)
        : [...prev, action],
    );
  };


  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refresh");

    const response = await axios.post(
      "http://127.0.0.1:8000/api/token/refresh/",
      { refresh: refreshToken },
    );

    localStorage.setItem("access", response.data.access);
    return response.data.access;
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("access");

    if (!token) {
      navigate("/login");
      return;
    }

      

      const data = {
      mood,
      sleep_hours: sleepHours,
      confidence,

      mood_intensity: moodIntensity,
      stress_level: stressLevel,
      energy_level: energyLevel,

      had_craving: hadCraving,
      craving_strength: hadCraving === "yes" ? cravingStrength : null,
      resisted_craving: hadCraving === "yes" ? resistedCraving : null,
      craving_duration: hadCraving === "yes" ? cravingDuration : null,

      had_triggers: hadTriggers,
      trigger_types: hadTriggers === "yes" ? selectedTriggers : [],

      isolated,
      positive_actions: positiveActions,

      date: new Date().toISOString().split("T")[0],
    };
    
    console.log("Check-in Data:", data);

    try {
      setLoading(true);

      const response = await axios.post(
        `${BASE_URL}/api/clients/checkin/`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = response.data;

      setRiskScore(result.risk_score);
      setRiskLevel(result.risk);

      //const result = response.data;
      alert("Check-in submitted successfully!");

        

      navigate("/director/patients/patient-dashboard");
    } catch (err) {
      console.error("Full error:", err);
      console.error("Backend response:", err.response?.data);

      // 🔥 HANDLE TOKEN EXPIRY (401)
      if (err.response?.status === 401) {
        try {
          const newToken = await refreshAccessToken();
          // Retry the request with new token
          const retryResponse = await axios.post(
            `${BASE_URL}/api/clients/checkin/`,
            data,
            {
              headers: {
                Authorization: `Bearer ${newToken}`,
                "Content-Type": "application/json",
              },
            },
          );
          console.log("Check-in saved after refresh:", retryResponse.data);
          alert("Check-in submitted successfully!");
          navigate("/director/patients/patient-dashboard");
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          navigate("/login");
        }
      } else {
        // 🔍 SHOW EXACT BACKEND ERROR
        const backendError = err.response?.data;

        let message = "Failed to save check-in.";

        if (backendError) {
          // If it's a string
          if (typeof backendError === "string") {
            message = backendError;
          }
          // If it's an object (most common in DRF)
          else if (typeof backendError === "object") {
            message = Object.entries(backendError)
              .map(([field, errors]) => {
                return `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`;
              })
              .join("\n");
          }
        }

        alert(message);
      }
    } finally {
      setLoading(false);
    }
  };

  
  const handleViewHistory = () => {
    navigate("/director/patients/checkin-history");
  };

  // Numbered slider marks
  const sliderMarks = [
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "5" },
    { value: 6, label: "6" },
    { value: 7, label: "7" },
    { value: 8, label: "8" },
    { value: 9, label: "9" },
    { value: 10, label: "10" },
  ];

  return (
    <Box>
      {/* 🔷 HEADER - Matching PatientsJournal style */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: "linear-gradient(to right, #1976d2, #0d47a1)",
          color: "#fff",
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Daily Check-In
        </Typography>
        <Typography>
          Please take a moment to answer the questions below
        </Typography>
      </Paper>

      {/* 🧾 CHECK-IN CARD */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 4,
          mb: 3,
          background: "linear-gradient(145deg, #ffffff, #f9fbff)",
        }}
      >
        {/* HEADER */}
        <Box mb={3}>
          <Typography variant="h5" fontWeight="bold">
            Daily Check-In 💙
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Take a moment to reflect, this helps us support you better
          </Typography>
        </Box>

        {/* 😊 1. MOOD CHECK */}
        <Box
          mb={4}
          p={3}
          sx={{
            borderRadius: 3,
            backgroundColor: "#f7f9fc",
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            1. 😊 How are you feeling today?
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={2}>
            Choose the option that best describes your mood
          </Typography>

          <ToggleButtonGroup
            value={mood}
            exclusive
            onChange={(e, newMood) => {
              if (newMood !== null) setMood(newMood);
            }}
            sx={{ flexWrap: "wrap", gap: 1, mb: 3 }}
          >
            {moodOptions.map((option) => (
              <ToggleButton
                key={option.value}
                value={option.value}
                sx={{
                  borderRadius: 3,
                  px: 2,
                  py: 1,
                  textTransform: "none",
                  fontWeight: "500",
                  "&.Mui-selected": {
                    backgroundColor: "#1976d2",
                    color: "#fff",
                  },
                }}
              >
                <span style={{ fontSize: "1.2rem", marginRight: 6 }}>
                  {option.emoji}
                </span>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {/* Mood Intensity */}
          <Typography gutterBottom>How strong is this feeling?</Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <Typography fontSize={12}>Low</Typography>
            <Slider
              value={moodIntensity}
              onChange={(e, newValue) => setMoodIntensity(newValue)}
              min={1}
              max={10}
              step={1}
              valueLabelDisplay="on"
              marks={sliderMarks}
              sx={{ flex: 1 }}
            />
            <Typography fontSize={12}>High</Typography>
          </Stack>
        </Box>

        {/* 🔥 2. CRAVING CHECK */}
        <Box
          mb={4}
          p={3}
          sx={{
            borderRadius: 3,
            backgroundColor: "#f7f9fc",
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            2. 🔥 Cravings Check
          </Typography>

          <Typography gutterBottom>
            Did you feel any urges or cravings today?
          </Typography>

          <RadioGroup
            row
            value={hadCraving}
            onChange={(e) => setHadCraving(e.target.value)}
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>

          {hadCraving === "yes" && (
            <Box
              mt={3}
              p={2}
              sx={{
                borderRadius: 2,
                backgroundColor: "#fff",
                border: "1px solid #eee",
              }}
            >
              <Typography gutterBottom>
                How strong were the cravings?
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                <Typography fontSize={12}>Mild</Typography>
                <Slider
                  value={cravingStrength}
                  onChange={(e, newValue) => setCravingStrength(newValue)}
                  min={1}
                  max={10}
                  step={1}
                  valueLabelDisplay="on"
                  marks={sliderMarks}
                  sx={{ flex: 1 }}
                />
                <Typography fontSize={12}>Strong</Typography>
              </Stack>

              <Typography gutterBottom>How long did they last?</Typography>

              <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                <Select
                  value={cravingDuration}
                  onChange={(e) => setCravingDuration(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="" disabled>
                    Select duration
                  </MenuItem>
                  {cravingDurationOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography gutterBottom>Were you able to resist?</Typography>

              <RadioGroup
                row
                value={resistedCraving}
                onChange={(e) => setResistedCraving(e.target.value)}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </Box>
          )}
        </Box>

        {/* ⚠️ 3. TRIGGERS */}
        <Box
          mb={4}
          p={3}
          sx={{
            borderRadius: 3,
            backgroundColor: "#f7f9fc",
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            3. ⚠️ Triggers
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={2}>
            Let’s understand what may have affected you today
          </Typography>

          <Typography gutterBottom>Did anything trigger you today?</Typography>

          <RadioGroup
            row
            value={hadTriggers}
            onChange={(e) => setHadTriggers(e.target.value)}
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>

          {hadTriggers === "yes" && (
            <Box
              mt={3}
              p={2}
              sx={{
                borderRadius: 2,
                backgroundColor: "#fff",
                border: "1px solid #eee",
              }}
            >
              <Typography gutterBottom>
                What triggered you? (Select all that apply)
              </Typography>

              <Stack direction="row" flexWrap="wrap" gap={1.5}>
                {triggerOptions.map((trigger) => {
                  const isSelected = selectedTriggers.includes(trigger);

                  return (
                    <Chip
                      key={trigger}
                      label={trigger}
                      clickable
                      onClick={() => handleTriggerChange(trigger)}
                      sx={{
                        borderRadius: "20px",
                        px: 1.5,
                        fontWeight: 500,
                        backgroundColor: isSelected ? "#ffe0e0" : "#f5f5f5",
                        color: isSelected ? "#d32f2f" : "#555",
                        border: isSelected
                          ? "1px solid #f28b82"
                          : "1px solid transparent",
                        "&:hover": {
                          backgroundColor: isSelected ? "#ffd6d6" : "#eaeaea",
                        },
                      }}
                    />
                  );
                })}
              </Stack>
            </Box>
          )}
        </Box>

        {/* 🚶 4. BEHAVIOR */}
        <Box
          mb={4}
          p={3}
          sx={{
            borderRadius: 3,
            backgroundColor: "#f7f9fc",
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            4. 🚶 Your Day
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={2}>
            Let’s look at the positive steps you took today
          </Typography>

          <Typography gutterBottom>
            What positive things did you do today?
          </Typography>

          <Stack direction="row" flexWrap="wrap" gap={1.5} mb={3}>
            {positiveActionOptions.map((action) => {
              const isSelected = positiveActions.includes(action);

              return (
                <Chip
                  key={action}
                  label={action}
                  clickable
                  onClick={() => handlePositiveActionChange(action)}
                  sx={{
                    borderRadius: "20px",
                    px: 1.5,
                    fontWeight: 500,
                    backgroundColor: isSelected ? "#d0f0dc" : "#f5f5f5",
                    color: isSelected ? "#2e7d32" : "#555",
                    border: isSelected
                      ? "1px solid #81c784"
                      : "1px solid transparent",
                    "&:hover": {
                      backgroundColor: isSelected ? "#c8e6c9" : "#eaeaea",
                    },
                  }}
                />
              );
            })}
          </Stack>

          <Typography gutterBottom>
            Did you spend time alone or isolate yourself?
          </Typography>

          <RadioGroup
            row
            value={isolated}
            onChange={(e) => setIsolated(e.target.value)}
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        </Box>

        {/* 🏥 5. HEALTH & MENTAL STATE */}
        <Box
          mb={4}
          p={3}
          sx={{
            borderRadius: 3,
            backgroundColor: "#f7f9fc",
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            5. 🏥 Your Well-being
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={2}>
            Let’s check in on your body and mind
          </Typography>

          {/* Sleep */}
          <Typography gutterBottom>
            How many hours did you sleep last night?
          </Typography>

          <TextField
            type="number"
            value={sleepHours}
            onChange={(e) => setSleepHours(Number(e.target.value))}
            inputProps={{
              step: 0.5,
              min: 0,
              max: 12,
            }}
            sx={{
              mb: 3,
              width: "100%",
            }}
            size="small"
          />

          {/* Stress */}
          <Typography gutterBottom>How stressed did you feel today?</Typography>

          <Stack direction="row" spacing={2} alignItems="center" mb={3}>
            <Typography fontSize={12}>Calm</Typography>
            <Slider
              value={stressLevel}
              onChange={(e, newValue) => setStressLevel(newValue)}
              min={1}
              max={10}
              step={1}
              valueLabelDisplay="on"
              marks={sliderMarks}
              sx={{ flex: 1 }}
            />
            <Typography fontSize={12}>Very Stressed</Typography>
          </Stack>

          {/* Energy */}
          <Typography gutterBottom>How was your energy today?</Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <Typography fontSize={12}>Low</Typography>
            <Slider
              value={energyLevel}
              onChange={(e, newValue) => setEnergyLevel(newValue)}
              min={1}
              max={10}
              step={1}
              valueLabelDisplay="on"
              marks={sliderMarks}
              sx={{ flex: 1 }}
            />
            <Typography fontSize={12}>High</Typography>
          </Stack>
        </Box>

        {/* 🧠 6. CONFIDENCE CHECK */}
        <Box
          mb={4}
          p={3}
          sx={{
            borderRadius: 3,
            backgroundColor: "#f7f9fc",
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            6. 🧠 Looking Ahead
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={2}>
            Your confidence matters — be honest with yourself
          </Typography>

          <Typography gutterBottom>
            How confident are you in staying substance-free tomorrow?
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <Typography fontSize={12}>Not Confident</Typography>
            <Slider
              value={confidence}
              onChange={(e, newValue) => setConfidence(newValue)}
              min={1}
              max={10}
              step={1}
              valueLabelDisplay="on"
              marks={sliderMarks}
              sx={{ flex: 1 }}
            />
            <Typography fontSize={12}>Very Confident</Typography>
          </Stack>

          {/* Encouragement */}
          <Typography mt={2} fontSize={13} color="text.secondary">
            Every honest answer helps you grow 💙
          </Typography>
        </Box>

        {/* 📊 RISK FEEDBACK */}
        {riskScore !== null && (
          <Box
            mb={3}
            p={3}
            sx={{
              borderRadius: 3,
              backgroundColor:
                riskLevel === "High Risk"
                  ? "#ffeaea"
                  : riskLevel === "Medium Risk"
                    ? "#fff8e1"
                    : "#e8f5e9",
              border:
                riskLevel === "High Risk"
                  ? "1px solid #f5c2c7"
                  : riskLevel === "Medium Risk"
                    ? "1px solid #ffe082"
                    : "1px solid #a5d6a7",
            }}
          >
            <Typography fontWeight="bold" mb={1}>
              {riskLevel === "High Risk"
                ? "⚠️ You might need extra support today"
                : riskLevel === "Medium Risk"
                  ? "⚠️ Stay mindful — you're doing okay"
                  : "✅ You're doing well today"}
            </Typography>

            <Typography fontSize={14} mb={1}>
              Risk Level: <strong>{riskLevel}</strong> (Score: {riskScore})
            </Typography>

            {/* Smart Feedback Messages */}
            <Typography fontSize={13} color="text.secondary">
              {riskLevel === "High Risk" &&
                "Consider reaching out to a support system or engaging in a positive activity today."}

              {riskLevel === "Medium Risk" &&
                "Stay aware of your triggers and keep focusing on positive habits."}

              {riskLevel === "Low Risk" &&
                "Keep up the great work — your consistency is powerful."}
            </Typography>
          </Box>
        )}
        {/* 🔘 BUTTONS */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={handleViewHistory}>
            View History
          </Button>

          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Check-In"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default PatientCheckIn;