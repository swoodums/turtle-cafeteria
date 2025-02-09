// frontend/src/app/recipes/[id]/edit/page.tsx

"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import RecipeForm from "@/components/recipes/RecipeForm";
import { Box, CircularProgress, Container, Typography } from "@mui/material";
import recipeService from "@/services/recipeService";

export default function EditRecipePage() {
  const { id } = useParams();
  const recipeId = parseInt(id as string);

  const {
    data: recipe,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["recipe", recipeId],
    queryFn: () => recipeService.getRecipeById(recipeId),
  });

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !recipe) {
    return (
      <Typography color="error" align="center">
        Error loading recipe:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </Typography>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Edit Recipe
      </Typography>
      <RecipeForm initialData={recipe} mode="edit" />
    </Container>
  );
}
