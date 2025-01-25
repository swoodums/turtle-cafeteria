/* frontend/src/components/RecipeCard.tsx */

'use client'

import { Recipe } from '@/types/recipe'
import { Box, Card, CardContent, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';

interface RecipeCardProps {
    recipe: Recipe;
    onClick?: () => void;
}

const RecipeCard = ({ recipe, onClick }: RecipeCardProps) => {
    return (
        <Card
        sx={{
            maxWidth: 345,
            cursor: 'pointer',
            '&:hover': {
                boxShadow: 6,
                transition: 'box-shadow 0.3s ease-in-out'
            }
        }}
        onClick={onClick}
        >
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