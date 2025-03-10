/* frontend/sr/components/schedule/CalendarCell.tsx */

import React, { useState } from "react";
import { Box, useTheme, alpha } from "@mui/material";
import { Recipe } from "@/types/recipes/recipe.types";
import { Schedule, MealType } from "@/types/schedules/schedule.types";

interface CalendarCellProps {
  date: Date;
  mealType: MealType;
  onDrop: (
    recipe: Recipe | Schedule,
    isNewSchedule: boolean,
    date: Date,
    mealType: MealType,
  ) => void;
  children?: React.ReactNode;
}

export default function CalendarCell({
  date,
  mealType,
  onDrop,
  children,
}: CalendarCellProps) {
  const theme = useTheme();
  const [isOver, setIsOver] = useState(false);
  const [isDraggingEnter, setIsDraggingEnter] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isOver) {
      setIsOver(true);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingEnter(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
    setIsDraggingEnter(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    setIsDraggingEnter(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      const isNewSchedule = !data.type || data.type !== "schedule";

      if (isNewSchedule) {
        onDrop(data, true, date, mealType);
      } else {
        onDrop(data, false, date, mealType);
      }
    } catch (error) {
      console.error("Error processing drop: ", error);
    }
  };

  return (
    <Box
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        flexGrow: 1,
        height: "100%",
        borderRadius: 1,
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
        // Show animated drop target effect when dragging over
        "&::after": isDraggingEnter
          ? {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: alpha(theme.palette.primary.main, 0.15),
              backgroundImage: `repeating-linear-gradient(45deg,
            ${alpha(theme.palette.primary.main, 0.1)},
            ${alpha(theme.palette.primary.main, 0.1)} 10px,
            ${alpha(theme.palette.primary.main, 0.15)} 10px,
            ${alpha(theme.palette.primary.main, 0.15)} 20px)`,
              animation: "dragPulse 2s ease-in-out infinite",
              opacity: 0.7,
              zIndex: 0,
              borderRadius: "inherit",
            }
          : {},
        "& > *": {
          position: "relative",
          zIndex: 1,
        },
      }}
    >
      {/* Add keyframes for the drag pulse animation */}
      <style jsx global>{`
        @keyframes dragPulse {
          0% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 0.4;
          }
        }
      `}</style>
      {children}
    </Box>
  );
}
