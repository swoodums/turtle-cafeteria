/* frontend/sr/components/schedule/ScheduleCard.tsx */

import React, { useState } from 'react';
import {
    Paper,
    Typography,
    IconButton,
    MenuItem,
    Box,
    Tooltip,
    Popover,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
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

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const deleteMutation = useMutation({
        mutationFn: () => scheduleService.deleteSchedule(schedule.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
            handleMenuClose();
        },
    });

    const handleDelete = () => {
        setDeleteDialogOpen(true);
        handleMenuClose;
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
        handleMenuClose();
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
                            onClick={handleMenuClick}
                            sx={{
                                padding: '2px',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.1)'
                                }
                            }}
                        >
                            <MoreVertIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Paper>
            </Tooltip>

            {/* Menu Popover */}
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleMenuClose}
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