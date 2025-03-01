/* frontend/src/components/navigation/Layout.tsx */

"use client";

import React, { useState } from "react";
import {
  Box,
  Toolbar,
  CssBaseline,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  alpha,
} from "@mui/material";
import AppBar from "./AppBar";
import SidebarNav from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState<"light" | "dark">(
    prefersDarkMode ? "dark" : "light",
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Create theme based on mode
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === "dark" ? "#5e92f3" : "#1976d2",
          },
          secondary: {
            main: mode === "dark" ? "#f48fb1" : "#e91e63",
          },
          background: {
            default: mode === "dark" ? "#121212" : "#f5f5f7",
            paper: mode === "dark" ? "#1e1e1e" : "#ffffff",
          },
        },
        shape: {
          borderRadius: 8,
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 700,
          },
          h2: {
            fontWeight: 700,
          },
          h3: {
            fontWeight: 600,
          },
          h4: {
            fontWeight: 600,
          },
          h5: {
            fontWeight: 600,
          },
          h6: {
            fontWeight: 600,
          },
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                boxShadow:
                  mode === "dark"
                    ? "0 4px 20px 0 rgba(0,0,0,0.4)"
                    : "0 2px 10px 0 rgba(0,0,0,0.05)",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow:
                  mode === "dark"
                    ? "0 4px 20px 0 rgba(0,0,0,0.3)"
                    : "0 2px 10px 0 rgba(0,0,0,0.05)",
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                textTransform: "none",
                fontWeight: 600,
              },
              containedPrimary: {
                boxShadow:
                  mode === "dark"
                    ? "0 2px 6px 0 rgba(94, 146, 243, 0.3)"
                    : "0 2px 6px 0 rgba(25, 118, 210, 0.3)",
                "&:hover": {
                  boxShadow:
                    mode === "dark"
                      ? "0 4px 12px 0 rgba(94, 146, 243, 0.4)"
                      : "0 4px 12px 0 rgba(25, 118, 210, 0.4)",
                },
              },
              containedSecondary: {
                boxShadow:
                  mode === "dark"
                    ? "0 2px 6px 0 rgba(244, 143, 177, 0.3)"
                    : "0 2px 6px 0 rgba(233, 30, 99, 0.3)",
                "&:hover": {
                  boxShadow:
                    mode === "dark"
                      ? "0 4px 12px 0 rgba(244, 143, 177, 0.4)"
                      : "0 4px 12px 0 rgba(233, 30, 99, 0.4)",
                },
              },
            },
          },
        },
      }),
    [mode],
  );

  // Toggle drawer open/close
  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  // Toggle theme between light and dark
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />

        {/* App Bar */}
        <AppBar
          onMenuClick={handleDrawerOpen}
          onThemeToggle={toggleTheme}
          isDarkMode={mode === "dark"}
          isDrawerOpen={isDrawerOpen}
        />

        {/* Navigation Drawer */}
        <SidebarNav open={isDrawerOpen} onClose={handleDrawerClose} />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            pt: 4,
            transition: theme.transitions.create("margin", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            backgroundColor: "background.default",
            minHeight: "100vh",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `radial-gradient(${alpha(theme.palette.primary.main, 0.05)} 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
              pointerEvents: "none",
              zIndex: -1,
            },
          }}
        >
          <Toolbar />
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
