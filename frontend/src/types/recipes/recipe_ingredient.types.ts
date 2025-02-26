// Base recipe_ingredient type that matches our backend model

import { Ingredient } from '../ingredients/ingredient.types';
import { MeasurementUnit } from '../ingredients/measurement_unit.types';

export interface RecipeIngredient {
  id: number;
  recipe_id: number;
  ingredient_id: number;
  quantity: number;
  unit_id: number;
  ingredient: Ingredient;
  unit: MeasurementUnit;
}

// Type for creating a new recipe ingredient
export type RecipeIngredientCreate = Omit<RecipeIngredient, "id" | "recipe_id">;

// Type for updating an existing recipe ingredient
export type RecipeIngredientUpdate = Partial<RecipeIngredientCreate>;
