// Base direction type that matches our backend model
export interface Direction {
    id: number;
    recipe_id: number;
    direction_number: number;
    instruction: string;
}

// Type for creating a new direction
export type DirectionCreate = Omit<Direction, 'id' | 'recipe_id'>;

// Type for updating an existing direction
export type DirectionUpdate = Partial<DirectionCreate>;