// Base recipe_ingredient type that matches our backend model
export interface RecipeIngredient {
  id: number;
  recipe_id: number;
  name: string;
  quantity: number;
  unit: string;
}

// Type for creating a new recipe ingredient
export type RecipeIngredientCreate = Omit<RecipeIngredient, "id" | "recipe_id">;

// Type for updating an existing recipe ingredient
export type RecipeIngredientUpdate = Partial<RecipeIngredientCreate>;
