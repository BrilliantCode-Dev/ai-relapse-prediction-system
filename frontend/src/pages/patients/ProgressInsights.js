import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Stack,
  Card,
  CardContent,
  Chip,
  Button,
  LinearProgress,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Legend
} from "recharts";
import axios from "axios";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import InsightsIcon from "@mui/icons-material/Insights";

// Sample Data (will be replaced with real data)
const sampleMoodData = [
  { day: "Mon", mood: 3, date: "2024-03-18" },
  { day: "Tue", mood: 4, date: "2024-03-19" },
  { day: "Wed", mood: 5, date: "2024-03-20" },
  { day: "Thu", mood: 3, date: "2024-03-21" },
  { day: "Fri", mood: 2, date: "2024-03-22" },
  { day: "Sat", mood: 3, date: "2024-03-23" },
  { day: "Sun", mood: 4, date: "2024-03-24" }
];

const sampleCravingData = [
  { day: "Mon", value: 5, intensity: 5 },
  { day: "Tue", value: 6, intensity: 6 },
  { day: "Wed", value: 7, intensity: 7 },
  { day: "Thu", value: 10, intensity: 10 },
  { day: "Fri", value: 7, intensity: 7 },
  { day: "Sat", value: 8, intensity: 8 },
  { day: "Sun", value: 6, intensity: 6 }
];

const sampleConfidenceData = [
  { day: "Mon", confidence: 6 },
  { day: "Tue", confidence: 5 },
  { day: "Wed", confidence: 7 },
  { day: "Thu", confidence: 4 },
  { day: "Fri", confidence: 6 },
  { day: "Sat", confidence: 7 },
  { day: "Sun", confidence: 8 }
];

const sampleRecentActivities = [
  { id: 1, type: "checkin", message: "Completed daily check-in", date: "Today", time: "2 hours ago", icon: "✅" },
  { id: 2, type: "journal", message: "Wrote a journal entry", date: "2 days ago", time: "Yesterday", icon: "📘" },
  { id: 3, type: "craving", message: "Experienced cravings (intensity: 7/10)", date: "5 days ago", time: "March 22", icon: "⚠️" },
  { id: 4, type: "milestone", message: "Reached 30 days sober!", date: "1 week ago", time: "March 18", icon: "🏆" }
];

