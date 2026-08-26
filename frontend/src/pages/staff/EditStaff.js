import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refresh");
  if (!refreshToken) return null;

  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/token/refresh/",
      {
        refresh: refreshToken,
      },
    );
    localStorage.setItem("access", response.data.access);
    return response.data.access;
  } catch (error) {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    return null;
  }
};

const requestWithRefresh = async (request) => {
  let token = localStorage.getItem("access");
  let response;

  try {
    response = await request(token);
  } catch (error) {
    if (error.response?.status !== 401) throw error;
    response = error.response;
  }

  if (response.status === 401) {
    token = await refreshAccessToken();
    if (!token) {
      throw new Error("Your session has expired. Please log in again.");
    }
    response = await request(token);
  }

  return response;
};

function EditStaff() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await requestWithRefresh((token) =>
          axios.get(`http://127.0.0.1:8000/api/staff/${id}/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        );
        setFullName(response.data.full_name || "");
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to load staff member.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedName = fullName.trim();

    if (!trimmedName) {
      setError("Full name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await requestWithRefresh((token) =>
        axios.patch(
          `http://127.0.0.1:8000/api/staff/${id}/`,
          { full_name: trimmedName },
          { headers: { Authorization: `Bearer ${token}` } },
        ),
      );
      navigate("/director/staff/all");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to update staff member.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Edit Staff Member
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 520 }}>
        <Stack spacing={3}>
          <TextField
            label="Full Name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
            autoFocus
            fullWidth
          />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => navigate("/director/staff/all")}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

export default EditStaff;
