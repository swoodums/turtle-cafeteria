/* frontend/src/components/RecipeCard.tsx */

'use client'

import { Recipe } from '@/types/recipe'
import {
    Box,
    Card,
    CardContent,
    Typography,
    IconButton,
    Menu,
    MenuItem
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import recipeService from '@/services/recipeService';

interface RecipeCardProps {
    recipe: Recipe;
    onClick?: () => void;
    onEdit?: (recipe: Recipe) => void;
}

const RecipeCard = ({ recipe, onClick, onEdit }: RecipeCardProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const queryClient = useQueryClient();

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation(); // prevent card click even
        setAnchorEl(event.currentTarget);
    }

    const handleClose = () => {
        setAnchorEl(null);
    };

    const deleteRecipeMutation = useMutation({
        mutationFn: (id: number) => recipeService.deleteRecipeById(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recipes'] });
        },
    });

    const handleDelete = (event: React.MouseEvent) => {
        event.stopPropagation();
        if (confirm('Are you sure you want to delete this recipe?')) {
            deleteRecipeMutation.mutate(recipe.id);
        }
        handleClose();
    };

    return (
        <Card
            sx={{
                maxWidth: 345,
                cursor: 'pointer',
                position: 'relative',
                '&:hover': {
                    boxShadow: 6,
                    transition: 'box-shadow 0.3s ease-in-out'
                }
            }}
            onClick={onClick}
        >
            <IconButton
                onClick={handleClick}
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 1
                }}
            >
                <MoreVertIcon />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                <MenuItem onClick={handleDelete}>Delete</MenuItem>
            </Menu>
            <CardContent>
                <Typography
                    gutterBottom variant="h5"
                    component="div">
                        {recipe.title}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 2
                    }}
                >
                    {recipe.description}
                </Typography>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                    }}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography
                            variant="body2"
                            color="text.secondary">
                                {recipe.cooking_time} mins
                        </Typography>
                    </Box>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                    }}>
                        <PeopleIcon fontSize="small" color="action" />
                        <Typography
                            variant="body2"
                            color="text.secondary">
                                Serves {recipe.servings}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default RecipeCard;