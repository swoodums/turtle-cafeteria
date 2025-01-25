/* frontend/src/types/recipes.ts */

export interface Recipe {
    id: number;
    title: string;
    description: string;
    ingredients: string;
    cooking_time: number;
    servings: number;
  }