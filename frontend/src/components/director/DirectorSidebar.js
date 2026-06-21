import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import GroupIcon from "@mui/icons-material/Group";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import BarChartIcon from "@mui/icons-material/BarChart";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { jwtDecode } from "jwt-decode";
import EventNoteIcon from "@mui/icons-material/EventNote";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ChatIcon from "@mui/icons-material/Chat";
import InsightsIcon from "@mui/icons-material/Insights";
import WarningIcon from "@mui/icons-material/Warning";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MessageIcon from "@mui/icons-material/Message";
import PersonIcon from "@mui/icons-material/Person";
import ShowChartIcon from "@mui/icons-material/ShowChart";

function DirectorSidebar({ collapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [openPatients, setOpenPatients] = useState(false);
  const [openStaff, setOpenStaff] = useState(false);
  const [openAdmin, setOpenAdmin] = useState(false);
  const [openSupport, setOpenSupport] = useState(false);
  const [openMyPatients, setOpenMyPatients] = useState(false);
  const [openAlerts, setOpenAlerts] = useState(false);

  const [user, setUser] = useState({
    full_name: "",
    role: "",
  });

  // 🔥 Auto-open submenus based on route
  useEffect(() => {
    if (location.pathname.startsWith("/director/patients")) {
      setOpenPatients(true);
    }
    if (location.pathname.startsWith("/director/staff")) {
      setOpenStaff(true);
    }
    if (location.pathname.startsWith("/director/admin")) {
      setOpenAdmin(true);
    }
    if (location.pathname.startsWith("/director/my-patients")) {
      setOpenMyPatients(true);
    }
    if (location.pathname.startsWith("/director/alerts")) {
      setOpenAlerts(true);
    }
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;
  const isPatientRoute = location.pathname.startsWith("/director/patients");
  const isStaffRoute = location.pathname.startsWith("/director/staff");
  const isAdminRoute = location.pathname.startsWith("/director/admin");
  const isMyPatientsRoute = location.pathname.startsWith(
    "/director/my-patients",
  );
  const isAlertsRoute = location.pathname.startsWith("/director/alerts");

  useEffect(() => {
    const token = localStorage.getItem("access");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          full_name: decoded.full_name,
          role: decoded.role,
        });
      } catch (error) {
        console.error("Invalid token", error);
      }
    }
  }, []);

  const userRole = user.role?.toLowerCase();
  const isPatient = userRole === "patient";
  const isDirector = userRole === "director";

  // ✅ Roles that should see the new menu items (everyone except Patient and Director)
  const shouldShowStaffMenu = !isPatient && !isDirector;

  // Specific role checks for additional permissions
  const isAdmin = userRole === "admin";
  const isCounselor = userRole === "counsellor";
  const isPsychologist = userRole === "psychologist";
  const isNurse = userRole === "nurse";
  const isStaff = userRole === "staff";
  const isSocialWorker = userRole === "social-worker";
  const isOccupationalTherapist = userRole === "occupational-therapist";
  const isNurseAid = userRole === "nurse-aid";
  const isPsychiatrist = userRole === "psychiatrist";
  const isFamilyTherapist = userRole === "family-therapist";

  // Function to render menu for staff (non-patient, non-director roles)
  const renderStaffMenu = () => (
    <>
      {/* Home */}
      <ListItemButton
        selected={isActive("/director")}
        onClick={() => navigate("/director")}
      >
        <ListItemIcon>
          <HomeIcon />
        </ListItemIcon>
        {!collapsed && <ListItemText primary="Home" />}
      </ListItemButton>

      {/* My Patients */}
      <ListItemButton
        selected={isActive("/director/staff/my-patients")}
        onClick={() => navigate("/director/staff/my-patients")}
      >
        <ListItemIcon>
          <PeopleIcon />
        </ListItemIcon>
        {!collapsed && <ListItemText primary="My Patients" />}
      </ListItemButton>

      {/* Alerts & Relapse Risk */}
      <ListItemButton
        selected={isActive("/director/patients/alerts")}
        onClick={() => navigate("/director/patients/alerts")}
      >
        <ListItemIcon>
          <NotificationsIcon />
        </ListItemIcon>
        {!collapsed && <ListItemText primary="Alerts & Notifications" />}
      </ListItemButton>

      {/* Relapse Risk Monitor */}
      <ListItemButton
        selected={isActive("/director/patients/relapse-monitor")}
        onClick={() => navigate("/director/patients/relapse-monitor")}
      >
        <ListItemIcon>
          <ShowChartIcon />
        </ListItemIcon>
        {!collapsed && <ListItemText primary="Relapse Risk Monitor" />}
      </ListItemButton>

      

      

      {/* Admin section - only for admin role */}
      {(isAdmin || isDirector) && (
        <>
          <ListItemButton
            selected={isAdminRoute}
            onClick={() => setOpenAdmin(!openAdmin)}
          >
            <ListItemIcon>
              <AdminPanelSettingsIcon />
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Admin" />}
            {!collapsed && (openAdmin ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>

          <Collapse in={openAdmin && !collapsed} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                sx={{ pl: 7 }}
                selected={isActive("/director/admin/new-user")}
                onClick={() => navigate("/director/admin/new-user")}
              >
                <ListItemText primary="New User" />
              </ListItemButton>
            </List>
          </Collapse>
        </>
      )}
    </>
  );

  // Function to render patient-specific menu items
  const renderPatientMenu = () => (
    <>
      {/* Home */}
      <ListItemButton
        selected={isActive("/director/patients/patient-dashboard")}
        onClick={() => navigate("/director/patients/patient-dashboard")}
      >
        <ListItemIcon>
          <HomeIcon />
        </ListItemIcon>
        {!collapsed && <ListItemText primary="Home" />}
      </ListItemButton>

      {/* View Personal Details */}
      <ListItemButton
        selected={isActive("/director/patients/patient-profile")}
        onClick={() => navigate("/director/patients/patient-profile")}
      >
        <ListItemIcon>
          <PersonIcon />
        </ListItemIcon>
        {!collapsed && <ListItemText primary="My Profile" />}
      </ListItemButton>

      {/* Daily Check-In */}
      <ListItemButton
        selected={isActive("/director/patients/check-in")}
        onClick={() => navigate("/director/patients/check-in")}
      >
        <ListItemIcon>
          <EventNoteIcon />
        </ListItemIcon>
        {!collapsed && <ListItemText primary="Daily Check-In" />}
      </ListItemButton>

      {/* Journal */}
      <ListItemButton
        selected={isActive("/director/patients/journal")}
        onClick={() => navigate("/director/patients/journal")}
      >
        <ListItemIcon>
          <MenuBookIcon />
        </ListItemIcon>
        {!collapsed && <ListItemText primary="Journal" />}
      </ListItemButton>

      {/* AI Chat */}
      <ListItemButton
        selected={isActive("/director/patients/chat")}
        onClick={() => navigate("/director/patients/chat")}
      >
        <ListItemIcon>
          <ChatIcon />
        </ListItemIcon>
        {!collapsed && <ListItemText primary="AI Chat" />}
      </ListItemButton>
    </>
  );

  // Function to render director-specific menu items (full access)
  const renderDirectorMenu = () => (
    <>
      {/* Home */}
      <ListItemButton
        selected={isActive("/director")}
        onClick={() => navigate("/director")}
      >
        <ListItemIcon>
          <HomeIcon />
        </ListItemIcon>
        {!collapsed && <ListItemText primary="Home" />}
      </ListItemButton>

      {/* Patients */}
      <ListItemButton
        selected={isPatientRoute}
        onClick={() => setOpenPatients(!openPatients)}
      >
        <ListItemIcon>
          <PeopleIcon />
        </ListItemIcon>
        {!collapsed && <ListItemText primary="Patients" />}
        {!collapsed && (openPatients ? <ExpandLess /> : <ExpandMore />)}
      </ListItemButton>

      <Collapse in={openPatients && !collapsed} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton
            sx={{ pl: 7 }}
            selected={isActive("/director/patients/all-patients")}
            onClick={() => navigate("/director/patients/all-patients")}
          >
            <ListItemText primary="All Patients" />
          </ListItemButton>

          <ListItemButton
            sx={{ pl: 7 }}
            selected={isActive("/director/patients/new")}
            onClick={() => navigate("/director/patients/new")}
          >
            <ListItemText primary="New Patient" />
          </ListItemButton>
        </List>
      </Collapse>

      {/* Staff / Human Resources */}
      <ListItemButton
        selected={isStaffRoute}
        onClick={() => setOpenStaff(!openStaff)}
      >
        <ListItemIcon>
          <GroupIcon />
        </ListItemIcon>
        {!collapsed && <ListItemText primary="Human Resources" />}
        {!collapsed && (openStaff ? <ExpandLess /> : <ExpandMore />)}
      </ListItemButton>

      <Collapse in={openStaff && !collapsed} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton
            sx={{ pl: 7 }}
            selected={isActive("/director/staff/all")}
            onClick={() => navigate("/director/staff/all")}
          >
            <ListItemText primary="All Staff" />
          </ListItemButton>

          <ListItemButton
            sx={{ pl: 7 }}
            selected={isActive("/director/staff/new")}
            onClick={() => navigate("/director/staff/new")}
          >
            <ListItemText primary="New Staff Member" />
          </ListItemButton>
        </List>
      </Collapse>

      

           

      {/* Admin */}
      <ListItemButton
        selected={isAdminRoute}
        onClick={() => setOpenAdmin(!openAdmin)}
      >
        <ListItemIcon>
          <AdminPanelSettingsIcon />
        </ListItemIcon>
        {!collapsed && <ListItemText primary="Admin" />}
        {!collapsed && (openAdmin ? <ExpandLess /> : <ExpandMore />)}
      </ListItemButton>

      <Collapse in={openAdmin && !collapsed} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton
            sx={{ pl: 7 }}
            selected={isActive("/director/admin/new-user")}
            onClick={() => navigate("/director/admin/new-user")}
          >
            <ListItemText primary="New User" />
          </ListItemButton>
        </List>
      </Collapse>
    </>
  );

  return (
    <Box
      sx={{
        width: collapsed ? 80 : 260,
        backgroundColor: "#ffffff",
        minHeight: "100vh",
        transition: "width 0.3s ease",
        overflowX: "hidden",
        borderRight: "1px solid #eee",
      }}
    >
      {/* 🔷 HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 2,
          gap: 1.5,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <Box
          sx={{
            width: collapsed ? 64 : 100,
            height: collapsed ? 64 : 100,
            borderRadius: "50%",
            backgroundColor: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            component="img"
            src="/logo.png"
            alt="FASAA Logo"
            sx={{ width: "85%", height: "85%", objectFit: "contain" }}
          />
        </Box>

        {!collapsed && (
          <Box>
            <Typography fontWeight="bold">
              {user.full_name || "User"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user.role
                ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                : ""}
            </Typography>
          </Box>
        )}
      </Box>

      {/* 📂 MENU - Render based on user role */}
      <List>
        {isPatient && renderPatientMenu()}
        {isDirector && renderDirectorMenu()}
        {shouldShowStaffMenu && renderStaffMenu()}
      </List>
    </Box>
  );
}

export default DirectorSidebar;
