/* frontend/src/component/schedule/WeekCalendar.tsx */

'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Typography,
    IconButton,
    Stack,
    Paper,
    Grid2  } from '@mui/material';
import {
    ChevronLeft,
    ChevronRight,
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
        light: '#d4c3e9',  // Light purple
        main: '#9575cd', // Purple
        text: '#ffffff' // White text for contrast
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
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: 1,
                    width: '100%',
                    height: '80%'
                }}>
                    {/* Day Headers */}
                    {weekDates.map((date) => (
                        <Paper
                        key={date.toISOString()}
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
                        <Stack key={`cell-${date.toISOString()}`} spacing={1}>
                            {MEAL_TYPES.map((mealType) => (
                                <Paper 
                                    key={`${date.toISOString()}-${mealType}`}
                                    sx={{ 
                                        minHeight: '120px',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    <Typography 
                                        variant="subtitle2" 
                                        sx={{ 
                                            mb: 1,
                                            textTransform: 'capitalize',
                                            color: 'text.secondary',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {mealType}
                                    </Typography>
                                    <CalendarCell date={date} mealType={mealType}>
                                        <Stack spacing={1}>
                                            {getSchedulesForDate(date, mealType).map(schedule => (
                                                <ScheduleCard
                                                    key={schedule.id}
                                                    schedule={schedule}
                                                    mealType={mealType}
                                                    colors={getMealTypeColors(mealType)}
                                                />
                                            ))}
                                        </Stack>
                                    </CalendarCell>
                                </Paper>
                            ))}
                        </Stack>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}