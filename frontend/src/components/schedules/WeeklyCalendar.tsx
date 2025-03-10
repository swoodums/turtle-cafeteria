/* frontend/src/component/schedule/WeekCalendar.tsx */

"use client";

import React, { useState, useCallback } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Alert,
  alpha,
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  Grid2,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Skeleton,
  Slide,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
  useTheme,
  Zoom,
} from "@mui/material";
import {
  CalendarToday as TodayIcon,
  CalendarViewMonth as MonthViewIcon,
  CalendarViewWeek as WeekViewIcon,
  ChevronLeft,
  ChevronRight,
  Event,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import scheduleService from "@/services/scheduleService";
import {
  MealType,
  Schedule,
  ScheduleCreate,
  ScheduleUpdate,
} from "@/types/schedules/schedule.types";
import { Recipe } from "@/types/recipes/recipe.types";
import CalendarCell from "./CalendarCell";
import ScheduleCard from "./ScheduleCard";
import { TransitionGroup } from "react-transition-group";

const MEAL_TYPE_COLORS = {
  breakfast: {
    light: "#fff8e1", // Light yellow background
    main: "#ffca28", // Amber main color
    dark: "#f57f17", // Dark orange for accents
    text: "#33302e", // Dark text for contrast
    hover: "#fff3c4", // Slightly darker background for hover
  },
  lunch: {
    light: "#e8f5e9", // Light green background
    main: "#66bb6a", // Green main color
    dark: "#2e7d32", // Dark green for accents
    text: "#1e2b1f", // Dark text for contrast
    hover: "#d7ecd9", // Slightly darker background for hover
  },
  dinner: {
    light: "#fce4ec", // Light pink background
    main: "#ec407a", // Pink main color
    dark: "#c2185b", // Dark pink for accents
    text: "#2d1e24", // Dark text for contrast
    hover: "#f8d7e3", // Slightly darker background for hover
  },
  snack: {
    light: "#e3f2fd", // Light blue background
    main: "#64b5f6", // Blue main color
    dark: "#1976d2", // Dark blue for accents
    text: "#1a2a38", // Dark text for contrast
    hover: "#d0e7fa", // Slightly darker background for hover
  },
} as const;

// Helper function to format date for display
const formatDate = (date: Date) => {
  return {
    day: date.toLocaleDateString("en-US", { weekday: "short" }),
    date: date.getDate(),
    month: date.toLocaleDateString("en-US", { month: "short" }),
    full: date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    }),
    isToday: new Date().toDateString() === date.toDateString(),
    isWeekend: date.getDay() === 0 || date.getDay() === 6,
  };
};

