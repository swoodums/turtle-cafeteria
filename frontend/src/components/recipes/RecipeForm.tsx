/* frontend/src/components/recipes/RecipeForm.tsx */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import{
    Box,
    Button,
    Card,
    CardContent,
    Container,
    IconButton,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { RecipeFormData } from '@/types/recipes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import recipeService from '@/services/recipeService';

export default function RecipeForm() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [formData, setFormData] = useState<RecipeFormData>({
        recipeInfo: {
            title: '',
            description: '',
            cooking_time: '' as any,
            servings: 1
        },
        recipeIngredients: [{ name: '', quantity: 0, unit: '' }],
        directions: [{ direction_number: 1, instruction: '' }]
    });

    const createRecipeMutation = useMutation({
        mutationFn: async (data: RecipeFormData) => {
            // First create the recipe
            const recipe = await recipeService.createRecipe(data.recipeInfo);

            // Then add recipe ingredients and directions
            await Promise.all([
                ...data.recipeIngredients.map(recipeIngredient =>
                    recipeService.createRecipeIngregient(recipe.id, recipeIngredient)
                ),
                ...data.directions.map(direction =>
                    recipeService.createDirection(recipe.id, direction)
                )
            ]);

            return recipe;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recipes'] });
            router.push('/recipes');
        },
    });

    const handleBasicInfoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            recipeInfo: {
                ...prev.recipeInfo,
                [name]: name === 'cooking_time' || name === 'servings'
                ? parseInt(value) || 0
                : value
            }
        }));
    };

    // Handle changes to any ingredient field
    const handleRecipeIngredientChange = (
        index: number,
        field: string,
        value: string | number
    ) => {
        setFormData(prev => ({
            ...prev,
            recipeIngredients: prev.recipeIngredients.map((ingredient, i) =>
                i === index
                    ? { ...ingredient, [field]: field === 'quantity' ? parseFloat(value as string) || 0 : value}
                    : ingredient
            )
        }));
    };

    // Add a new empty ingredient to the list
    const handleAddRecipeIngredient = () => {
        setFormData(prev => ({
            ...prev,
            recipeIngredients: [...prev.recipeIngredients, { name: '', quantity: 0, unit: ''}]
        }));
    };

    // Remove an ingredient at the specified index
    const handleRemoveRecipeIngredient = (index: number) => {
        setFormData(prev => ({
            ...prev,
            recipeIngredients: prev.recipeIngredients.filter((_, i) => 1 !== index)
        }));
    };

    const handleDirectionChange = (index: number, field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            directions: prev.directions.map((direction, i) =>
                i === index
                    ? {...direction, [field]: field === 'direction_number'
                        ? parseInt(value as string) || 0
                        : value }
                    : direction
            )
        }));
    };

    const handleAddDirection = () => {
        setFormData(prev => ({
            ...prev,
            directions: [
                ...prev.directions,
                { direction_number: prev.directions.length + 1, instruction: ''}
            ]
        }));
    };

    const handleRemoveDirection = (index: number) => {
        setFormData(prev => ({
            ...prev,
            directions: prev.directions
                .filter((_, i) => i !== index)
                .map((direction, i) => ({
                    ...direction,
                    direction_number: i + 1
                }))
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createRecipeMutation.mutate(formData);
    };

    return(
        <Container maxWidth="lg" className="py-8">
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardContent>
                        <Stack spacing={4}>
                            {/* Basic Recipe Information*/}
                            <section>
                                <Typography variant="h6" gutterBottom>Recipe Details 📜</Typography>
                                <Stack spacing={3}>
                                    <TextField
                                        name="title"
                                        label="Recipe Title"
                                        value={formData.recipeInfo.title}
                                        onChange={handleBasicInfoChange}
                                        required
                                        fullWidth
                                    />
                                    <TextField
                                        name="description"
                                        label="Description"
                                        value={formData.recipeInfo.description}
                                        onChange={handleBasicInfoChange}
                                        multiline
                                        rows={3}
                                        required
                                        fullWidth
                                    />
                                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                        <TextField
                                            name="cooking_time"
                                            label="Cooking Time (minutes)"
                                            type="number"
                                            value={formData.recipeInfo.cooking_time}
                                            onChange={handleBasicInfoChange}
                                            required
                                            slotProps={{ htmlInput: { min: 0 } }}
                                        />
                                        <TextField
                                            name="servings"
                                            label="Servings"
                                            type="number"
                                            value={formData.recipeInfo.servings}
                                            onChange={handleBasicInfoChange}
                                            required
                                            slotProps={{ htmlInput: { min: 1 } }}
                                        />
                                    </Box>
                                </Stack>
                            </section>

                            {/* Ingredients section*/}
                            <section>
                                <Box
                                    className="flex justify-between items-center mb-4"
                                    sx={{ mb: 3 }}
                                >
                                    <Typography variant="h6">
                                        Ingredients 🛒
                                    </Typography>
                                </Box>

                                <Stack spacing={3}>
                                    {formData.recipeIngredients.map((ingredient, index) => (
                                        <Box
                                            key={`ingredient=${index}`}
                                            sx={{
                                                display: 'flex',
                                                gap: 2,
                                                alignItems: 'center'
                                            }}>
                                            <Box
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns:
                                                    'repeat(3, 1fr)',
                                                    gap: 2,
                                                    flex: 1
                                                }}>
                                                <TextField
                                                    label="Ingredient Name"
                                                    value={ingredient.name}
                                                    onChange={(e) => handleRecipeIngredientChange(index, 'name', e.target.value)}
                                                    required
                                                    fullWidth
                                                    placeholder="e.g., Brussels Sprouts"
                                                />
                                                <TextField
                                                    label="Quantity"
                                                    type="number"
                                                    value={ingredient.quantity}
                                                    onChange={(e) => handleRecipeIngredientChange(index, 'quantity', e.target.value)}
                                                    required
                                                    fullWidth
                                                />
                                                <TextField
                                                    label="Unit"
                                                    value={ingredient.unit}
                                                    onChange={(e) => handleRecipeIngredientChange(index, 'unit', e.target.value)}
                                                    required
                                                    fullWidth
                                                    placeholder="e.g., cups, tablespoons, pc"
                                                />
                                            </Box>
                                            <IconButton
                                                onClick={() => handleRemoveRecipeIngredient(index)}
                                                disabled={formData.recipeIngredients.length === 1}
                                                color="error"
                                                sx={{ mt: 0 }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    ))}
                                    <Box
                                        className="flex justify-between items-center mb-4"
                                        sx={{ mb: 3 }}
                                    >
                                        <Button
                                        startIcon={<AddIcon />}
                                        onClick={handleAddRecipeIngredient}
                                        variant="outlined"
                                        size="small"
                                        >
                                            Add Ingredient
                                        </Button>
                                    </Box>
                                    
                                </Stack>
                            </section>

                            {/* Directions section */}
                            <section>
                                <Box
                                    className="flex justify-between items-center mb-4"
                                    sx={{ mb: 3 }}
                                >
                                    <Typography variant="h6">
                                        Directions 🪜
                                    </Typography>
                                </Box>

                                <Stack spacing={3}>
                                    {formData.directions.map((direction, index) => (
                                        <Box
                                            key={`direction-${index}`}
                                            sx={{
                                                display: 'flex',
                                                gap: 2,
                                                alignItems: 'flex-start'
                                            }}
                                        >
                                            <Box sx={{ width: '100%' }}>
                                                <TextField
                                                    label={`Direction ${direction.direction_number}`}
                                                    value={direction.instruction}
                                                    onChange={(e) => handleDirectionChange(
                                                        index,
                                                        'instruction',
                                                        e.target.value
                                                    )}
                                                    required
                                                    fullWidth
                                                    multiline
                                                    rows={2}
                                                    placeholder="Enter step instructions"
                                                />
                                            </Box>
                                            <IconButton
                                                onClick={() => handleRemoveDirection(index)}
                                                disabled={formData.directions.length === 1}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    ))}
                                    <Box
                                        className="flex justify-between items-center mb-4"
                                        sx={{ mb: 3 }}
                                    >
                                        <Button
                                        startIcon={<AddIcon />}
                                        onClick={handleAddDirection}
                                        variant="outlined"
                                        size="small"
                                        >
                                            Add Direction
                                        </Button>
                                    </Box>
                                </Stack>
                            </section>

                            <Box className="flex justify-end gap-2">
                                <Button onClick={() => router.back()}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={createRecipeMutation.isPending}
                                >
                                    Create Recipe
                                </Button>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </form>
        </Container>
    );
}