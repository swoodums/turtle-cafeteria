/* frontend/src/types/ingredients/ingredient.types.ts */

import { MeasurementUnit } from "./measurement_unit.types";

// Define the ingredient category enum to match backend
export enum IngredientCategory {
    PRODUCE = "produce",
    MEAT = "meat",
    DAIRY = "dairy",
    GRAINS = "grains",
    SPICES = "spices",
    PANTRY = "pantry",
    OTHER = "other"
}

// Base ingredient type that matches our backend model
export interface Ingredient {
    id: number;
    name: string;
    preferred_unit_id: number;
    category: IngredientCategory;
    description?: string;
    preferred_unit?: MeasurementUnit;
}

// Type for creating a new ingredient
export type IngredientCreate = Omit<Ingredient, 'id' | 'preferred_unit'>;

//Type for updating an existing ingredient
export type IngredientUpdate = Partial<IngredientCreate>;