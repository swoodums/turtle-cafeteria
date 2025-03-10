/* frontend/src/app/schedule/page.tsx */

"use client";

import React, { useState, useEffect } from "react";
import WeeklyCalendar from "@/components/schedules/WeeklyCalendar";
import AccordionRecipeList from "@/components/schedules/AccordionRecipeList";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Drawer,
  useMediaQuery,
} from "@mui/material";
import {
  MenuBook as MenuBookIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  FoodBank as FoodIcon,
} from "@mui/icons-material";

export default function SchedulePage() {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const drawerWidth = 350;

  // Use MediaQuery hook for responsive behavior
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerAnchor, setDrawerAnchor] = useState<"bottom" | "right">("right");

  // Set drawer anchor based on screen size after component mounts
  useEffect(() => {
    setDrawerAnchor(isMobile ? "bottom" : "right");
  }, [isMobile]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box
      sx={{
        position: "relative",
        height: "calc(100vh - 80px)", // Full viewport height minus AppBar height
        width: "100%",
        overflow: "hidden",
        padding: { xs: 1, md: 2 },
        paddingBottom: { xs: 2, md: 3 },
      }}
    >
      {/* Main content area - Calendar */}
      <Box
        sx={{
          position: "absolute",
          top: theme.spacing(2),
          bottom: theme.spacing(3),
          left: theme.spacing(2),
          right:
            !isMobile && drawerOpen ? `${drawerWidth}px` : theme.spacing(2),
          borderRadius: 3,
          bgcolor: "background.paper",
          boxShadow: 2,
          overflow: "hidden",
          transition: theme.transitions.create(["right"], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
          }),
        }}
      >
        <WeeklyCalendar />
      </Box>

      {/* Toggle button */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          right:
            !isMobile && drawerOpen
              ? `${drawerWidth - 20}px`
              : theme.spacing(3),
          transform: "translateY(-50%)",
          zIndex: 10,
          transition: theme.transitions.create(["right"], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
          }),
          display: { xs: "none", md: "block" },
        }}
      >
        <Tooltip title={drawerOpen ? "Hide Recipes" : "Show Recipes"}>
          <IconButton
            onClick={toggleDrawer}
            size="small"
            sx={{
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "50%",
              height: 40,
              width: 40,
              boxShadow: 3,
              color: "primary.main",
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            {drawerOpen ? (
              <ChevronRightIcon fontSize="small" />
            ) : (
              <ChevronLeftIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Mobile toggle button */}
      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 10,
          display: { xs: "block", md: "none" },
        }}
      >
        <Tooltip title={drawerOpen ? "Hide Recipes" : "Show Recipes"}>
          <IconButton
            onClick={toggleDrawer}
            size="large"
            color="primary"
            sx={{
              bgcolor: "background.paper",
              boxShadow: 3,
              height: 56,
              width: 56,
            }}
          >
            <MenuBookIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Recipe drawer */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderTopLeftRadius: drawerAnchor === "bottom" ? 16 : 0,
            borderBottomLeftRadius: drawerAnchor === "bottom" ? 0 : 0,
            boxShadow:
              drawerAnchor === "bottom"
                ? "0px -2px 10px rgba(0, 0, 0, 0.1)"
                : "-2px 0px 10px rgba(0, 0, 0, 0.1)",
            height: drawerAnchor === "bottom" ? "70%" : "auto",
            maxHeight: drawerAnchor === "bottom" ? "70%" : "100%",
          },
        }}
        variant="persistent"
        anchor={drawerAnchor}
        open={drawerOpen}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: alpha(theme.palette.primary.main, 0.05),
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FoodIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Available Recipes
              </Typography>
            </Box>

            <Tooltip title="Hide Recipes">
              <IconButton
                onClick={toggleDrawer}
                size="small"
                sx={{
                  display: { xs: "flex", md: "none" },
                  color: "text.secondary",
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              overflow: "auto",
              position: "relative",
            }}
          >
            <AccordionRecipeList />
          </Box>
        </Box>
      </Drawer>

      {/* Add global styles for drag operations */}
      <style jsx global>{`
        .dragging {
          opacity: 0.7;
          transform: scale(1.02);
          transition: all 0.2s ease;
        }
      `}</style>
    </Box>
  );
}
