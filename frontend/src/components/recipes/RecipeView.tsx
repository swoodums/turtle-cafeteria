/* frontend/src/components/recipes/RecipeView.tsx */

'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Container,
    Typography,
    Divider,
    Paper,
    CircularProgress } from '@mui/material';
import {
    AccessTime as AccessTimeIcon,
    People,
    People as PeopleIcon } from '@mui/icons-material';
import recipeService from '@/services/recipeService';

interface RecipeViewProps {
    recipeId: number;
}

export default function RecipeView({ recipeId } : RecipeViewProps) {
    const { data: recipe, isLoading, error } = useQuery({
        queryKey: ['recipe', recipeId],
        queryFn: () => recipeService.getRecipeById(recipeId),
    });

    if (isLoading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !recipe) {
        return(
            <Box className="flex justify-center items-center min-h-screen">
                <Typography color="error">
                    Error loading recipe: {error instanceof Error ? error.message : 'Recipe not found'}
                </Typography>
            </Box>
        );
    }

    return (
        <Container sx={{ maxWidth: "lg", py: 2 }}>
            <Paper elevation={4}>
                {/* Header Section */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h3" component="h1" sx={{ mb: 1 }}>
                        {recipe.title}
                    </Typography>

                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        {recipe.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2}}>
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
            </Paper>

            {/* Ingredients Section */}
            <Paper elevation={4}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
                        Ingredients
                    </Typography>

                    {recipe.recipe_ingredients?.map((ingredient) => (
                        <Typography key={ingredient.id} variant="body1">
                            • {ingredient.name} - {ingredient.quantity} {ingredient.unit} 
                        </Typography>
                    ))}
                </Box>
            </Paper>

            {/* Directions Section */}
            <Paper elevation={4}>
                <Box>
                    <Typography variant="h5" component="h2" sx={{ mb: 1}}>
                        Directions
                    </Typography>

                    {recipe.directions?.sort((a, b) => a.direction_number - b.direction_number)
                        .map((direction) => (
                        <Box key={direction.id} className="mb-4">
                            <Typography variant="body1" component="h3">
                                {direction.direction_number} - {direction.instruction}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Paper>
        </Container>
    );
}