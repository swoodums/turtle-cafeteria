/* frontend/src/services/measurementService.ts */

import {
  MeasurementUnit,
  UnitCategory,
} from "@/types/ingredients/measurement_unit.types";
import { api } from "./api";

const measurementService = {
  getAllUnits,
  getUnitById,
  filterUnits,
};

export default measurementService;

/**
 * Get all measurement units
 */
async function getAllUnits(): Promise<MeasurementUnit[]> {
  const { data } = await api.get<MeasurementUnit[]>("/units/");
  return data;
}

/**
 * Get a specific measurement unit by ID
 */
async function getUnitById(id: number): Promise<MeasurementUnit> {
  const { data } = await api.get<MeasurementUnit>(`/units/${id}`);
  return data;
}

/**
 * Filter units by various criteria
 */
async function filterUnits(
  options: {
    category?: UnitCategory;
    is_metric?: boolean;
    is_common?: boolean;
  } = {},
): Promise<MeasurementUnit[]> {
  const { data } = await api.get<MeasurementUnit[]>("/units/", {
    params: options,
  });
  return data;
}
