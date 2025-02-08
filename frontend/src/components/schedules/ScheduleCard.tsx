/* frontend/sr/components/schedule/ScheduleCard.tsx */

import React, { useState } from 'react';
import {
    Paper,
    Typography,
    MenuItem,
    Box,
    Tooltip,
    Popover,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    ButtonBase } from '@mui/material';
import { MealType, Schedule } from '@/types/schedules/schedule.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import scheduleService from '@/services/scheduleService';
import EditScheduleModal from './EditScheduleModal';

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
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const deleteMutation = useMutation({
        mutationFn: () => scheduleService.deleteSchedule(schedule.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
            handleClose();
        },
    });

    const handleDelete = () => {
        setDeleteDialogOpen(true);
        handleClose;
    };

    const handleConfirmDelete = () => {
        deleteMutation.mutate();
        setDeleteDialogOpen(false);
    };

    const handleViewRecipe = () => {
        router.push(`/recipes/${schedule.recipe_id}`);
    };

    const handleEdit = () => {
        setIsEditModalOpen(true);
        handleClose();
    };

    return (
        <>
            <Tooltip
                title={
                    <Box sx={{ p:1, display: 'block' }}>
                        <Typography variant="subtitle1" display="block">
                        {schedule.recipe?.title}
                        </Typography>
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
                <ButtonBase
                    onClick={handleClick}
                    sx={{
                        width: '100%',
                        display:'block',
                        textAlign: 'left'
                    }}
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
                            overflow: 'hidden',
                            flexGrow: 1,
                            width: '100%'
                        }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontSize: '0.875rem',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {schedule.recipe?.title}
                            </Typography>
                        </Box>
                    </Paper>
                </ButtonBase>
            </Tooltip>

            {/* Menu Popover */}
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem onClick={handleViewRecipe}>View Recipe</MenuItem>
                <MenuItem onClick={handleEdit}>Edit Schedule</MenuItem>
                <MenuItem onClick={handleDelete}>Delete Schedule</MenuItem>
            </Popover>

            {/* Edit Modal */}
            <EditScheduleModal
                schedule={schedule}
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />

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
                        Whoa, there!
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                    >
                        Giddyup
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}