/* frontend/src/app/schedule/page.tsx */

'use client';

import WeeklyCalendar from "@/components/schedules/WeeklyCalendar";
import AccordionRecipeList from "@/components/schedules/AccordionRecipeList"
import { Box } from '@mui/material'
import { DragDropContext, DropResult } from '@hello-pangea/dnd';

export default function SchedulePage() {
    const handleDragEnd = (result: DropResult) => {
        const { destination, draggableId } = result;

        // Drop was cancelled or occurred outside valid drop target
        if (!destination) return;

        // Extract recipe ID from draggableId
        const recipeId = parseInt(draggableId.split('-')[1]);
        if (isNaN(recipeId)) return;
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Box sx={{
                display: 'flex',
                gap: 3,
                height: 'calc(100vh - 80px)', // Full viewport height minus AppBar height
                width: '100%',
                overflow: 'hidden',
                p: 3
            }}>
                {/* Calendar */}
                <Box sx={{
                    flexGrow: 1,
                    height: '100%',
                    overflowY: 'hidden',
                    bgcolor: 'background.paper',
                    borderRadius: 1
                }}>
                    <WeeklyCalendar />
                </Box>

                {/* Recipes */}
                <Box sx={{
                    width: '400px',
                    flexShrink: 0, // Prevent width from shrinking
                    height: '100%',
                    overflow: 'hidden',
                    bgcolor: 'background.paper',
                    borderRadius: 1
                }}>
                    <AccordionRecipeList />
                </Box>
            </Box>
        </DragDropContext>
    );
}