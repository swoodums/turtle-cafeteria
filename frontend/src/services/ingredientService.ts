/* frontend/src/services/ingredientService.ts */

import {
  IngredientCategory,
  IngredientCreate,
  IngredientUpdate,
  Ingredient,
} from "@/types/ingredients";
import { api } from "./api";

const ingredientService = {
  getAllIngredients,
  getIngredientById,
  searchIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
};

export default ingredientService;

/**
 * Get all ingredients with option pagination
 */
async function getAllIngredients(offset = 0, limit = 100) {
  const { data } = await api.get<Ingredient[]>("/ingredients/", {
    params: { offset, limit },
  });
  return data;
}

/**
 * Get a specific ingredient by ID
 */
async function getIngredientById(id: number): Promise<Ingredient> {
  const { data } = await api.get<Ingredient>(`/ingredients/${id}`);
  return data;
}

/**
 * Search for ingredients with optional filters
 */
async function searchIngredients(
  options: {
    search?: string;
    category?: IngredientCategory;
    offset?: number;
    limit?: number;
  } = {},
) {
  const { data } = await api.get<Ingredient[]>("/ingredients/", {
    params: options,
  });
  return data;
}

/**
 * Create a new ingredient
 */
async function createIngredient(
  ingredient: IngredientCreate,
): Promise<Ingredient> {
  const { data } = await api.post<Ingredient>("/ingredients/", ingredient);
  return data;
}

/**
 * Update an existing ingredient
 */
async function updateIngredient(
  id: number,
  ingredient: IngredientUpdate,
): Promise<Ingredient> {
  const { data } = await api.put<Ingredient>(`/ingredients/${id}`, ingredient);
  return data;
}

/**
 * Delete an ingredient
 * Note: This will fail if the ingredient is used in any recipe
 */
async function deleteIngredient(id: number): Promise<void> {
  await api.delete(`/ingredients/${id}`);
}
