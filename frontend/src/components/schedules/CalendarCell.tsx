/* frontend/sr/components/schedule/CalendarCell.tsx */

import React, { useState } from 'react';
import { Box } from '@mui/material';
import { Recipe } from '@/types/recipes/recipe.types';
import { MealType } from '@/types/schedules/schedule.types';

interface CalendarCellProps {
    date: Date;
    mealType: MealType;
    onDrop: (recipe: Recipe, date: Date, mealType: MealType) => void;
    children?: React.ReactNode;
}

export default function CalendarCell({ date, mealType, onDrop, children }: CalendarCellProps) {
    const [isOver, setIsOver] = useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!isOver) {
            setIsOver(true);
        }
    };

    const handleDragLeave = () => {
        setIsOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);

        try {
            const recipeData = e.dataTransfer.getData('application/json');
            const recipe = JSON.parse(recipeData) as Recipe;
            onDrop(recipe, date, mealType);
        } catch (error) {
            console.error('Error processing dropped recipe: ', error);
        }
    };

    return (
        <Box
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
                minHeight: '60px',
                height: '100%',
                backgroundColor: isOver ? 'action.hover' : 'background.default',
                borderRadius: 1,
                transition: 'background-color 0.2s ease'
            }}
        >
            {children}
        </Box>
    );
}