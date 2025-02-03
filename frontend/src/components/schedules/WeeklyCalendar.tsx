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
    Chip } from '@mui/material';
import {
    ChevronLeft,
    ChevronRight,
    Add as AddIcon,
} from '@mui/icons-material'
import scheduleService from '@/services/scheduleService';
import { Schedule } from '@/types/schedules/schedule.types';

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
    }
} as const;

type MealType = keyof typeof MEAL_TYPE_COLORS

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
    const { data: schedules, isLoading } = useQuery({
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

    // Define meal type priority order for showing scheduled recipes in order
    const MEAL_TYPE_ORDER = {
        'breakfast': 0,
        'lunch': 1,
        'dinner': 2
    } as const

    // Get schedules for a specific date
    const getSchedulesForDate = (date: Date) => {
        if (!schedules) return [];
        const checkDateStr = date.toISOString().split('T')[0];
        return schedules
            .filter(schedule => {
                // Direct string comparison since all dates are in YYY-MM-DD format
                return checkDateStr >= schedule.start_date && checkDateStr <= schedule.end_date;
            })
            .sort((a, b) => {
                // Convert meal types to lowercase for case-insensitive comparison
                const typeA = (a.meal_type?.toLowerCase() || 'dinner');
                const typeB = (b.meal_type?.toLowerCase() || 'dinner');
                // Get priorit order (defaults to dinner)
                const orderA = MEAL_TYPE_ORDER[typeA as keyof typeof MEAL_TYPE_ORDER] ?? MEAL_TYPE_ORDER.dinner;
                const orderB = MEAL_TYPE_ORDER[typeB as keyof typeof MEAL_TYPE_ORDER] ?? MEAL_TYPE_ORDER.dinner;
                
                return orderA - orderB;
            });
    };

    // Get color scheme based on meal type
    const getMealTypeColors = (mealType: string | undefined) => {
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

            {/* Calendar Days - Vertical Stack */}
            <Box sx={{
                flexGrow: 1,
                overflowY: 'auto',
                px: 2,
                pb: 2,
                '::-webkit-scrollbar-track': {
                    background: 'transparent',
                },
                '::-webkit-scrollbar-thumb': {
                    background: 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '4px',
                },
            }}>
                <Stack spacing={2}>
                    {weekDates.map((date) => (
                        <Paper
                            key={date.toISOString()}
                                sx={{
                                p: 2,
                                backgroundColor: 'background.default',
                                width: '100%'
                        }}>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 2
                            }}>
                                <Typography variant="subtitle1">
                                    {date.toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </Typography>
                                <Tooltip title="Add Recipe">
                                    <IconButton>
                                        <AddIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            {/* Scheduled Recipes */}
                            <Stack spacing={1}>
                                {getSchedulesForDate(date).map((schedule) => {
                                    const colors  = getMealTypeColors(schedule.meal_type);
                                    return(
                                        <Tooltip
                                        key={schedule.id}
                                            title={
                                                <Box sx={{ p: 1 }}>
                                                    <Typography
                                                        variant="caption"
                                                        display="block"
                                                        sx={{ mb: 0.5 }}
                                                    >
                                                        🕒️ {schedule.recipe?.cooking_time} minutes
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        display="block"
                                                        sx={{ mb: 0.5 }}
                                                    >
                                                        👥 Serves {schedule.recipe?.servings}
                                                    </Typography>
                                                </Box>
                                            }
                                            arrow
                                            enterDelay={1}
                                            leaveDelay={1}
                                        >
                                            <Paper
                                                sx={{
                                                    p: 2,
                                                    backgroundColor: colors.light,
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        backgroundColor: colors.main,
                                                        '& .MuiTypography-root': {
                                                            color: colors.text
                                                        }
                                                    }
                                                }}
                                            >
                                                <Box sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    
                                                        <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                                                            {schedule.recipe?.title}
                                                        </Typography>
                                                    {schedule.meal_type && (
                                                        <Chip
                                                            label={schedule.meal_type}
                                                            variant="outlined"
                                                            size="small" 
                                                            sx={{
                                                                ml: 1,
                                                                bgcolor: colors.main,
                                                                color: colors.text,
                                                                fontSize: '0.75rem'
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </Paper>
                                        </Tooltip>
                                    );
                                })}
                            </Stack>
                        </Paper> 
                    ))}
                </Stack>
            </Box>
        </Box>
    );
}