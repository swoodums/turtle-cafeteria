import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stack
} from '@mui/material';
import { Recipe } from '@/types/recipe';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recipeService } from '@/services/recipeService';

interface CreateRecipeModalProps {
    open: boolean;
    onClose: () => void;
}

const initialFormState = {
    title: '',
    description: '',
    ingredients: '',
    cooking_time: '',
    servings: ''
};

export default function CreateRecipeModal({ open, onClose }: CreateRecipeModalProps) {
    const [formData, setFormData] = useState(initialFormState);
    const queryClient = useQueryClient();

    const createRecipeMutation = useMutation({
        mutationFn: (newRecipe: Omit<Recipe, 'id'>) => recipeService.createRecipe(newRecipe),
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
            cooking_time: parseInt(formData.cooking_time),
            servings: parseInt(formData.servings)
        });
    };

    const handleClose = () => {
        setFormData(initialFormState);
        onClose();
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