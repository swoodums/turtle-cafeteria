/* frontend/src/components/RecipeList.tsx */

'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { recipeService } from '@/services/recipeService';
import { Box, CircularProgress, Container, Grid2, Grid2Props, Typography } from '@mui/material';
import RecipeCard from './RecipeCard';

export default function RecipeList() {
    const {data: recipes, isLoading, error } = useQuery({
        queryKey: ['recipes'],
        queryFn: recipeService.getAllRecipes,
    });

    console.log('Recipes:', recipes);  // Add this
    console.log('Loading:', isLoading);  // Add this
    console.log('Error:', error);  // Add this

    if (isLoading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                <CircularProgress />
            </Box>
        );
    }

if (error) {
    return (
        <Typography color="error" align="center">
            Error loading recipes: {error instanceof Error ? error.message : 'Unknown error'}
        </Typography>
    );
}

return (
  <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
          Recipes
      </Typography>
      <Grid2 container spacing={3}>
          {recipes?.map((recipe) => (
              <Grid2 
                  key={recipe.id}
                  size={{ xs: 12, sm: 6, md: 4 }}
              >
                  <RecipeCard
                      recipe={recipe}
                      onClick={() => {/* We'll add modal logic here later */}}
                  />
              </Grid2>
          ))}
      </Grid2>
  </Container>
);
}