import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PersonIcon from "@mui/icons-material/Person";

function DirectorTopbar({ onToggle }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    setAnchorEl(null);
    // Clear auth tokens from localStorage
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    // Redirect to login page
    navigate("/login");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "#ffffff",
        color: "#1f2937",
        borderBottom: "1px solid #eee",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        {/* ☰ Sidebar Toggle */}
        <IconButton
          onClick={onToggle}
          edge="start"
          sx={{ color: "#1f2937", mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* 👤 User Profile */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={handleOpenMenu}
        >
          {/* Avatar */}
          <Avatar
            sx={{
              width: 40,
              height: 40,
              mr: 1,
              backgroundColor: "#f3f4f6",
              color: "#1f2937",
            }}
          >
            <PersonIcon />
          </Avatar>

          {/* Arrow */}
          <KeyboardArrowDownIcon />
        </Box>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleCloseMenu}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={handleLogout}>
            <Typography color="error">Logout</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default DirectorTopbar;