function ProgressInsights() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [moodData, setMoodData] = useState([]);
  const [cravingData, setCravingData] = useState([]);
  const [confidenceData, setConfidenceData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [stats, setStats] = useState({
    soberDays: 168,
    checkIns: 54,
    journalEntries: 32,
    streak: 12
  });
  const [aiInsight, setAiInsight] = useState(null);
  const [error, setError] = useState(null);

  const BASE_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    const token = localStorage.getItem('access');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'patient' && user.role !== 'director') {
        navigate('/login');
        return;
      }
      
      fetchData(token);
    } catch (err) {
      console.error("Error parsing user data:", err);
      navigate('/login');
    }
  }, [navigate]);

  const fetchData = async (token) => {
    try {
      setLoading(true);
      
      // Fetch patient profile
      const profileResponse = await axios.get(`${BASE_URL}/api/clients/profile/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPatient(profileResponse.data);
      
      // Fetch mood trends
      const moodResponse = await axios.get(`${BASE_URL}/api/checkin/mood-trends/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMoodData(moodResponse.data.length > 0 ? moodResponse.data : sampleMoodData);
      
      // Fetch craving trends
      const cravingResponse = await axios.get(`${BASE_URL}/api/checkin/craving-trends/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCravingData(cravingResponse.data.length > 0 ? cravingResponse.data : sampleCravingData);
      
      // Fetch confidence trends
      const confidenceResponse = await axios.get(`${BASE_URL}/api/checkin/confidence-trends/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setConfidenceData(confidenceResponse.data.length > 0 ? confidenceResponse.data : sampleConfidenceData);
      
      // Fetch stats
      const statsResponse = await axios.get(`${BASE_URL}/api/patient/stats/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStats(statsResponse.data);
      
      // Fetch recent activities
      const activitiesResponse = await axios.get(`${BASE_URL}/api/patient/recent-activities/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setRecentActivities(activitiesResponse.data.length > 0 ? activitiesResponse.data : sampleRecentActivities);
      
      // Generate AI insight
      generateAIInsight(moodResponse.data, cravingResponse.data);
      
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      // Use sample data if API fails
      setMoodData(sampleMoodData);
      setCravingData(sampleCravingData);
      setConfidenceData(sampleConfidenceData);
      setRecentActivities(sampleRecentActivities);
      generateAIInsight(sampleMoodData, sampleCravingData);
      setError("Using demo data. Connect to backend for real insights.");
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsight = (mood, craving) => {
    // Simple AI insight generation based on trends
    if (craving.length > 0) {
      const lastThreeCraving = craving.slice(-3);
      const avgCraving = lastThreeCraving.reduce((sum, c) => sum + (c.value || c.intensity || 0), 0) / 3;
      
      if (avgCraving > 7) {
        setAiInsight({
          type: "warning",
          message: "Your cravings have been consistently high over the past few days. Consider reaching out to your counselor or trying relaxation techniques.",
          recommendation: "Practice deep breathing exercises and stay connected with your support system."
        });
      } else if (avgCraving > 4) {
        setAiInsight({
          type: "info",
          message: "Your cravings are moderate. You're doing well managing them, but stay vigilant.",
          recommendation: "Continue using your coping strategies and celebrate your progress."
        });
      } else {
        setAiInsight({
          type: "success",
          message: "Great job! Your cravings are well-managed. Keep up the excellent work!",
          recommendation: "Share your strategies with others in your support group."
        });
      }
    } else {
      setAiInsight({
        type: "info",
        message: "Continue tracking your moods and cravings to get personalized insights.",
        recommendation: "Complete daily check-ins to build your progress profile."
      });
    }
  };

  const getMoodColor = (mood) => {
    if (mood <= 2) return "#f44336";
    if (mood <= 3) return "#ff9800";
    if (mood <= 4) return "#4caf50";
    return "#2196f3";
  };

  const getTrendIcon = (data) => {
    if (data.length < 2) return null;
    const last = data[data.length - 1]?.value || data[data.length - 1]?.mood || 0;
    const previous = data[data.length - 2]?.value || data[data.length - 2]?.mood || 0;
    
    if (last > previous) return <TrendingUpIcon sx={{ color: "#4caf50", fontSize: 20 }} />;
    if (last < previous) return <TrendingDownIcon sx={{ color: "#f44336", fontSize: 20 }} />;
    return null;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

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
        <Stack direction="row" alignItems="center" spacing={2}>       
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Progress & Insights
            </Typography>
            <Typography variant="body2">
              Keep track of your recovery progress, {patient?.fullName || "Prud"}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Error Message if using demo data */}
      {error && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* 📊 SUMMARY CARDS */}
      <Grid container spacing={3} mb={3}>
  
  {/* 🟢 SOBER DAYS */}
  <Grid item xs={12} sm={6} md={3}>
    <Card
      sx={{
        borderRadius: 4,
        background: "linear-gradient(135deg, #4caf50, #2e7d32)",
        color: "#fff",
        boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 12px 25px rgba(0,0,0,0.25)"
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between">
          
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {stats.soberDays}
            </Typography>

            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              Days Sober
            </Typography>
          </Box>

          <EmojiEventsIcon sx={{ fontSize: 42, opacity: 0.7 }} />
        </Stack>

        {/* Progress */}
        <Box mt={3}>
          <LinearProgress
            variant="determinate"
            value={Math.min((stats.soberDays / 365) * 100, 100)}
            sx={{
              height: 8,
              borderRadius: 5,
              bgcolor: "rgba(255,255,255,0.25)",
              "& .MuiLinearProgress-bar": {
                bgcolor: "#fff"
              }
            }}
          />
          <Typography variant="caption" sx={{ mt: 1, opacity: 0.8 }}>
            {stats.streak} day streak
          </Typography>
        </Box>
      </CardContent>
    </Card>
  </Grid>

  {/* 🔵 CHECK-INS */}
  <Grid item xs={12} sm={6} md={3}>
    <Card
      sx={{
        borderRadius: 4,
        background: "linear-gradient(135deg, #2196f3, #1565c0)",
        color: "#fff",
        boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-5px)"
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {stats.checkIns}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              Check-Ins
            </Typography>
          </Box>
          <AssessmentIcon sx={{ fontSize: 42, opacity: 0.7 }} />
        </Stack>

        <Typography sx={{ mt: 3, fontSize: 13, opacity: 0.85 }}>
          {Math.round((stats.checkIns / 30) * 100)}% monthly consistency
        </Typography>
      </CardContent>
    </Card>
  </Grid>

  {/* 🟠 JOURNAL */}
  <Grid item xs={12} sm={6} md={3}>
    <Card
      sx={{
        borderRadius: 4,
        background: "linear-gradient(135deg, #ff9800, #ef6c00)",
        color: "#fff",
        boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-5px)"
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {stats.journalEntries}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              Journal Entries
            </Typography>
          </Box>
          <MenuBookIcon sx={{ fontSize: 42, opacity: 0.7 }} />
        </Stack>

        <Button
          fullWidth
          size="small"
          variant="contained"
          sx={{
            mt: 3,
            bgcolor: "#fff",
            color: "#ef6c00",
            borderRadius: 2,
            textTransform: "none",
            fontWeight: "bold",
            "&:hover": {
              bgcolor: "#fff3e0"
            }
          }}
          onClick={() => navigate('/director/patients/journal')}
        >
          + New Entry
        </Button>
      </CardContent>
    </Card>
  </Grid>

  {/* 🟣 SUCCESS RATE */}
  <Grid item xs={12} sm={6} md={3}>
    <Card
      sx={{
        borderRadius: 4,
        background: "linear-gradient(135deg, #9c27b0, #6a1b9a)",
        color: "#fff",
        boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-5px)"
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {Math.round((stats.soberDays / 30) * 100)}%
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              Success Rate
            </Typography>
          </Box>
          <InsightsIcon sx={{ fontSize: 42, opacity: 0.7 }} />
        </Stack>

        <Typography sx={{ mt: 3, fontSize: 13, opacity: 0.85 }}>
          Keep going — you're improving daily 🚀
        </Typography>
      </CardContent>
    </Card>
  </Grid>

</Grid>

      {/* 🤖 AI INSIGHT CARD */}
      {aiInsight && (
        <Paper 
          sx={{ 
            p: 2.5, 
            borderRadius: 3, 
            mb: 3,
            bgcolor: aiInsight.type === "warning" ? "#fff3e0" : aiInsight.type === "success" ? "#e8f5e9" : "#e3f2fd",
            borderLeft: `4px solid ${aiInsight.type === "warning" ? "#ff9800" : aiInsight.type === "success" ? "#4caf50" : "#2196f3"}`
          }}
        >
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Typography variant="h5" sx={{ fontSize: 32 }}>
              {aiInsight.type === "warning" ? "⚠️" : aiInsight.type === "success" ? "🎉" : "🤖"}
            </Typography>
            <Box flex={1}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                AI Insight
              </Typography>
              <Typography variant="body2" paragraph>
                {aiInsight.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                💡 Recommendation: {aiInsight.recommendation}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      {/* 📈 CHARTS SECTION */}
      <Typography variant="h6" fontWeight="bold" mb={2}>
        Your Progress Trends
      </Typography>
      
      <Grid container spacing={3} mb={3}>
        {/* Mood Trend */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                Mood Trend
              </Typography>
              <Chip 
                icon={<CalendarTodayIcon />} 
                label="Last 7 Days" 
                size="small" 
                variant="outlined"
              />
            </Stack>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[1, 5]} />
                <RechartsTooltip />
                <Area 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#4caf50" 
                  fill="url(#colorMood)" 
                  fillOpacity={0.3}
                />
                <defs>
                  <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4caf50" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4caf50" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
            <Stack direction="row" justifyContent="center" spacing={2} mt={1}>
              <Chip label="😊 Good" size="small" sx={{ bgcolor: "#4caf50", color: "#fff" }} />
              <Chip label="😐 Okay" size="small" sx={{ bgcolor: "#ff9800", color: "#fff" }} />
              <Chip label="😔 Low" size="small" sx={{ bgcolor: "#f44336", color: "#fff" }} />
            </Stack>
          </Paper>
        </Grid>

        {/* Craving Trend */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                Craving Trend
              </Typography>
              <Chip 
                icon={<LocalFireDepartmentIcon />} 
                label="Intensity" 
                size="small" 
                variant="outlined"
                color="error"
              />
            </Stack>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={cravingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 10]} />
                <RechartsTooltip />
                <Bar dataKey="value" fill="#f44336" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <Stack direction="row" justifyContent="center" spacing={1} mt={1}>
              <Typography variant="caption" color="text.secondary">
                🔥 Higher bars = stronger cravings
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        {/* Confidence Trend */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                Confidence Trend
              </Typography>
              <Chip 
                icon={<EmojiEventsIcon />} 
                label="Stay Substance-Free" 
                size="small" 
                variant="outlined"
                color="success"
              />
            </Stack>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 10]} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="confidence" stroke="#4caf50" strokeWidth={2} dot={{ fill: "#4caf50" }} />
              </LineChart>
            </ResponsiveContainer>
            <Stack direction="row" justifyContent="center" spacing={2} mt={1}>
              <Typography variant="caption" color="text.secondary">
                📈 Higher confidence = Better recovery outcomes
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        {/* Combined Insights */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Key Insights
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Mood-Craving Correlation
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={65} 
                  sx={{ height: 8, borderRadius: 4 }}
                  color="warning"
                />
                <Typography variant="caption" color="text.secondary">
                  65% of high cravings occur on low mood days
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Best Days for Recovery
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip label="Thursday" size="small" color="success" />
                  <Chip label="Saturday" size="small" color="success" />
                  <Chip label="Sunday" size="small" color="success" />
                </Stack>
                <Typography variant="caption" color="text.secondary" mt={1} display="block">
                  You show highest confidence on weekends
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* 📝 RECENT PROGRESS */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Recent Progress
        </Typography>
        
        <Stack spacing={2}>
          {recentActivities.map((activity) => (
            <Stack 
              key={activity.id} 
              direction="row" 
              spacing={2} 
              alignItems="center"
              sx={{ 
                p: 1.5, 
                borderRadius: 2,
                bgcolor: activity.type === "craving" ? "#fff3e0" : "transparent",
                '&:hover': { bgcolor: "#f5f5f5" }
              }}
            >
              <Typography variant="h5">{activity.icon}</Typography>
              <Box flex={1}>
                <Typography variant="body2" fontWeight="500">
                  {activity.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {activity.time}
                </Typography>
              </Box>
              <Chip 
                label={activity.date} 
                size="small" 
                variant="outlined"
                icon={<CalendarTodayIcon />}
              />
            </Stack>
          ))}
        </Stack>
        
        <Divider sx={{ my: 2 }} />
        
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button 
            variant="outlined" 
            onClick={() => navigate('/director/patients/journal')}
          >
            View Journal
          </Button>
          <Button 
            variant="contained" 
            onClick={() => navigate('/director/patients/patient-dashboard')}
          >
            Back to Dashboard
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default ProgressInsights;