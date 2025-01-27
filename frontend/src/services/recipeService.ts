/* frontend/src/services/recipeService.ts */

import { api } from './api';
import { Recipe } from '@/types/recipe';

export default {
    getAllRecipes,
    getRecipeById,
    deleteRecipeById,
    createRecipe,
    createStep
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

async function createStep(recipeId: number, step: { step_number: number; instruction: string}) {
    const { data } = await api.post<Recipe>(`/step/recipe/${recipeId}`, step);
    return data;
}