/* frontend/src/components/navigation.ApPBar.tsx */

"use client";

import React from "react";
import {
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Typography,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";

interface AppBarProps {
  onMenuClick: () => void;
}

export default function AppBar({ onMenuClick }: AppBarProps) {
  return (
    <MuiAppBar position="fixed">
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div">
          Turtle Cafeteria 🐢
        </Typography>
      </Toolbar>
    </MuiAppBar>
  );
}