export default function WeeklyCalendar() {
  const theme = useTheme();
  const queryClient = useQueryClient();

  // View state
  const [currentWeek, setCurrentWeek] = useState(() => {
    const now = new Date();
    // Set to beginning of week (Sunday)
    now.setDate(now.getDate() - now.getDay());
    return new Date(now);
  });

  // Menu state
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [viewAnchorEl, setViewAnchorEl] = useState<null | HTMLElement>(null);

  // Alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<
    "error" | "warning" | "info" | "success"
  >("warning");

  // Filter state
  const [activeMealTypes, setActiveMealTypes] = useState<Set<MealType>>(
    new Set(["breakfast", "lunch", "dinner"]),
  );

  // Calculate week range
  const weekStart = new Date(currentWeek);
  const weekEnd = new Date(currentWeek);
  weekEnd.setDate(weekEnd.getDate() + 6);

  // Fetch schedules for current week
  const {
    data: schedules,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["schedules", weekStart.toISOString(), weekEnd.toISOString()],
    queryFn: () => scheduleService.getSchedulesByDateRange(weekStart, weekEnd),
  });

  // Generate array of dates for current week
  const weekDates = [...Array(7)].map((_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  // Get schedules for a specific date
  const getSchedulesForDate = useCallback(
    (date: Date, mealType: string) => {
      if (!schedules) return [];
      const checkDate = date.toISOString().split("T")[0];
      return schedules.filter(
        (schedule) =>
          schedule.start_date <= checkDate &&
          schedule.end_date >= checkDate &&
          schedule.meal_type === mealType,
      );
    },
    [schedules],
  );

  // Navigate Weeks
  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeek((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
      return newDate;
    });
  };

  // Go to current week
  const goToCurrentWeek = () => {
    const today = new Date();
    today.setDate(today.getDate() - today.getDay());
    setCurrentWeek(today);

    // Show success message
    setAlertMessage("Calendar updated to current week");
    setAlertSeverity("success");
    setAlertOpen(true);
  };

  // Create schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: (newSchedule: ScheduleCreate) =>
      scheduleService.createSchedule(newSchedule.recipe_id, newSchedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      setAlertMessage("Recipe added to your schedule");
      setAlertSeverity("success");
      setAlertOpen(true);
    },
    onError: (error) => {
      setAlertMessage(
        `Error adding recipe: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setAlertSeverity("error");
      setAlertOpen(true);
    },
  });

  // Update schedule mutation
  const updateScheduleMutation = useMutation({
    mutationFn: (data: { id: number; updates: ScheduleUpdate }) =>
      scheduleService.updateSchedule(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      setAlertMessage("Schedule updated successfully");
      setAlertSeverity("success");
      setAlertOpen(true);
    },
    onError: (error) => {
      setAlertMessage(
        `Error updating schedule: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setAlertSeverity("error");
      setAlertOpen(true);
    },
  });

  // Handle drop recipes on calendar
  const handleDrop = useCallback(
    (
      item: Recipe | Schedule | { type: string; schedule: Schedule },
      isNewSchedule: boolean,
      date: Date,
      mealType: MealType,
    ) => {
      // Format date manually to preserve local date
      const formattedDate = date.toISOString().split("T")[0];

      // Check existing schedules for this date and meal type
      const existingSchedules = getSchedulesForDate(date, mealType);

      if (isNewSchedule) {
        // Handle new recipe drop
        const recipe = item as Recipe;

        // Check if recipe is already scheduled
        const isDuplicate = existingSchedules.some(
          (schedule) => schedule.recipe_id === recipe.id,
        );

        if (isDuplicate) {
          setAlertMessage(`${recipe.title} is already scheduled for this meal`);
          setAlertSeverity("warning");
          setAlertOpen(true);
          return;
        }

        if (existingSchedules.length >= 3) {
          setAlertMessage("You can schedule up to 3 recipes per meal");
          setAlertSeverity("warning");
          setAlertOpen(true);
          return;
        }

        const scheduleData: ScheduleCreate = {
          recipe_id: recipe.id,
          start_date: formattedDate,
          end_date: formattedDate,
          meal_type: mealType,
        };
        createScheduleMutation.mutate(scheduleData);
      } else {
        // Handle existing schedule move
        const scheduleData = (item as { type: string; schedule: Schedule })
          .schedule;

        // Don't update if dropped in same spot
        if (
          scheduleData.start_date === formattedDate &&
          scheduleData.meal_type === mealType
        ) {
          return;
        }

        // Check if recipe is already scheduled in target cell
        const isDuplicate = existingSchedules.some(
          (schedule) =>
            schedule.recipe_id === schedule.recipe_id &&
            schedule.id !== scheduleData.id,
        );

        if (isDuplicate) {
          setAlertMessage(
            `${scheduleData.recipe?.title} is already scheduled for this meal`,
          );
          setAlertSeverity("warning");
          setAlertOpen(true);
          return;
        }

        //Filter out the schedule being moved when checking limit
        const otherSchedules = existingSchedules.filter(
          (s) => s.id !== scheduleData.id,
        );
        if (otherSchedules.length >= 3) {
          setAlertMessage("You can schedule up to 3 recipes per meal");
          setAlertSeverity("warning");
          setAlertOpen(true);
          return;
        }

        updateScheduleMutation.mutate({
          id: scheduleData.id,
          updates: {
            start_date: formattedDate,
            end_date: formattedDate,
            meal_type: mealType,
          },
        });
      }
    },
    [createScheduleMutation, updateScheduleMutation, getSchedulesForDate],
  );

  // Toggle meal type in filter
  const toggleMealTypeFilter = (mealType: MealType) => {
    setActiveMealTypes((prev) => {
      const newSet = new Set(prev);
      if (prev.has(mealType)) {
        newSet.delete(mealType);
      } else {
        newSet.add(mealType);
      }
      return newSet;
    });
  };

  // Get meal type colors
  const getMealTypeColors = (mealType: string) => {
    const type = (mealType as MealType) || "dinner";
    return MEAL_TYPE_COLORS[type] || MEAL_TYPE_COLORS.dinner;
  };

  // Open filter menu
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  // Open view menu
  const handleViewClick = (event: React.MouseEvent<HTMLElement>) => {
    setViewAnchorEl(event.currentTarget);
  };

  // Close menus
  const handleMenuClose = () => {
    setFilterAnchorEl(null);
    setViewAnchorEl(null);
  };

  const isFilterMenuOpen = Boolean(filterAnchorEl);
  const isViewMenuOpen = Boolean(viewAnchorEl);

  // Get filtered meal types
  const filteredMealTypes = Object.keys(MEAL_TYPE_COLORS).filter((mealType) =>
    activeMealTypes.has(mealType as MealType),
  ) as MealType[];

  // Define meal cell height based on filter
  const MEAL_CELL_HEIGHT = 145;

  // Render loading skeleton
  if (isLoading) {
    return (
      <Box sx={{ height: "100%", p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Skeleton variant="text" width={200} height={40} />
          <Box sx={{ display: "flex", gap: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="circular" width={40} height={40} />
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 1,
          }}
        >
          {Array(7)
            .fill(0)
            .map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={60}
                sx={{ borderRadius: 1 }}
              />
            ))}

          {Array(7)
            .fill(0)
            .map((_, i) => (
              <Skeleton
                key={`cell-${i}`}
                variant="rectangular"
                height={400}
                sx={{ borderRadius: 1 }}
              />
            ))}
        </Box>
      </Box>
    );
  }

  // Render error
  if (isError) {
    return (
      <Box
        sx={{
          height: "100%",
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Alert
          severity="error"
          variant="filled"
          sx={{ maxWidth: 600 }}
          action={
            <Button color="inherit" size="small" onClick={goToCurrentWeek}>
              Try Again
            </Button>
          }
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Error loading schedule
          </Typography>
          <Typography variant="body2">
            {error instanceof Error
              ? error.message
              : "An unknown error occurred"}
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          maxWidth: "100%",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* Calendar Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Typography
            variant="h5"
            fontWeight={600}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Event color="primary" />
            Weekly Meal Planner
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.5, sm: 1, md: 2 },
            }}
          >
            {/* Date navigation */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "background.paper",
                borderRadius: 3,
                border: 1,
                borderColor: "divider",
                px: 1,
                py: 0.5,
                boxShadow: 1,
              }}
            >
              <IconButton
                onClick={() => navigateWeek("prev")}
                size="small"
                color="primary"
              >
                <ChevronLeft />
              </IconButton>

              <Tooltip title="Go to current week">
                <Box
                  onClick={goToCurrentWeek}
                  sx={{
                    cursor: "pointer",
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    mx: 1,
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap" }}>
                    {weekStart.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    -{" "}
                    {weekEnd.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Typography>
                </Box>
              </Tooltip>

              <IconButton
                onClick={() => navigateWeek("next")}
                size="small"
                color="primary"
              >
                <ChevronRight />
              </IconButton>
            </Box>

            {/* Action buttons */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Today">
                <IconButton
                  onClick={goToCurrentWeek}
                  color="primary"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  <TodayIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Filter Meals">
                <IconButton
                  onClick={handleFilterClick}
                  color="primary"
                  sx={{
                    bgcolor: isFilterMenuOpen
                      ? alpha(theme.palette.primary.main, 0.2)
                      : alpha(theme.palette.primary.main, 0.1),
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  <FilterIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Change View">
                <IconButton
                  onClick={handleViewClick}
                  color="primary"
                  sx={{
                    bgcolor: isViewMenuOpen
                      ? alpha(theme.palette.primary.main, 0.2)
                      : alpha(theme.palette.primary.main, 0.1),
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  <WeekViewIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {/* Filter menu */}
        <Menu
          anchorEl={filterAnchorEl}
          open={isFilterMenuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            elevation: 3,
            sx: { borderRadius: 2, mt: 1, minWidth: 180 },
          }}
        >
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ px: 2, pt: 1, pb: 0.5 }}
          >
            Filter Meal Types
          </Typography>
          <Divider sx={{ mb: 1 }} />
          {Object.entries(MEAL_TYPE_COLORS).map(([mealType, colors]) => (
            <MenuItem
              key={mealType}
              onClick={() => toggleMealTypeFilter(mealType as MealType)}
              dense
              sx={{
                py: 1,
                px: 2,
              }}
            >
              <Chip
                size="small"
                label={mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                color={
                  activeMealTypes.has(mealType as MealType)
                    ? "primary"
                    : "default"
                }
                variant={
                  activeMealTypes.has(mealType as MealType)
                    ? "filled"
                    : "outlined"
                }
                sx={{
                  mr: 1,
                  bgcolor: activeMealTypes.has(mealType as MealType)
                    ? colors.main
                    : "transparent",
                  color: activeMealTypes.has(mealType as MealType)
                    ? colors.text
                    : "text.primary",
                  borderColor: colors.main,
                }}
              />
            </MenuItem>
          ))}
        </Menu>

        {/* View menu */}
        <Menu
          anchorEl={viewAnchorEl}
          open={isViewMenuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            elevation: 3,
            sx: { borderRadius: 2, mt: 1, minWidth: 180 },
          }}
        >
          <MenuItem onClick={handleMenuClose} dense>
            <WeekViewIcon
              sx={{ mr: 1, color: "primary.main" }}
              fontSize="small"
            />
            <Typography variant="body2">Weekly View</Typography>
          </MenuItem>
          <MenuItem onClick={handleMenuClose} dense>
            <MonthViewIcon sx={{ mr: 1 }} fontSize="small" />
            <Typography variant="body2">Monthly View</Typography>
          </MenuItem>
        </Menu>

        {/* Calendar Grid */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: "auto",
            p: 2,
            width: "100%",
          }}
        >
          <Grid2 container spacing={1} columns={7} sx={{ width: "100%" }}>
            {/* Day Headers */}
            {weekDates.map((date) => {
              const formattedDate = formatDate(date);
              return (
                <Grid2 size={1} key={date.toISOString()}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      textAlign: "center",
                      bgcolor: formattedDate.isToday
                        ? alpha(theme.palette.primary.main, 0.1)
                        : formattedDate.isWeekend
                          ? alpha(theme.palette.background.default, 0.5)
                          : "background.paper",
                      border: formattedDate.isToday ? 2 : 0,
                      borderColor: "primary.main",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      position: "relative",
                      overflow: "hidden",
                      "&::after": formattedDate.isToday
                        ? {
                            content: '""',
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: "3px",
                            bgcolor: "primary.main",
                            borderRadius: "3px",
                          }
                        : {},
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: formattedDate.isToday
                          ? "primary.main"
                          : formattedDate.isWeekend
                            ? "text.secondary"
                            : "text.primary",
                      }}
                    >
                      {formattedDate.day}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        py: 0.5,
                      }}
                    >
                      {formattedDate.isToday && (
                        <Badge
                          color="primary"
                          variant="dot"
                          sx={{
                            "& .MuiBadge-badge": {
                              right: -2,
                              top: -2,
                            },
                          }}
                        >
                          <Typography
                            variant="h5"
                            fontWeight={600}
                            sx={{
                              color: formattedDate.isToday
                                ? "primary.main"
                                : "text.primary",
                            }}
                          >
                            {formattedDate.date}
                          </Typography>
                        </Badge>
                      )}

                      {!formattedDate.isToday && (
                        <Typography
                          variant="h5"
                          fontWeight={600}
                          sx={{
                            color: formattedDate.isWeekend
                              ? "text.secondary"
                              : "text.primary",
                          }}
                        >
                          {formattedDate.date}
                        </Typography>
                      )}
                    </Box>

                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontWeight: formattedDate.isToday ? 600 : 400,
                      }}
                    >
                      {formattedDate.month}
                    </Typography>
                  </Paper>
                </Grid2>
              );
            })}

            {/* Meal Type Cells */}
            {weekDates.map((date) => (
              <Grid2 size={1} key={`meals-${date.toISOString()}`}>
                <Stack spacing={1}>
                  {filteredMealTypes.map((mealType) => {
                    const colors = getMealTypeColors(mealType);
                    const dateSchedules = getSchedulesForDate(date, mealType);

                    return (
                      <Paper
                        key={`${date.toISOString()}-${mealType}`}
                        elevation={2}
                        sx={{
                          height: MEAL_CELL_HEIGHT,
                          display: "flex",
                          flexDirection: "column",
                          overflow: "hidden",
                          p: 1,
                          borderRadius: 2,
                          bgcolor: alpha(colors.light, 0.5),
                          border: `1px solid ${alpha(colors.main, 0.2)}`,
                          "&:hover": {
                            bgcolor: colors.hover,
                            boxShadow: 3,
                          },
                          transition: "all 0.2s ease-in-out",
                        }}
                      >
                        {/* Meal type header */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 0.5,
                            pb: 0.5,
                            borderBottom: 1,
                            borderColor: alpha(colors.main, 0.2),
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              textTransform: "capitalize",
                              fontWeight: 600,
                              color: colors.dark,
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: colors.main,
                              }}
                            />
                            {mealType}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            {dateSchedules.length} / 3
                          </Typography>
                        </Box>

                        <CalendarCell
                          date={date}
                          mealType={mealType}
                          onDrop={handleDrop}
                        >
                          <TransitionGroup
                            component={Stack}
                            spacing={1}
                            sx={{ minWidth: 0 }}
                          >
                            {dateSchedules.map((schedule) => (
                              <Zoom key={schedule.id} timeout={300}>
                                <Box>
                                  <ScheduleCard
                                    schedule={schedule}
                                    mealType={mealType}
                                    colors={colors}
                                  />
                                </Box>
                              </Zoom>
                            ))}
                          </TransitionGroup>
                        </CalendarCell>
                      </Paper>
                    );
                  })}
                </Stack>
              </Grid2>
            ))}
          </Grid2>
        </Box>
      </Box>

      {/* Alert snackbar */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={5000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        TransitionComponent={Slide}
      >
        <Alert
          onClose={() => setAlertOpen(false)}
          severity={alertSeverity}
          variant="filled"
          elevation={6}
          sx={{
            width: "100%",
            borderRadius: 2,
          }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
