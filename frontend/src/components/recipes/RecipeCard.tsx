/* frontend/src/components/recipes/RecipeCard.tsx */

"use client";

import { Recipe } from "@/types/recipes";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import recipeService from "@/services/recipeService";
import { useRouter } from "next/navigation";

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const queryClient = useQueryClient();
  const router = useRouter();

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
    },
  });

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm("Are you sure you want to delete this recipe?")) {
      deleteRecipeMutation.mutate(recipe.id);
    }
    handleClose();
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    router.push(`/recipes/${recipe.id}/edit`);
    handleClose();
  };

  return (
    <Card
      sx={{
        maxWidth: 345,
        cursor: "pointer",
        position: "relative",
        "&:hover": {
          boxShadow: 6,
          transition: "box-shadow 0.3s ease-in-out",
        },
      }}
      onClick={handleCardClick}
    >
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
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {recipe.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 2,
          }}
        >
          {recipe.description}
        </Typography>
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
      </CardContent>
    </Card>
  );
};

export default RecipeCard;
