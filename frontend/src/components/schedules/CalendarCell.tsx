/* frontend/sr/components/schedule/CalendarCell.tsx */

import React from 'react';
import { Box, Paper } from '@mui/material';
import { Droppable, DroppableProvided, DroppableStateSnapshot } from '@hello-pangea/dnd';
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
    const droppableId = `${date.toLocaleDateString('en-CA')}-${mealType}`

    return (
        <Droppable droppableId={droppableId}>
            {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                        minHeight: '60px',
                        height: '100%',
                        backgroundColor: snapshot.isDraggingOver 
                            ? 'action.hover' 
                            : 'background.default',
                        borderRadius: 1,
                        transition: 'background-color 0.2s ease'
                    }}
                >
                    {children}
                    {provided.placeholder}
            </Box>
            )}
        </Droppable>
    );
}