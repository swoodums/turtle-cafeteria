/* frontend/src/services/recipeService.ts */

import {
    Recipe,
    Direction,
    RecipeIngredient,
    RecipeIngredientCreate,
    DirectionCreate,
    RecipeCreate } from '@/types/recipes';
import { api } from './api';

export default {
    getAllRecipes,
    getRecipeById,
    deleteRecipeById,
    createRecipe,
    createDirection,
    createRecipeIngregient
}


async function getAllRecipes() {
    const { data } = await api.get<Recipe[]>('/recipe/');
    return data;
}

// async function getRecipeById(id: number) {
//     const { data } = await api.get<Recipe>(`/recipe/${id}`);
//     return data;
// }

async function getRecipeById(id: number): Promise<Recipe> {
    // First, get the basic recipe data
    const { data: recipe } = await api.get<Recipe>(`/recipe/${id}`);

    // Then fetch the related data in parallel
    const [directionsResponse, recipeIngredientsResponse] = await Promise.all([
        api.get<Direction[]>(`/direction/recipe/${id}`),
        api.get<RecipeIngredient[]>(`/recipe_ingredients/recipe/${id}`)
    ]);

    // Combine all the data
    return{
        ...recipe,
        directions: directionsResponse.data,
        recipe_ingredients: recipeIngredientsResponse.data
    }
}

async function deleteRecipeById(id: number) {
    await api.delete<Recipe>(`/recipe/${id}`);
}

async function createRecipe(recipe: RecipeCreate) {
    const { data } = await api.post<Recipe>('/recipe/', recipe);
    return data;
}

async function createDirection(recipeId: number, direction: DirectionCreate) {
    const { data } = await api.post<Direction>(`/direction/recipe/${recipeId}`, direction);
    return data;
}

async function createRecipeIngregient(recipeId: number, recipeIngredient: RecipeIngredientCreate) {
    const { data } = await api.post<RecipeIngredient>(`/recipe_ingredients/recipe/${recipeId}`, recipeIngredient);
    return data;
}