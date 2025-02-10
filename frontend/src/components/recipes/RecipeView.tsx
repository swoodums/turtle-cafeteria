/* frontend/src/components/recipes/RecipeView.tsx */

"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Switch,
  FormControlLabel,
  styled,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import recipeService from "@/services/recipeService";

// Custom styled Switch component
const CookModeSwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    transform: "translateX(6px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(22px)",
      "& .MuiSwitch-thumb": {
        backgroundColor: "#ff4d4d",
        "&:before": {
          content: "'🔥'",
          fontSize: "24px", // Make the fire emoji bigger
          transform: "scale(1.2)", // Additional size increase with transform
        },
      },
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: theme.palette.mode === "dark" ? "#8796A5" : "#aab4be",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: theme.palette.mode === "dark" ? "#003892" : "#001e3c",
    width: 32,
    height: 32,
    "&:before": {
      content: "'👨‍🍳'",
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  "& .MuiSwitch-track": {
    opacity: 1,
    backgroundColor: theme.palette.mode === "dark" ? "#8796A5" : "#aab4be",
    borderRadius: 20 / 2,
  },
}));

interface RecipeViewProps {
  recipeId: number;
}

export default function RecipeView({ recipeId }: RecipeViewProps) {
  const {
    data: recipe,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["recipe", recipeId],
    queryFn: () => recipeService.getRecipeById(recipeId),
  });
  const router = useRouter();
  const [cookMode, setCookMode] = useState(false);
  const [completedIngredients, setCompletedIngredients] = useState<Set<number>>(
    new Set(),
  );
  const [completedDirections, setCompletedDirections] = useState<Set<number>>(
    new Set(),
  );
  const [showConfetti, setShowConfetti] = useState(false);

  // Check if everything in complete whenever Ingredients or Directions change
  useEffect(() => {
    if (!cookMode || !recipe) return;

    const allIngredientsComplete =
      recipe.recipe_ingredients?.every((ingredient) =>
        completedIngredients.has(ingredient.id),
      ) ?? false;

    const allDirectionsComplete =
      recipe.directions?.every((direction) =>
        completedDirections.has(direction.id),
      ) ?? false;

    // If everything is completed, party time
    if (allIngredientsComplete && allDirectionsComplete) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [completedIngredients, completedDirections, recipe, cookMode]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !recipe) {
    return (
      <Box className="flex justify-center items-center min-h-screen">
        <Typography color="error">
          Error loading recipe:{" "}
          {error instanceof Error ? error.message : "Recipe not found"}
        </Typography>
      </Box>
    );
  }

  const toggleIngredient = (id: number) => {
    if (!cookMode) return;
    setCompletedIngredients((prev) => {
      const newSet = new Set(prev);
      if (prev.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleDirection = (id: number) => {
    if (!cookMode) return;
    setCompletedDirections((prev) => {
      const newSet = new Set(prev);
      if (prev.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const resetProgress = () => {
    setCompletedIngredients(new Set());
    setCompletedDirections(new Set());
    setShowConfetti(false);
  };

  // Find the first incomplete direction for highlighting
  const sortedDirections =
    recipe.directions?.sort(
      (a, b) => a.direction_number - b.direction_number,
    ) || [];
  const firstIncompleteIndex = sortedDirections.findIndex(
    (direction) => !completedDirections.has(direction.id),
  );

  return (
    <Container sx={{ maxWidth: "lg", py: 2 }}>
      {/* Confetti overlay when completed */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={1000}
        />
      )}

      <Paper elevation={4}>
        {/* Header Section */}
        <Box
          sx={{
            mb: 2,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography variant="h3" component="h1" sx={{ mb: 1 }}>
              {recipe.title}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {recipe.description}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <AccessTimeIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {recipe.cooking_time} mins
              </Typography>

              <PeopleIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Serves {recipe.servings}
              </Typography>
            </Box>
          </Box>

          <FormControlLabel
            control={
              <CookModeSwitch
                checked={cookMode}
                onChange={(e) => {
                  const newCookMode = e.target.checked;
                  setCookMode(newCookMode);
                  // If cook mode is being turned off, reset progress
                  if (!newCookMode) {
                    resetProgress();
                  }
                }}
              />
            }
            label="Cook Mode"
          />
        </Box>
      </Paper>

      {/* Ingredients Section */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          width: "100%",
          mt: 3,
        }}
      >
        <Paper elevation={4} sx={{ width: "fit-content", minWidth: "250px" }}>
          <Box sx={{ mb: 3, p: 2 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
              Ingredients
            </Typography>

            {recipe.recipe_ingredients?.map((ingredient) => (
              <Typography
                key={ingredient.id}
                variant="body1"
                onClick={() => toggleIngredient(ingredient.id)}
                sx={{
                  cursor: cookMode ? "pointer" : "default",
                  textDecoration: completedIngredients.has(ingredient.id)
                    ? "line-through"
                    : "none",
                  color: completedIngredients.has(ingredient.id)
                    ? "text.disabled"
                    : "text.primary",
                  mb: 1,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: cookMode ? "action.hover" : "transparent",
                  },
                }}
              >
                • {ingredient.name} - {ingredient.quantity} {ingredient.unit}
              </Typography>
            ))}
          </Box>
        </Paper>

        {/* Directions Section */}
        <Paper elevation={4} sx={{ flex: 1 }}>
          <Box sx={{ mb: 3, p: 2 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
              Directions
            </Typography>

            {sortedDirections.map((direction, index) => (
              <Box
                key={direction.id}
                onClick={() => toggleDirection(direction.id)}
                sx={{
                  mb: 2,
                  p: 1,
                  cursor: cookMode ? "pointer" : "default",
                  bgcolor:
                    cookMode && index === firstIncompleteIndex
                      ? "action.selected"
                      : "transparent",
                  borderRadius: 1,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: cookMode ? "action.hover" : "transparnet",
                  },
                }}
              >
                <Typography
                  variant="body1"
                  component="div"
                  sx={{
                    textDecoration: completedDirections.has(direction.id)
                      ? "line-through"
                      : "none",
                    color: completedDirections.has(direction.id)
                      ? "text.disabled"
                      : "text.primary",
                  }}
                >
                  {direction.direction_number} - {direction.instruction}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mt: 2,
          gap: 2,
        }}
      >
        <Button
          type="submit"
          variant="contained"
          onClick={() => router.push(`/recipes/${recipe.id}/edit`)}
        >
          Edit Recipe
        </Button>
      </Box>
    </Container>
  );
}
