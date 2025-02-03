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
    Paper,
    CircularProgress } from '@mui/material';
import { ExpandMore, AccessTime, People } from '@mui/icons-material';
import recipeService from '@/services/recipeService';

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

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
        }}>
            <Typography
                variant="h6"
                sx={{
                    p: 2,
                    bgcolor: 'background.paper'
            }}>
                Available Recipes
            </Typography>
            
            {/* Scrollable Recipe list */}
            <Box sx={{
                flexGrow: 1,
                overflowY: 'auto',
                px: 2,
                pb: 2,
            }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                }}>
                    {recipes?.map((recipe) => (
                        <Accordion
                            key={recipe.id}
                            sx={{
                                '&:before': {
                                    display: 'none' // Removes the default divider
                                },
                                boxShadow: 1,
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                sx={{
                                    '&hover': {
                                        backgroundColor: 'action.hover',
                                    },
                                }}
                            >
                                <Typography>{recipe.title}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1
                                }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {recipe.description}
                                    </Typography>

                                    <Box sx={{
                                        display: 'flex',
                                        gap: 2,
                                        mt: 1,
                                        collor: 'text.secondary'
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
                                            <People/>
                                            <Typography variant="body2">
                                                Serves {recipe.servings}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}