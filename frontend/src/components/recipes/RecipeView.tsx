/* frontend/src/components/recipes/RecipeView.tsx */

"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Switch,
  FormControlLabel
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import recipeService from "@/services/recipeService";

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
  const [completedIngredients, setCompletedIngredients] = useState<Set<number>>(new Set());
  const [completedDirections, setCompletedDirections] = useState<Set<number>>(new Set());


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
    if(!cookMode) return;
    setCompletedIngredients(prev=> {
      const newSet = new Set(prev);
      if (prev.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleDirection = (id: number ) => {
    if (!cookMode) return;
    setCompletedDirections(prev => {
      const newSet = new Set(prev);
      if (prev.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Find the first incomplete direction for highlighting
  const sortedDirections = recipe.directions?.sort((a, b) => a.direction_number - b.direction_number) || [];
  const firstIncompleteIndex = sortedDirections.findIndex(
    direction => !completedDirections.has(direction.id)
  );

  return (
    <Container sx={{ maxWidth: "lg", py: 2 }}>
      <Paper elevation={4}>
        {/* Header Section */}
        <Box sx={{ mb: 2, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
              <Switch
                checked={cookMode}
                onChange={(e) => setCookMode(e.target.checked)}
              />
            }
            label="Cook Mode"
          />
        </Box>
      </Paper>

      {/* Ingredients Section */}
      <Box sx={{
        display: 'flex',
        gap: 3,
        width: '100%',
        mt: 3
      }}>
        <Paper elevation={4} sx={{ width: 'fit-content', minWidth: '250px' }}>
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
                  cursor: cookMode ? 'pointer' : 'default',
                  textDecoration: completedIngredients.has(ingredient.id) ? 'line-through' : 'none',
                  color: completedIngredients.has(ingredient.id) ? 'text.disabled' : 'text.primary',
                  mb: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: cookMode ? 'action.hover' : 'transparent'
                  }
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
                    cursor: cookMode ? 'pointer' : 'default',
                    bgcolor: cookMode && index === firstIncompleteIndex ? 'action.selected' : 'transparent',
                    borderRadius: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: cookMode ? 'action.hover' : 'transparnet'
                    }
                  }}
                >
                  <Typography
                    variant="body1"
                    component="div"
                    sx={{
                      textDecoration: completedDirections.has(direction.id) ? 'line-through' : 'none',
                      color: completedDirections.has(direction.id) ? 'text.disabled' : 'text.primary',
                    }}
                  >
                    {direction.direction_number} - {direction.instruction}
                  </Typography>
                </Box>
              ))}
          </Box>
        </Paper>
      </Box>

      <Box sx={{
        display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2
      }}>
        <Button
          variant="contained"
          onClick={() => {
            setCompletedIngredients(new Set());
            setCompletedDirections(new Set());
          }}
          disabled={!cookMode}
        >
          Reset Progress
        </Button>
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
