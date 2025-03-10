/* frontend/src/components/navigation.ApPBar.tsx */

"use client";

import React, { useState } from "react";
import {
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  Tooltip,
  alpha,
  Fade,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Menu as MenuIcon,
  RestaurantMenu as RestaurantIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from "@mui/icons-material";
import { usePathname } from "next/navigation";

// Styled AppBar with subtle gradient
const GradientAppBar = styled(MuiAppBar)(({ theme }) => ({
  backgroundImage: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
  boxShadow: `0 2px 10px ${alpha(theme.palette.common.black, 0.1)}`,
}));

interface AppBarProps {
  onMenuClick: () => void;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
  isDrawerOpen?: boolean;
}

const pageTitles: Record<string, string> = {
  "/recipes": "Recipes",
  "/recipes/new": "Create Recipe",
  "/schedule": "Weekly Calendar",
};

export default function AppBar({
  onMenuClick,
  onThemeToggle,
  isDarkMode = false,
  isDrawerOpen = false,
}: AppBarProps) {
  const theme = useTheme();
  const pathname = usePathname() || "";

  // State for user menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  // Get current page title
  const currentPageTitle = pageTitles[pathname] || "Turtle Cafeteria";

  // Handlers for user menu
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <GradientAppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label={isDrawerOpen ? "close drawer" : "open drawer"}
            onClick={onMenuClick}
            edge="start"
            sx={{
              mr: 2
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <RestaurantIcon
              sx={{ display: { xs: "none", sm: "flex" }, mr: 1.5 }}
            />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontWeight: 600,
                display: { xs: "none", sm: "block" },
              }}
            >
              Turtle Cafeteria 🐢
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Page title - show on mobile */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              display: { xs: "block", sm: "none" },
            }}
          >
            {pathname === "/" ? "Turtle Cafeteria 🐢" : currentPageTitle}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            {/* Theme toggle button */}
            {onThemeToggle && (
              <Tooltip title={isDarkMode ? "Light Mode" : "Dark Mode"}>
                <IconButton
                  size="large"
                  color="inherit"
                  onClick={onThemeToggle}
                >
                  {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
            )}

            {/* Profile avatar */}
            <Tooltip title="Account">
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar
                  sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}
                >
                  <PersonIcon />
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </GradientAppBar>

      {/* User menu */}
      <Menu
        anchorEl={anchorEl}
        id="user-menu"
        keepMounted
        open={isMenuOpen}
        onClose={handleMenuClose}
        TransitionComponent={Fade}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            minWidth: 180,
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
            mt: 1.5,
          },
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <PersonIcon fontSize="small" sx={{ mr: 1.5 }} />
          My Profile
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <SettingsIcon fontSize="small" sx={{ mr: 1.5 }} />
          Settings
        </MenuItem>
      </Menu>
    </>
  );
}
