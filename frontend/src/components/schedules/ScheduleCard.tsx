/* frontend/sr/components/schedule/ScheduleCard.tsx */

import React, { useState } from 'react';
import {
    Paper,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Tooltip } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { MealType, Schedule } from '@/types/schedules/schedule.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import scheduleService from '@/services/scheduleService';

interface ScheduleCardProps {
    schedule: Schedule;
    mealType: MealType;
    colors: {
        light: string;
        main: string;
        text: string;
    };
}

export default function ScheduleCard({ schedule, mealType, colors }: ScheduleCardProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (scheduleId: number) => scheduleService.deleteSchedule(scheduleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
        },
    });

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent event from bubbling to parent elements
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        deleteMutation.mutate(schedule.id);
        setDeleteDialogOpen(false);
    };

    return (
        <>
            <Tooltip
                title={
                    <Box sx={{ p:1 }}>
                        <Typography variant="caption" display="block">
                        🕒 {schedule.recipe?.cooking_time} minutes
                        </Typography>
                        <Typography variant="caption" display="block">
                            👥 Serves {schedule.recipe?.servings}
                        </Typography>
                        {schedule.notes && (
                            <Typography variant="caption" display="block">
                                📝 {schedule.notes}
                            </Typography>
                        )}
                    </Box>
                }
            >
                <Paper
                    sx={{
                        p: 1,
                        backgroundColor: colors.light,
                        cursor: 'pointer',
                        position: 'relative',
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
                        <Typography
                            variant="body2"
                            noWrap
                            sx={{
                                fontSize: '0.875rem',
                                flex: 1,
                                mr: 1
                            }}
                        >
                            {schedule.recipe?.title}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={handleDeleteClick}
                            sx={{
                                padding: '2px',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.1)'
                                }
                            }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Paper>
            </Tooltip>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                aria-labelledby="delete-dialog-title"
            >
                <DialogTitle id="delete-dialog-title">
                    Hold up, partner
                </DialogTitle>
                <DialogContent>
                    Reckon you fixin' to remove "{schedule.recipe?.title}" from your schedule?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirmDelete} 
                        color="error" 
                        variant="contained"
                    >
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}