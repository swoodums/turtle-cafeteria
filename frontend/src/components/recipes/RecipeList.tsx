/* frontend/src/components/recipes/RecipeList.tsx */

'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import recipeService from '@/services/recipeService';
import { Box, Button, CircularProgress, Container, Grid2, Typography } from '@mui/material';
import RecipeCard from './RecipeCard';
import { Add as AddIcon } from '@mui/icons-material'

export default function RecipeList() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const {data: recipes, isLoading, error } = useQuery({
        queryKey: ['recipes'],
        queryFn: recipeService.getAllRecipes,
    });

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
        <Box sx={{ 
            position: 'relative',  // This allows absolute positioning of children
            mb: 6 
        }}>
            <Typography variant="h2" component="h1" align='center'>
                Recipes ✨
            </Typography>
        </Box>

        <Grid2 container spacing={3}>
            {recipes?.map((recipe) => (
                <Grid2 
                    key={recipe.id}
                    size={{ xs: 12, sm: 6, md: 4 }}
                >
                    <RecipeCard
                        recipe={recipe}
                        onClick={() => {/* We'll add modal logic here later */}}
                        onEdit={(recipe) => {/* We'll add edit logic here later */}}
                    />
                </Grid2>
            ))}
        </Grid2>
    </Container>
    );
}