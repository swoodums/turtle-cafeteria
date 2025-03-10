/* frontend/sr/components/schedule/ScheduleCard.tsx */

import React, { useState } from "react";
import {
  Paper,
  Typography,
  MenuItem,
  Box,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Fade,
  alpha,
  useTheme,
  Divider,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Notes as NotesIcon,
} from "@mui/icons-material";
import { MealType, Schedule } from "@/types/schedules/schedule.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import scheduleService from "@/services/scheduleService";
import EditScheduleModal from "./EditScheduleModal";

interface ScheduleCardProps {
  schedule: Schedule;
  mealType: MealType;
  colors: {
    light: string;
    main: string;
    dark: string;
    text: string;
    hover: string;
  };
}

export default function ScheduleCard({ schedule, colors }: ScheduleCardProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const deleteMutation = useMutation({
    mutationFn: () => scheduleService.deleteSchedule(schedule.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      handleClose();
    },
  });

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleClose();
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate();
    setDeleteDialogOpen(false);
  };

  const handleViewRecipe = () => {
    router.push(`/recipes/${schedule.recipe_id}`);
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
    handleClose();
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const dragData = {
      type: "schedule",
      schedule: schedule,
    };
    e.dataTransfer.setData("application/json", JSON.stringify(dragData));

    // Add dragging class and create a semi-transparent drag image
    if (e.currentTarget.classList) {
      e.currentTarget.classList.add("dragging");
    }

    // Add pulse animation to the element being dragged
    const el = e.currentTarget as HTMLElement;
    el.style.animation = "cardPulse 1.0s infinite";
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    // Remove dragging class and animation
    if (e.currentTarget.classList) {
      e.currentTarget.classList.remove("dragging");
    }

    const el = e.currentTarget as HTMLElement;
    el.style.animation = "";
  };

  return (
    <>
      <div draggable onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Paper
          elevation={2}
          sx={{
            p: 1,
            backgroundColor: alpha(colors.light, 0.7),
            borderLeft: `3px solid ${colors.main}`,
            cursor: "grab",
            position: "relative",
            "&:active": {
              cursor: "grabbing",
              transform: "rotate(5deg)",
            },
            "&:dragging": {
              opacity: 0.7,
              boxShadow: theme.shadows[4],
            },
            "&:hover": {
              backgroundColor: colors.hover,
              transform: "translateY(-2px)",
              boxShadow: 3,
            },
            transition: "all 0.2s ease-in-out",
            borderRadius: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Tooltip
              title={
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {schedule.recipe?.title}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mt: 1,
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <AccessTimeIcon fontSize="small" />
                      <Typography variant="body2">
                        {schedule.recipe?.cooking_time} mins
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <PeopleIcon fontSize="small" />
                      <Typography variant="body2">
                        Serves {schedule.recipe?.servings}
                      </Typography>
                    </Box>
                  </Box>

                  {schedule.notes && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Box
                        sx={{
                          displat: "flex",
                          alignItems: "flex-start",
                          gap: 0.5,
                        }}
                      >
                        <NotesIcon fontSize="small" sx={{ mt: 0.3 }} />
                        <Typography variant="body2">
                          {schedule.notes}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              }
              arrow
              placement="top"
              enterDelay={500}
              enterNextDelay={500}
            >
              <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: colors.text,
                  }}
                >
                  {schedule.recipe?.title}
                </Typography>

                {schedule.notes && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: alpha(colors.text, 0.0),
                      mt: 0.5,
                      gap: 0.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <NotesIcon fontSize="inherit" />
                    {schedule.notes}
                  </Typography>
                )}
              </Box>
            </Tooltip>

            <IconButton
              size="small"
              onClick={handleClick}
              sx={{
                color: colors.dark,
                p: 0.5,
                ml: 0.5,
                "&:hover": {
                  backgroundColor: alpha(colors.main, 0.2),
                },
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>

        {/* Add keyframes for pulse animation when dragging */}
        <style jsx global>{`
          @keyframes cardPulse {
            0% { opacity: 0.6, transform: scale(1); }
            50% { opacity: 1; transform: scale(1.3); }
            100% { opacity: 0.6; transform: scale(1); }
          }
        `}</style>
      </div>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        elevation={3}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 100,
          },
        }}
        TransitionComponent={Fade}
        transitionDuration={200}
      >
        <MenuItem onClick={handleViewRecipe} dense>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Recipe</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleEdit} dense>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Schedule</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleDelete} dense sx={{ color: "error.main" }}>
          <ListItemIcon sx={{ color: "error.main" }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit Modal */}
      <EditScheduleModal
        schedule={schedule}
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to remove &quot;{schedule.recipe?.title}&quot;
            from your schedule?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="text"
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
