/* frontend/src/component/schedule/WeekCalendar.tsx */

'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Typography,
    IconButton,
    Grid2,
    Tooltip, 
    Paper} from '@mui/material';
import {
    ChevronLeft,
    ChevronRight,
    Add as AddIcon
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
        <Box sx={{ width: '100%', p: 3 }}>
            {/* Calendar Header */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
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
            <Grid2 container spacing={2}>
                {weekDates.map((date) => (
                    <Grid2
                        key={date.toISOString()}
                        size={{ xs: 12, sm: 6, md: 4 }}
                    >
                        <Paper sx={{
                            p: 2,
                            height: '200px',
                            backgroundColor: 'background.default',
                            position: 'relative'
                        }}>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 1
                            }}>
                                <Typography variant="subtitle1">
                                    {date.toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </Typography>
                                <Tooltip title="Add Recipe">
                                    <IconButton size="small">
                                        <AddIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            {/* Scheduled Recipes */}
                            <Box sx={{
                                overlfowY: 'auto',
                                height: 'calc(100% - 40px)'
                            }}>
                                {getSchedulesForDate(date).map((schedule) => (
                                    <Paper
                                        key={schedule.id}
                                        sx={{
                                            p: 1,
                                            mb: 1,
                                            backgroundColor: 'primary.light',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: 'primary.main',
                                            }
                                        }}
                                    >
                                        <Typography variant="body2" noWrap>
                                            {schedule.recipe?.title || `Recipe ${schedule.recipe_id}`}
                                        </Typography>
                                    </Paper>
                                ))}
                            </Box>
                        </Paper> 
                    </Grid2>
                ))}
            </Grid2>
        </Box>
    );
}