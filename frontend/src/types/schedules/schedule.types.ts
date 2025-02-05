import { Recipe } from '../recipes/recipe.types';

// Define the meal type enum
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks'

// Base schedule type that matches our backend model
export interface Schedule {
    id: number;
    recipe_id: number;
    start_date: string;
    end_date: string;
    meal_type?: MealType;
    notes?: string;
    recipe?: Recipe;        // Optional recipe details when expanded
}

// Type for creating a new schedule
export interface ScheduleCreate {
    recipe_id: number;
    start_date: string;
    end_date: string;
    meal_type?: MealType;
    notes?: string;
}

// Type for updating an existing schedule
export interface ScheduleUpdate {
    start_date?: string;
    end_date?: string;
    meal_type?: MealType
    notes?: string;
}