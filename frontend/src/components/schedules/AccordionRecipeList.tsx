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
import { Droppable, Draggable, DroppableProvided, DraggableProvided, DraggableStateSnapshot  } from '@hello-pangea/dnd'
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

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
        }}>
            <Typography variant="h6" sx={{ p: 2, bgcolor: 'background.paper' }}>
                Available Recipes
            </Typography>
            
            <Droppable droppableId="recipe-list" isDropDisabled={true}>
                {(provided) => (
                    <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                            flexGrow: 1,
                            overflowY: 'auto',
                            px: 2,
                            pb: 2
                        }}
                    >
                        {recipes?.map((recipe, index) => (
                            <Draggable
                                key={recipe.id}
                                draggableId={`recipe-${recipe.id}`}
                                index={index}
                            >
                                {(provided, snapshot) => (
                                    <Accordion
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        sx={{
                                            mb: 1,
                                            '&:before': {
                                                display: 'none'
                                            },
                                            boxShadow: 1,
                                            opacity: snapshot.isDragging ? 0.6 : 1,
                                            cursor: 'grab',
                                            '&:active': {
                                                cursor: 'grabbing'
                                            }
                                        }}
                                    >
                                        <AccordionSummary expandIcon={<ExpandMore />}>
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
                                            </Box>
                                        </AccordionDetails>
                                    </Accordion>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </Box>
                )}
            </Droppable>
        </Box>
    );
}