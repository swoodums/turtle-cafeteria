/* frontend/src/services/recipeService.ts */

import { api } from './api';
import { Recipe } from '@/types/recipe';

export const recipeService = {
    async getAllRecipes() {
        const { data } = await api.get<Recipe[]>('/recipe/');
        return data;
    },

    async getRecipeById(id: number) {
        const { data } = await api.get<Recipe>(`/recipe/${id}`);
        return data;
    }
};