import { Recipe } from '../recipes/recipe.types';

// Base schedule type that matches our backend model
export interface Schedule {
    id: number;
    recipe_id: number;
    start_date: string;
    end_date: string;
    notes?: string;
    recipe?: Recipe;        // Optional recipe details when expanded
}

// Type for creating a new schedule
export interface ScheduleCreate {
    start_date: string;
    end_date: string;
    notes?: string;
}

// Type for updating an existing schedule
export interface ScheduleUpdate {
    start_date?: string;
    end_date?: string;
    notes?: string;
}