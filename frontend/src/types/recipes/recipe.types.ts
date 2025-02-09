import { RecipeIngredient } from "./recipe_ingredient.types";
import { Direction } from "./direction.types";

// Base recipe type that matches our backend model
export interface Recipe {
  id: number;
  title: string;
  description: string;
  cooking_time: number;
  servings: number;
  recipe_ingredients?: RecipeIngredient[];
  directions?: Direction[];
}

// Type for creating a new recipe - omit auto-generated fields
export type RecipeCreate = Omit<
  Recipe,
  "id" | "recipe_ingredients" | "directions"
>;

// Type for updating an existing recipe
export type RecipeUpdate = Partial<RecipeCreate>;
