/* frontend/src/app/schedule/page.tsx */

'use client';

import WeeklyCalendar from "@/components/schedules/WeeklyCalendar";
import AccordionRecipeList from "@/components/schedules/AccordionRecipeList"
import { Box } from '@mui/material'

export default function SchedulePage() {
    return (
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
                overflow: 'hidden',
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
    );
}