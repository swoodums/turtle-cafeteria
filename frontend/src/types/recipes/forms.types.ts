/* frontend/src/types/recipes/form.types.ts */

import { RecipeCreate } from "./recipe.types";
import { RecipeIngredientCreate } from "./recipe_ingredient.types";
import { DirectionCreate } from "./direction.types";

interface FormDirection extends DirectionCreate {
    id?: number; // Optional for new directions
}

interface FormRecipeIngredient extends RecipeIngredientCreate {
    id?: number; // Optional for new directions
}

// Form data for the recipe creating process
export interface RecipeFormData {
    // Basic Recipe information up top
    recipeInfo: RecipeCreate;
    // List of recipe ingredients
    recipeIngredients: FormRecipeIngredient[];
    // Ordered list of cooking directions
    directions: FormDirection[];
}

export type RecipeFormStep = 'basic' | 'recipeIngredients' | 'directions' | 'preview';

// Form state management
export interface RecipeFormState {
    currentStep: RecipeFormStep;
    data: RecipeFormData;
    isDirty: boolean;
    isSubmitting: boolean;
}