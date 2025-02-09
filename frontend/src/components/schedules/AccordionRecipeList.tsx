/* frontend/sr/components/schedule/AccordionRecipeList.tsx */

'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    CircularProgress } from '@mui/material';
import { ExpandMore, AccessTime, People } from '@mui/icons-material';
import recipeService from '@/services/recipeService';
import { Recipe } from '@/types/recipes/recipe.types'

export default function AccordionRecipeList() {
    const { data: recipes, isLoading } = useQuery({
        queryKey: ['recipes'],
        queryFn: recipeService.getAllRecipes,
    });

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, recipe: Recipe) => {
        e.dataTransfer.setData('application/json', JSON.stringify(recipe));
        // Dragging class to style the dragged element.  Drag 'em!
        if (e.currentTarget.classList) {
            e.currentTarget.classList.add('dragging');
        }
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        // Remove the dragging class
        if (e.currentTarget.classList) {
            e.currentTarget.classList.remove('dragging');
        }
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
        }}>
            <Typography variant="h6" sx={{ p: 2, bgcolor: 'background.paper' }}>
                Available Recipes
            </Typography>

            <Box sx={{
                flexGrow: 1,
                overflowY: 'auto',
                px: 2,
                pb: 2
            }}>
                {recipes?.map((recipe) => (
                    <Accordion
                        key={recipe.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, recipe)}
                        onDragEnd={handleDragEnd}
                        sx={{
                            mb: 1,
                            '&:before': {
                                display: 'none'
                            },
                            boxShadow: 1,
                            cursor: 'grab',
                            '&:active': {
                                cursor: 'grabbing'
                            },
                            '&.dragging': {
                                opacity: 0.8,
                                boxShadow: 3
                            }
                        }}
                    >
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography>{recipe.title}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{
                                display: 'flex',
                                gap: 1,
                                mt: 1,
                                color: 'text.secondary'
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5
                                }}>
                                    <AccessTime fontSize="small" />
                                    <Typography variant="body2">
                                        {recipe.cooking_time} mins
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5
                                }}>
                                    <People fontSize="small" />
                                    <Typography variant="body2">
                                        Serves {recipe.servings}
                                    </Typography>
                                </Box>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Box>
        </Box>
    );
}