/* frontend/src/component/schedule/WeekCalendar.tsx */

'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Typography,
    IconButton,
    Grid2,
    Stack,
    Tooltip, 
    Paper} from '@mui/material';
import {
    ChevronLeft,
    ChevronRight,
    Add as AddIcon,
} from '@mui/icons-material'
import scheduleService from '@/services/scheduleService';
import { Schedule } from '@/types/schedules/schedule.types';

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

    // Get schedules for a specific date
    const getSchedulesForDate = (date: Date) => {
        if (!schedules) return [];
        const dateStr = date.toISOString().split('T')[0];
        return schedules.filter(schedule => {
            const startDate = new Date(schedule.start_date);
            const endDate = new Date(schedule.end_date);
            const checkDate = new Date(date);
            // Reset times to compare dates only
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);
            checkDate.setHours(0, 0, 0, 0);
            return checkDate >= startDate && checkDate <= endDate;
        });
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
                                {getSchedulesForDate(date).map((schedule) => (
                                    <Paper
                                        key={schedule.id}
                                        sx={{
                                            p: 2,
                                            backgroundColor: 'primary.light',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: 'primary.main',
                                            }
                                        }}
                                    >
                                        <Tooltip
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
                                                        👥 {schedule.recipe?.servings} minutes
                                                    </Typography>
                                                </Box>
                                            }
                                            arrow
                                            enterDelay={500}
                                            leaveDelay={200}
                                        >
                                            <Typography variant="body2" noWrap>
                                                {schedule.recipe?.title}
                                            </Typography>
                                        </Tooltip>
                                    </Paper>
                                ))}
                            </Stack>
                        </Paper> 
                    ))}
                </Stack>
            </Box>
        </Box>
    );
}