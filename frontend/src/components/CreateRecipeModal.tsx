import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stack,
    IconButton,
    Box,
    Typography} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon} from '@mui/icons-material'
import {
    Recipe,
    Direction,
    DirectionInput,
    RecipeFormData } from '@/types/recipe';
import {
    useMutation,
    useQueryClient } from '@tanstack/react-query';
import recipeService from '@/services/recipeService';

interface CreateRecipeModalProps {
    open: boolean;
    onClose: () => void;
}

const initialFormState = {
    title: '',
    description: '',
    ingredients: '',
    cooking_time: 0,
    servings: 0,
    directions: [{ direction_number: 1, instruction: ''}]
};

// Directions Section Component
const DirectionsSection = ({
    directions,
    onDirectionChange,
    onAddDirection,
    onRemoveDirection
}: {
    directions: DirectionInput[];
    onDirectionChange:  (index: number, value: string) => void;
    onAddDirection: () => void;
    onRemoveDirection: (index: number) => void;
}) => (
    <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
            Recipe Directions
        </Typography>
        {directions.map((direction, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2}}>
                <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label={`Direction ${direction.direction_number}`}
                    value={direction.instruction}
                    onChange={(e) => onDirectionChange(index, e.target.value)}
                    required
                />
                <IconButton
                    onClick={() => onRemoveDirection(index)}
                    disabled={directions.length === 1}
                    sx={{ mt: 1}}
                >
                    <DeleteIcon />
                </IconButton>
            </Box>
        ))}
        <Button
            startIcon={<AddIcon />}
            onClick={onAddDirection}
            variant="outlined"
            size="small"
            >
                Add Direction
        </Button>
    </Box>
);

export default function CreateRecipeModal({ open, onClose }: CreateRecipeModalProps) {
    const [formData, setFormData] = useState<RecipeFormData>(initialFormState);
    const queryClient = useQueryClient();

    const createRecipeMutation = useMutation({
        mutationFn: (newRecipe: RecipeFormData) => recipeService.createRecipe(newRecipe),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recipes'] });
            handleClose();
        },
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createRecipeMutation.mutate({
            ...formData,
            cooking_time: formData.cooking_time,
            servings: formData.servings
        });
    };

    const handleClose = () => {
        setFormData(initialFormState);
        onClose();
    };



    const handleDirectionChange = (index: number, instruction: string) => {
        // const newDirections = prev.directions.map()
        setFormData(prev => ({
            ...prev,
            directions: prev.directions.map((direction, i) =>
                i === index ? { ...direction, instruction } : direction
            )
        }));
    };

    const handleAddDirection = () => {
        setFormData(prev => ({
            ...prev,
            directions: [
                ...prev.directions,
                { direction_number: prev.directions.length + 1, instruction: '' }
            ]
        }));
    };

    const handleRemoveDirection = (index: number) => {
        setFormData(prev => ({
            ...prev,
            directions: prev.directions
                .filter((_, i) => i !== index)
                .map((direction, i) => ({ ...direction, direction_number: i + 1 }))
        }));
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Create New Recipe</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2}}>
                        <TextField
                            name="title"
                            label="Recipe Title"
                            value={formData.title}
                            onChange={handleInputChange}
                            fullWidth
                            required
                        />
                        <TextField
                            name="description"
                            label="Description"
                            value={formData.description}
                            onChange={handleInputChange}
                            fullWidth
                            multiline
                            rows={3}
                            required
                        />
                        <TextField
                            name="ingredients"
                            label="Ingredients"
                            value={formData.ingredients}
                            onChange={handleInputChange}
                            fullWidth
                            multiline
                            rows={3}
                            required
                        />
                        <TextField
                            name="cooking_time"
                            label="Cooking Time (minutes)"
                            value={formData.cooking_time}
                            onChange={handleInputChange}
                            type="number"
                            fullWidth
                            required
                        />
                        <TextField
                            name="servings"
                            label="Number of Servings"
                            value={formData.servings}
                            onChange={handleInputChange}
                            type="number"
                            fullWidth
                            required
                        />

                        {/* Directions Section */}
                        <DirectionsSection
                            directions={formData.directions}
                            onDirectionChange={handleDirectionChange}
                            onAddDirection={handleAddDirection}
                            onRemoveDirection={handleRemoveDirection}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={createRecipeMutation.isPending}
                    >
                        Create Recipe
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}