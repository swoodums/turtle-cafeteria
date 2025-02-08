/* frontend/src/component/schedule/WeekCalendar.tsx */

'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
    Box,
    Typography,
    IconButton,
    Stack,
    Paper,
    Alert,
    Snackbar, 
    Slide} from '@mui/material';
import {
    ChevronLeft,
    ChevronRight,
} from '@mui/icons-material';
import { DropResult } from '@hello-pangea/dnd';
import scheduleService from '@/services/scheduleService';
import { MealType, ScheduleCreate } from '@/types/schedules/schedule.types';
import { Recipe } from '@/types/recipes/recipe.types';
import CalendarCell from './CalendarCell';
import ScheduleCard from './ScheduleCard';

export default function WeeklyCalendar() {
    const queryClient = useQueryClient();

    const [ currentWeek, setCurrentWeek ] = useState(() => {
        const now = new Date();
        // Set to beginning of week (Sunday)
        now.setDate(now.getDate() - now.getDay());
        return new Date(now);
    });

    const [alertOpen, setAlertOpen] = useState(false);

    // Calculate week range
    const weekStart = new Date(currentWeek);
    const weekEnd = new Date(currentWeek);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Fetch schedules for current week
    const { data: schedules } = useQuery({
        queryKey:['schedules', weekStart.toISOString(), weekEnd.toISOString()],
        queryFn: () => scheduleService.getSchedulesByDateRange(weekStart, weekEnd),
    });

    // Navigate weeks
    const navigateWeek = (direction: 'prev' | 'next') => {
        setCurrentWeek(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
            return newDate;
        });
    };

    const createScheduleMutation = useMutation({
        mutationFn: (newSchedule: ScheduleCreate) =>
            scheduleService.createSchedule(newSchedule.recipe_id, newSchedule),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
        },
    });

    {/* Define how to drop recipes on calendar */}
    const handleRecipeDrop = (recipe: Recipe, date: Date, mealType: MealType) => {
        // Format date manually to preserve local date
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        // Check existing schedules for this date and meal type
        const existingSchedules = getSchedulesForDate(date, mealType);

        if (existingSchedules.length >= 3) {
            setAlertOpen(true);
            return;
        }

        const scheduleData: ScheduleCreate = {
            recipe_id: recipe.id,
            start_date: formattedDate,
            end_date: formattedDate,
            meal_type: mealType,
        };

        createScheduleMutation.mutate(scheduleData);
    };

    // Generate array of dates for current week
    const weekDates = [...Array(7)].map((_, i) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        return date;
    });

    // Get schedules for a specific date
    const getSchedulesForDate = (date: Date, mealType: string) => {
        if (!schedules) return [];
        const checkDateStr = date.toLocaleDateString('en-CA');
        return schedules.filter(schedule =>
            checkDateStr >= schedule.start_date &&
            checkDateStr <= schedule.end_date &&
            (schedule.meal_type?.toLowerCase() || 'dinner') === mealType.toLowerCase()
        );
    };

    const getMealTypeColors = (mealType: string) => {
        const type = (mealType?.toLowerCase() || 'dinner') as MealType;
        return MEAL_TYPE_COLORS[type] || MEAL_TYPE_COLORS.dinner
    };

    const MEAL_TYPES:MealType[] = ['breakfast', 'lunch', 'dinner'];

    const MEAL_TYPE_COLORS = {
        breakfast: {
            light: '#f7e2b4', // Light yellow
            main: '#f4d793', // Yellow
            text: '#000000'  // Black text for contrast
        },
        lunch: {
            light: '#c5d1b9', // Light green
            main: '#889e73', // Green
            text: '#000000'  // Black text for contrast
        },
        dinner: {
            light: '#dab3b3', // Light red
            main: '#a94a4a', // Red
            text: '#000000'  // Black text for contrast
        },
    } as const;

    const MEAL_CELL_HEIGHT = 190; // Space for 3 cards (40px * 3) + header (28px) + padding

    return (
        <>
            <Box sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '100%'
            }}>
                {/* Calendar Header */}
                <Box sx={{
                    p: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography variant="h4">
                        Recipe Schedule
                    </Typography>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <IconButton onClick={() => navigateWeek('prev')}>
                            <ChevronLeft />
                        </IconButton>
                        <Typography>
                            {weekStart.toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric'
                            })} - {weekEnd.toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </Typography>
                        <IconButton onClick={() => navigateWeek('next')}>
                            <ChevronRight />
                        </IconButton>
                    </Box>
                </Box>

                {/* Calendar Grid */}
                <Box sx={{ 
                    flexGrow: 1, 
                    overflow: 'auto', 
                    p: 2,
                    minHeight: 0
                }}>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                        gap: 1,
                        width: '100%',
                        height: '80%',
                        minWidth: 0
                    }}>
                        {/* Day Headers */}
                        {weekDates.map((date) => (
                            <Paper
                            key={date.toLocaleDateString('en-CA')}
                            sx={{ 
                                mb: 1,
                                textAlign: 'center',
                                backgroundColor: 'primary.light',
                                color: 'primary.contrastText',
                                width: '100%'
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                </Typography>
                                <Typography variant="subtitle1">
                                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </Typography>
                            </Paper>
                        ))}

                        {/* Calendar Cells */}
                        {weekDates.map((date) => (
                            <Stack
                                key={`cell-${date.toLocaleDateString('en-CA')}`}
                                spacing={1}
                                sx={{ minWidth: 0 }}
                            >
                                {MEAL_TYPES.map((mealType) => (
                                    <Paper 
                                        key={`${date.toLocaleDateString('en-CA')}-${mealType}`}
                                        elevation={3}
                                        sx={{ 
                                            height: MEAL_CELL_HEIGHT,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            minWidth: 0,
                                            overflow: 'hidden',
                                            p: 1
                                        }}
                                    >
                                        {/* Fixed Header */}
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                textTransform: 'capitalize',
                                                color: 'text.secondary',
                                                fontWeight: 'bold',
                                                backgroundColor: 'background.paper',
                                                borderBottom: 1,
                                                borderColor: 'divider'
                                            }}
                                        >
                                            {mealType}
                                        </Typography>

                                        {/* Scrollable content area */}
                                        <CalendarCell
                                            date={date}
                                            mealType={mealType}
                                            onDrop={handleRecipeDrop}
                                        >
                                            <Box sx={{
                                                flexGrow: 1,
                                                overflowY: 'auto',
                                                minWidth: 0,
                                                p: 1,
                                                '&::-webkit-scrollbar': {
                                                    width: '8px',
                                                },
                                                '&::-webkit-scrollbar-track': {
                                                    background: 'transparent'
                                                },
                                                '&::-webkit-scrollbar-thumb': {
                                                    background: '#bbb',
                                                    borderRadius: '4px',
                                                    '&:hover': {
                                                        background: '#999'
                                                    }
                                                }

                                            }}>
                                                <Stack spacing={1} sx={{ minWidth: 0 }}>
                                                    {getSchedulesForDate(date, mealType).map(schedule => (
                                                        <ScheduleCard
                                                            key={schedule.id}
                                                            schedule={schedule}
                                                            mealType={mealType}
                                                            colors={getMealTypeColors(mealType)}
                                                        />
                                                    ))}
                                                </Stack>
                                            </Box>                           
                                        </CalendarCell>
                                    </Paper>
                                ))}
                            </Stack>
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* Alert for schedule limit */}
            <Snackbar
                open={alertOpen}
                autoHideDuration={5000}
                onClose={() => setAlertOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                TransitionComponent={Slide}
            >
                <Alert
                    onClose={() => setAlertOpen(false)}
                    severity="warning"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    Maximum of 3 recipes allowed
                </Alert>
            </Snackbar>
        </>
    );
}