/* frontend/src/component/schedule/WeekCalendar.tsx */

'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Typography,
    IconButton,
    Stack,
    Tooltip, 
    Paper,
    Chip,
    Grid2  } from '@mui/material';
import {
    ChevronLeft,
    ChevronRight,
    Add as AddIcon,
    Schedule as ScheduleIcon,
} from '@mui/icons-material'
import scheduleService from '@/services/scheduleService';
import { MealType, Schedule } from '@/types/schedules/schedule.types';
import CalendarCell from './CalendarCell';
import ScheduleCard from './ScheduleCard';

const MEAL_TYPES:MealType[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

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
    snacks: {
        light: '#d4c3e9',
        main: '#9575cd',
        text: '#ffffff'
    }
} as const;

export default function WeeklyCalendar() {
    const [ currentWeek, setCurrentWeek ] = useState(() => {
        const now = new Date();
        // Set to beginning of week (Sunday)
        now.setDate(now.getDate() - now.getDay());
        return new Date(now);
    });

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

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
        }}>
            {/* Fixed Calendar Header */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderBottom: 1,
                borderColor: 'divider'
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
                        {weekStart.toLocaleDateString('en-CA', {
                            month: 'long',
                            day: 'numeric'
                        })} - {weekEnd.toLocaleDateString('en-CA', {
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
        
        {/* Meal Type Headers */}
        <Grid2 container sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Grid2 size={2}>
                <Typography variant="subtitle2" sx={{ pl: 2 }}>Date</Typography>
            </Grid2>
            {MEAL_TYPES.map(mealType => (
                <Grid2 size={2.5} key={mealType}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            textTransform: 'capitalize',
                            textAlign: 'center'
                        }}
                    >
                        {mealType}
                    </Typography>
                </Grid2>
            ))}
        </Grid2>

        {/* Calendar Body */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2, pb: 2 }}>
            <Stack spacing={1}>
                {weekDates.map((date) => (
                    <Paper
                        key={date.toLocaleDateString('en-CA')}
                        sx={{ p: 1 }}
                    >
                        <Grid2 container spacing={1} alignItems="center">
                            {/* Date Column */}
                            <Grid2 size={2}>
                                <Typography variant="body2">
                                    {date.toLocaleDateString('en-CA', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </Typography>
                            </Grid2>

                            {/* Meal Type Columns */}
                            {MEAL_TYPES.map(mealType => (
                                <Grid2 size={2.5} key={mealType}>
                                    <Stack spacing={1}>
                                        <CalendarCell date={date} mealType={mealType}>
                                        
                                            {getSchedulesForDate(date, mealType).map(schedule =>
                                                <ScheduleCard
                                                    key={schedule.id}
                                                    schedule={schedule}
                                                    mealType={mealType}
                                                    colors={getMealTypeColors(mealType)}
                                                />
                                            )}
                                        </CalendarCell>
                                    </Stack>
                                    
                                </Grid2>
                            ))}
                        </Grid2>
                    </Paper>
                ))}
            </Stack>
        </Box>
    </Box>
    );
}