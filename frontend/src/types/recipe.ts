/* frontend/src/types/recipes.ts */

export interface Recipe {
  id: number;
  title: string;
  description: string;
  ingredients: string;
  cooking_time: number;
  servings: number;
};

export interface Step {
  step_number: number;
  instruction: string;
};

export interface RecipeFormData {
  title: string;
  description: string;
  ingredients: string;
  cooking_time: number;
  servings: number;
  steps: Step[];
}