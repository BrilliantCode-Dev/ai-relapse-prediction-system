import React, { useState } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import DirectorSidebar from "../components/director/DirectorSidebar";
import DirectorTopbar from "../components/director/DirectorTopbar";

function DirectorLayout() {
  const [collapsed, setCollapsed] = useState(false);

  //const drawerWidth = collapsed ? 80 : 240; // adjust based on your sidebar

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      
      {/* 🔷 Sidebar */}
      <DirectorSidebar collapsed={collapsed} />

      {/* 🔷 Main Area */}
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: "#f9fafb",          
          transition: "all 0.3s ease",
        }}
      >
        
        {/* 🔷 Topbar */}
        <DirectorTopbar
          onToggle={() => setCollapsed((prev) => !prev)}
        />

        {/* 🔷 Page Content */}
        <Box
          sx={{
            px: { xs: 2, sm: 4 }, // ✅ LEFT + RIGHT SPACING
            py: 3,                // ✅ TOP + BOTTOM SPACING
          }}
        >
          {/* 🔷 CENTER CONTENT NICELY */}
          <Box
            sx={{
              maxWidth: "1400px",
              mx: "auto",
            }}
          >
            <Outlet />
          </Box>
        </Box>

      </Box>
    </Box>
  );
}

export default DirectorLayout;