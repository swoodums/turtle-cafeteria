/* frontend/src/components/recipes/RecipeCard.tsx */

"use client";

import React, { useState } from "react";
import { Recipe } from "@/types/recipes";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import recipeService from "@/services/recipeService";
import { useRouter } from "next/navigation";

// Function to generate a placeholder color for recipe
const getRecipeColor = (id: number) => {
  const colors = [
    "#e57373",
    "#f06292",
    "#ba68c8",
    "#9575cd",
    "#7986cb",
    "#64b5f6",
    "#4fc3f7",
    "#4dd0e1",
    "#4db6ac",
    "#81c784",
    "#aed581",
    "#dce775",
    "#fff176",
    "#ffd54f",
    "#ffb74d",
    "#ff8a65",
  ];
  return colors[id % colors.length];
};

// Function to get first letter for avatar
const getInitial = (title: string) => {
  return title.charAt(0).toUpperCase();
};

interface RecipeCardProps {
  recipe: Recipe;
  onEdit?: (recipe: Recipe) => void;
}

const RecipeCard = ({ recipe, onEdit }: RecipeCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const open = Boolean(anchorEl);
  const queryClient = useQueryClient();
  const router = useRouter();
  const recipeColor = getRecipeColor(recipe.id);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation(); // prevent card click even
    setAnchorEl(event.currentTarget);
  };

  const handleCardClick = () => {
    router.push(`recipes/${recipe.id}`);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const deleteRecipeMutation = useMutation({
    mutationFn: (id: number) => recipeService.deleteRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      setConfirmDelete(false);
    },
  });

  const handleDelete = () => {
    setConfirmDelete(true);
    handleClose();
  };

  const handleConfirmDelete = () => {
    deleteRecipeMutation.mutate(recipe.id);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(recipe);
    } else {
      router.push(`/recipes/${recipe.id}/edit`);
    }
    handleClose();
  };

  return (
    <>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
          overflow: "visible",
          position: "relative",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 20px -10px rgba(0,0,0,0.2)",
          },
        }}
      >
        <Box
          sx={{
            height: 16,
            bgcolor: recipeColor,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        />
        <Box sx={{ position: "absolute", top: -20, left: 16 }}>
          <Avatar
            sx={{
              bgcolor: recipeColor,
              width: 56,
              height: 56,
              boxShadow: 2,
            }}
          >
            {getInitial(recipe.title)}
          </Avatar>
        </Box>

        <IconButton
          onClick={handleClick}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1,
          }}
        >
          <MoreVertIcon />
        </IconButton>

        <CardActionArea onClick={handleCardClick} sx={{ flexGrow: 1, pt: 1 }}>
          <CardContent sx={{ pt: 3 }}>
            <Box sx={{ ml: 0.5 }}>
              <Box sx={{ minHeight: "3rem", mb: 1 }}>
                <Typography
                  gutterBottom
                  variant="h6"
                  component="div"
                  sx={{ fontWeight: 600, lineHeight: 1.3, mb: 0.5 }}
                >
                  {recipe.title}
                </Typography>

                <Chip
                  size="small"
                  label={recipe.cooking_time <= 30 ? "Quick" : "Regular"}
                  color={recipe.cooking_time <= 30 ? "success" : "default"}
                  sx={{ mb: 1 }}
                />
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  mb: 2,
                  height: "2.5rem",
                }}
              >
                {recipe.description}
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <AccessTimeIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {recipe.cooking_time} mins
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <PeopleIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Serves {recipe.servings}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </CardActionArea>

        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem onClick={handleEdit}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &quot;{recipe.title}&quot;? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteRecipeMutation.isPending}
          >
            {deleteRecipeMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RecipeCard;
