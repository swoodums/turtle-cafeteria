/* frontend/src/components/recipes/RecipeList.tsx */

"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import recipeService from "@/services/recipeService";
import {
  Box,
  CircularProgress,
  Container,
  Grid2,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import RecipeCard from "./RecipeCard";
import { Search } from "@mui/icons-material";

export default function RecipeList() {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: recipes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["recipes"],
    queryFn: recipeService.getAllRecipes,
  });

  // Filter recipes based on search term
  const filteredRecipes = recipes?.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center">
        Error loading recipes:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </Typography>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          position: "relative", // This allows absolute positioning of children
          mb: 6,
        }}
      >
        <Typography variant="h2" component="h1" align="center">
          Recipes ✨
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box
        sx={{
          px: 2,
          pb: 2,
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Whatcha lookin' fer?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Grid2 container spacing={3}>
        {filteredRecipes?.map((recipe) => (
          <Grid2 key={recipe.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <RecipeCard recipe={recipe} />
          </Grid2>
        ))}
      </Grid2>
    </Container>
  );
}
