/* frontend/src/types/ingredients/measurement_unit.types.ts */

export enum UnitCategory {
  VOLUME = "volumes",
  WEIGHT = "weight",
  QUANTITY = "quantity",
}

// Base measurement unit type matches our backend model
export interface MeasurementUnit {
  id: number;
  name: string;
  abbreviation: string;
  category: UnitCategory;
  is_metric: boolean;
  is_common: boolean;
}
