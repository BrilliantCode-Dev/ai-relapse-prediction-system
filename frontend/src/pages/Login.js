import React, { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  TextField,
  InputAdornment,
  Alert,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

function Login() {
  // ✅ Backend expects EMAIL
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ UI state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      console.log("LOGIN CLICKED", { email, password });

      // ✅ USE EMAIL (NOT username)
      const data = await loginUser(email, password);

console.log("Login response:", data);

// 🔐 SAVE TOKENS
localStorage.setItem("access", data.access);
localStorage.setItem("refresh", data.refresh);

// SAVE USER INFO
localStorage.setItem(
  "user",
  JSON.stringify({
    email: data.email,
    full_name: data.full_name,
    role: data.role,
  })
);

if (data.role === "patient") {
  navigate("/director/patients/patient-dashboard");
} 
else if (data.role === "director") {
  navigate("/director");
} 
else {
  // ✅ ALL OTHER ROLES = STAFF
  navigate("/director/staff/staff-dashboard");
}


    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: "url('/login-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 400,
          p: 4,
          borderRadius: 3,
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* LOGO */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <img src="/logo.png" alt="Logo" style={{ height: 90 }} />
        </Box>

        <Typography align="center" fontWeight={700} fontSize={24}>
          Main System
        </Typography>

        <Typography
          variant="body2"
          align="center"
          color="text.secondary"
          mb={2}
        >
          Enter Your Credentials
        </Typography>

        {/* ❌ ERROR */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* EMAIL */}
        <TextField
          fullWidth
          label="Email"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* PASSWORD */}
        <TextField
          fullWidth
          label="Password"
          type="password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* REMEMBER ME */}
        <FormControlLabel
          control={<Checkbox />}
          label="Keep me signed in"
          sx={{ mt: 1 }}
        />

        {/* LOGIN BUTTON */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          disabled={loading}
          sx={{ mt: 3, py: 1.4, fontWeight: "bold" }}
        >
          {loading ? "Logging in..." : "LOGIN"}
        </Button>
      </Card>
    </Box>
  );
}

export default Login;
