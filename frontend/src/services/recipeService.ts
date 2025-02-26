/* frontend/src/services/recipeService.ts */

import {
  Recipe,
  Direction,
  RecipeIngredient,
  RecipeIngredientCreate,
  DirectionCreate,
  RecipeCreate,
} from "@/types/recipes";
import { api } from "./api";

const recipeService = {
  getAllRecipes,
  getRecipeById,
  deleteRecipe,
  updateRecipe,
  createRecipe,
  createDirection,
  updateDirection,
  deleteDirection,
  createRecipeIngregient,
  updateRecipeIngredient,
  deleteRecipeIngredient,
};

export default recipeService;

async function getAllRecipes() {
  const { data } = await api.get<Recipe[]>("/recipe/");
  return data;
}

async function getRecipeById(id: number): Promise<Recipe> {
  // First, get the basic recipe data
  const { data: recipe } = await api.get<Recipe>(`/recipe/${id}`);

  // Then fetch the related data in parallel
  const [directionsResponse, recipeIngredientsResponse] = await Promise.all([
    api.get<Direction[]>(`/direction/recipe/${id}`),
    api.get<RecipeIngredient[]>(`/recipe_ingredients/recipe/${id}`),
  ]);

  // Combine all the data
  return {
    ...recipe,
    directions: directionsResponse.data,
    recipe_ingredients: recipeIngredientsResponse.data,
  };
}

async function deleteRecipe(id: number) {
  await api.delete<Recipe>(`/recipe/${id}`);
}

async function createRecipe(recipe: RecipeCreate) {
  const { data } = await api.post<Recipe>("/recipe/", recipe);
  return data;
}

async function updateRecipe(id: number, recipe: RecipeCreate) {
  const { data } = await api.put<Recipe>(`/recipe/${id}`, recipe);
  return data;
}

async function createDirection(recipeId: number, direction: DirectionCreate) {
  const { data } = await api.post<Direction>(
    `/direction/recipe/${recipeId}`,
    direction,
  );
  return data;
}

async function updateDirection(id: number, direction: DirectionCreate) {
  const { data } = await api.put<Direction>(`/direction/${id}`, direction);
  return data;
}

async function deleteDirection(id: number) {
  await api.delete(`/direction/${id}`);
}

async function createRecipeIngregient(
  recipeId: number,
  recipeIngredient: RecipeIngredientCreate,
) {
  const { data } = await api.post<RecipeIngredient>(
    `/recipe_ingredients/recipe/${recipeId}`,
    recipeIngredient,
  );
  return data;
}

async function updateRecipeIngredient(
  id: number,
  recipeIngredient: RecipeIngredientCreate,
) {
  const { data } = await api.put<RecipeIngredient>(
    `/recipe_ingredients/${id}`,
    recipeIngredient,
  );
  return data;
}

async function deleteRecipeIngredient(id: number) {
  await api.delete(`/recipe_ingredients/${id}`);
}
