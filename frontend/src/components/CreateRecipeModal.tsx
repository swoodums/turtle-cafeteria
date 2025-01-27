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
    Step,
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
    steps: [{ step_number: 1, instruction: ''}]
};

// Steps Section Component
const StepsSection = ({
    steps,
    onStepChange,
    onAddStep,
    onRemoveStep
}: {
    steps: Step[];
    onStepChange:  (index: number, value: string) => void;
    onAddStep: () => void;
    onRemoveStep: (index: number) => void;
}) => (
    <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
            Recipe Steps
        </Typography>
        {steps.map((step, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2}}>
                <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label={`Step ${step.step_number}`}
                    value={step.instruction}
                    onChange={(e) => onStepChange(index, e.target.value)}
                    required
                />
                <IconButton
                    onClick={() => onRemoveStep(index)}
                    disabled={steps.length === 1}
                    sx={{ mt: 1}}
                >
                    <DeleteIcon />
                </IconButton>
            </Box>
        ))}
        <Button
            startIcon={<AddIcon />}
            onClick={onAddStep}
            variant="outlined"
            size="small"
            >
                Add Step
        </Button>
    </Box>
);

export default function CreateRecipeModal({ open, onClose }: CreateRecipeModalProps) {
    const [formData, setFormData] = useState<RecipeFormData>(initialFormState);
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
            cooking_time: formData.cooking_time,
            servings: formData.servings
        });
    };

    const handleClose = () => {
        setFormData(initialFormState);
        onClose();
    };



    const handleStepChange = (index: number, instruction: string) => {
        // const newSteps = prev.steps.map()
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.map((step, i) =>
                i === index ? { ...step, instruction } : step
            )
        }));
    };

    const handleAddStep = () => {
        setFormData(prev => ({
            ...prev,
            steps: [
                ...prev.steps,
                { step_number: prev.steps.length + 1, instruction: '' }
            ]
        }));
    };

    const handleRemoveStep = (index: number) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps
                .filter((_, i) => i !== index)
                .map((step, i) => ({ ...step, step_number: i + 1 }))
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

                        {/* Steps Section */}
                        <StepsSection
                            steps={formData.steps}
                            onStepChange={handleStepChange}
                            onAddStep={handleAddStep}
                            onRemoveStep={handleRemoveStep}
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