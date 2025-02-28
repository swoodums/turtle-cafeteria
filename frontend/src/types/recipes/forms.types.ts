/* frontend/src/types/recipes/form.types.ts */

import { RecipeCreate } from "./recipe.types";
import { RecipeIngredientCreate } from "./recipe_ingredient.types";
import { DirectionCreate } from "./direction.types";


// Form data for the recipe creating process
export interface RecipeFormData {
  // Basic Recipe information up top
  recipeInfo: RecipeCreate;
  // List of recipe ingredients
  recipeIngredients: (RecipeIngredientCreate & { id?: number })[];
  // Ordered list of cooking directions
  directions: (DirectionCreate & { id?: number })[];
}

export type RecipeFormStep =
  | "basic"
  | "recipeIngredients"
  | "directions"
  | "preview";

// Form state management
export interface RecipeFormState {
  currentStep: RecipeFormStep;
  data: RecipeFormData;
  isDirty: boolean;
  isSubmitting: boolean;
}
