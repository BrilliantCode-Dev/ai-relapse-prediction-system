import React, { useState, useEffect } from "react";
import axios from "axios";
import { Grid, Box, Typography, Paper, Stack, Button } from "@mui/material";

import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import EventNoteIcon from "@mui/icons-material/EventNote";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EmojiNatureIcon from "@mui/icons-material/EmojiNature";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import FlutterDashIcon from "@mui/icons-material/FlutterDash";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";

function PatientDashboard() {
  const [stats, setStats] = useState({
    daysInRecovery: 0,
    checkinsCompleted: 0,
    totalJournals: 0,
    upcomingSessions: 0,
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.full_name || user.email || "User";
  const BASE_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("access");
      if (!token) return;

      try {
        // Fetch patient profile for registration date
        const profileRes = await axios.get(`${BASE_URL}/api/clients/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const patient = profileRes.data;

        // Calculate days in recovery
        const registrationDate = new Date(patient.date);
        const today = new Date();
        const daysInRecovery = Math.floor(
          (today - registrationDate) / (1000 * 60 * 60 * 24),
        );

        // Fetch checkins
        const checkinsRes = await axios.get(
          `${BASE_URL}/api/clients/dailycheckin/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const checkinsCompleted = checkinsRes.data.length;

        // Fetch journals
        const journalsRes = await axios.get(
          `${BASE_URL}/api/clients/journalentry/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const totalJournals = journalsRes.data.length;

        // Upcoming sessions - assuming 2 for now, or fetch from appointments if available
        const upcomingSessions = 2;

        setStats({
          daysInRecovery,
          checkinsCompleted,
          totalJournals,
          upcomingSessions,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  // Define consistent styles
  const welcomeHeadingStyle = {
    fontSize: "23px",
    fontWeight: 700,
    color: "#1f2937",
    lineHeight: 1.2,
  };

  // New smaller heading style for main content (reduced size)
  const contentHeadingStyle = {
    fontSize: "18px",
    fontWeight: 600,
    color: "#1f2937",
    lineHeight: 1.3,
  };

  const statsCardHeadingStyle = {
    fontSize: "14px",
    fontWeight: 600,
    color: "#374151",
    mb: 0.5,
  };

  const paragraphStyle = {
    fontSize: "13px",
    color: "#6b7280",
  };

  const smallParagraphStyle = {
    fontSize: "13px",
    color: "#6b7280",
  };

  const statCards = [
    {
      title: "Days in Recovery",
      value: stats.daysInRecovery,
      subtitle: "Keep going strong!",
      bg: "#ffffff",
      color: "#5b5ce2",
      icon: <PeopleIcon sx={{ color: "#fff", fontSize: 32 }} />,
    },
    {
      title: "Check-ins Completed",
      value: stats.checkinsCompleted,
      subtitle: "Great job!",
      bg: "#ffffff",
      color: "#f9a826",
      icon: <CheckCircleIcon sx={{ color: "#fff", fontSize: 32 }} />,
    },
    {
      title: "Total Journals",
      value: stats.totalJournals,
      subtitle: "Keep reflecting!",
      bg: "#ffffff",
      color: "#4caf50",
      icon: <MenuBookIcon sx={{ color: "#fff", fontSize: 32 }} />,
    },
    {
      title: "Upcoming Sessions",
      value: stats.upcomingSessions,
      subtitle: "Stay prepared!",
      bg: "#ffffff",
      color: "#ef5350",
      icon: <EventNoteIcon sx={{ color: "#fff", fontSize: 32 }} />,
    },
  ];

  return (
    <>
      <Box>
        {/* 🔵 BLUE CARD - Applied from AI Chat Page */}
        <Box
          sx={{
            p: 3,
            borderRadius: 3,
            background: "linear-gradient(90deg, #1976d2, #0d47a1)",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Welcome back, {userName}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Your recovery journey is unique, and every small step forward matters.
            </Typography>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid
          container
          spacing={3}
          sx={{
            mb: 10,
          }}
        >
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  background: card.bg,
                  border: "1px solid #f0f0f0",
                  transition: "0.3s",
                  height: "100%",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                  },
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      backgroundColor: card.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {card.icon}
                  </Box>

                  <Box>
                    <Typography sx={statsCardHeadingStyle}>
                      {card.title}
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: card.color,
                        fontSize: "1.8rem",
                        lineHeight: 1.2,
                      }}
                    >
                      {card.value}
                    </Typography>

                    <Typography sx={paragraphStyle}>{card.subtitle}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Main Content */}

        <Grid container spacing={3} sx={{ mb: 8 }}>
          {/* Today's Focus Full Width */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 5,
                borderRadius: 5,
                backgroundColor: "#fff",
                border: "1px solid #f0f0f0",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                <EmojiNatureIcon
                  sx={{
                    color: "#4caf50",
                    fontSize: 30,
                  }}
                />

                <Typography sx={contentHeadingStyle}>Today's Focus</Typography>
              </Stack>

              <Typography sx={paragraphStyle}>
                Small daily actions lead to big changes.
              </Typography>

              {/* Main Content */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  flexWrap: {
                    xs: "wrap",
                    md: "nowrap",
                  },
                }}
              >
                {/* Left Image */}
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop"
                  alt="Nature"
                  sx={{
                    width: {
                      xs: "100%",
                      md: 420,
                    },
                    height: 320,
                    objectFit: "cover",
                    borderRadius: 4,
                    flexShrink: 0,
                  }}
                />

                {/* Right Content */}
                <Stack spacing={4} sx={{ flex: 1 }}>
                  {/* Item 1 */}
                  <Stack direction="row" spacing={2.5}>
                    <Box
                      sx={{
                        width: 58,
                        height: 58,
                        borderRadius: "50%",
                        backgroundColor: "#e8f8ec",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircleOutlineIcon
                        sx={{
                          color: "#4caf50",
                          fontSize: 28,
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography sx={contentHeadingStyle}>
                        Check-in with yourself
                      </Typography>

                      <Typography sx={paragraphStyle}>
                        Log your emotions, track your daily progress, and stay
                        aware of how you're feeling.
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Item 2 */}
                  <Stack direction="row" spacing={2.5}>
                    <Box
                      sx={{
                        width: 58,
                        height: 58,
                        borderRadius: "50%",
                        backgroundColor: "#e8f8ec",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <AutoStoriesIcon
                        sx={{
                          color: "#4caf50",
                          fontSize: 28,
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography sx={contentHeadingStyle}>
                        Write in your journal
                      </Typography>

                      <Typography sx={paragraphStyle}>
                        Reflect on your thoughts and experiences to better
                        understand your healing journey.
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Item 3 */}
                  <Stack direction="row" spacing={2.5}>
                    <Box
                      sx={{
                        width: 58,
                        height: 58,
                        borderRadius: "50%",
                        backgroundColor: "#e8f8ec",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <SelfImprovementIcon
                        sx={{
                          color: "#4caf50",
                          fontSize: 28,
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography sx={contentHeadingStyle}>
                        Stay positive
                      </Typography>

                      <Typography sx={paragraphStyle}>
                        Every small step counts. Focus on progress, not
                        perfection, and keep moving forward.
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Bottom Section */}
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            p: 3,
            borderRadius: 4,
            background: "linear-gradient(90deg, #eefaf0 0%, #f5fff8 100%)",
            border: "1px solid #e8f5e9",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <FavoriteIcon
                sx={{
                  color: "#4caf50",
                  fontSize: 35,
                }}
              />

              <Box>
                <Typography sx={contentHeadingStyle}>Daily Tip</Typography>

                <Typography sx={paragraphStyle}>
                  Take a deep breath. You are stronger than you think.
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="outlined"
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Need Support?
            </Button>
          </Stack>
        </Paper>
      </Box>
    </>
  );
}

export default PatientDashboard;