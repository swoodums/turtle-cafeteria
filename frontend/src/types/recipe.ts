/* frontend/src/types/recipes.ts */

export interface Recipe {
  id: number;
  title: string;
  description: string;
  ingredients: string;
  cooking_time: number;
  servings: number;
  directions?: Direction[];
};

export interface Direction {
  id: number,
  recipe_id: number,
  direction_number: number;
  instruction: string;
};

export interface DirectionInput {
  direction_number: number;
  instruction: string;
}

export interface RecipeFormData {
  title: string;
  description: string;
  ingredients: string;
  cooking_time: number;
  servings: number;
  directions: DirectionInput[];
};