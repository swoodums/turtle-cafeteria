/* frontend/sr/components/schedule/CalendarCell.tsx */

import React from 'react';
import { Box, Paper } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Recipe } from '@/types/recipes/recipe.types';
import scheduleService from '@/services/scheduleService';
import { MealType, Schedule, ScheduleCreate } from '@/types/schedules/schedule.types';

interface CalendarCellProps {
    date: Date;
    mealType: MealType;
    children?: React.ReactNode;
}

export default function CalendarCell({ date, mealType, children }: CalendarCellProps) {
    const queryClient = useQueryClient();

    const createScheduleMutation = useMutation({
        mutationFn: (newSchedule: ScheduleCreate) =>
            scheduleService.createSchedule(newSchedule.recipe_id, newSchedule),
        onSuccess: () => {
            // invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
        },
    });

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();

        try {
            const recipeData = e.dataTransfer.getData('application/json');
            const recipe: Recipe = JSON.parse(recipeData);

            const formattedDate = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
            ).toLocaleDateString('en-CA');

            // Create a new schedule for the dropped recipe
            const scheduleData: ScheduleCreate = {
                recipe_id: recipe.id,
                start_date: formattedDate,
                end_date: formattedDate,
                meal_type: mealType,
            };

            createScheduleMutation.mutate(scheduleData);
        } catch (error) {
            console.error('Error handling drop:', error);
        }
    };

    return (
        <Box
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            sx={{
                minHeight: '60px',
                p: 1,
                backgroundColor: 'background.default',
                borderRadius: 1,
                position: 'relative',
                '&:hover': {
                    backgroundColor: 'action.hover',
                }
            }}
        >
            {children}
        </Box>
    );
}