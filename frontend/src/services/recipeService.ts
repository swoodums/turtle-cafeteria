/* frontend/src/services/recipeService.ts */

import { api } from './api';
import { Recipe, Direction } from '@/types/recipe';

export default {
    getAllRecipes,
    getRecipeById,
    deleteRecipeById,
    createRecipe,
    createDirection
}


async function getAllRecipes() {
    const { data } = await api.get<Recipe[]>('/recipe/');
    return data;
}

async function getRecipeById(id: number) {
    const { data } = await api.get<Recipe>(`/recipe/${id}`);
    return data;
}

async function deleteRecipeById(id: number) {
    await api.delete<Recipe>(`/recipe/${id}`);
}

async function createRecipe(recipe: Omit<Recipe, 'id'>) {
    const { data } = await api.post<Recipe>('/recipe/', recipe);
    return data;
}

async function createDirection(recipeId: number, direction: Omit<Direction, 'id' | 'recipe_id'>) {
    const { data } = await api.post<Direction>(`/direction/recipe/${recipeId}`, direction);
    return data;
}