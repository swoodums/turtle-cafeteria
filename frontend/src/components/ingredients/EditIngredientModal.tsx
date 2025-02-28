/* frontend/src/components/ingredients/EditIngredientModal.tsx */

"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  FormHelperText,
  CircularProgress,
} from "@mui/material";
import ingredientService from "@/services/ingredientService";
import measurementService from "@/services/measurementService";
import {
  Ingredient,
  IngredientUpdate,
  IngredientCategory,
} from "@/types/ingredients";
import { MeasurementUnit } from "@/types/ingredients";

interface EditIngredientModalProps {
  open: boolean;
  ingredient: Ingredient;
  onClose: () => void;
}

export default function EditIngredientModal({
  open,
  ingredient,
  onClose,
}: EditIngredientModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<IngredientUpdate>({
    name: ingredient.name,
    preferred_unit_id: ingredient.preferred_unit_id,
    category: ingredient.category,
    description: ingredient.description || "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load measurement units
  const { data: units, isLoading: isLoadingUnits } = useQuery({
    queryKey: ["units"],
    queryFn: () => measurementService.getAllUnits(),
    enabled: open, // Only fetch when the modal is open
  });

  // Group units by category for easier selection
  const unitsByCategory = React.useMemo(() => {
    if (!units) return {};
    // The reduce method changes the array structure
    // Stores categories as keys, with an array of the measurement types as records.
    return units.reduce((acc: Record<string, MeasurementUnit[]>, unit) => {
      if (!acc[unit.category]) {
        acc[unit.category] = [];
      }
      acc[unit.category].push(unit);
      return acc;
    }, {});
  }, [units]);

  // Update ingredient mutation
  const updateMutation = useMutation({
    mutationFn: (data: IngredientUpdate) =>
      ingredientService.updateIngredient(ingredient.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredient"] });
      onClose();
    },
    onError: (error: AxiosError<{ detail: string }>) => {
      if (error.response?.data?.detail) {
        // Handle API validation errors
        setFormErrors({
          apiError: error.response.data.detail,
        });
      }
    },
  });

  const handleChange =
    (field: keyof IngredientUpdate) =>
    (
      e:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | SelectChangeEvent<unknown>,
    ) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));

      // Clear any error for this field
      if (formErrors[field]) {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      errors.name = "You gotta name this thing!";
    }

    if (!formData.preferred_unit_id) {
      errors.preferred_unit_id = "Please select a preferred unit";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      updateMutation.mutate(formData);
    }
  };

  // Reset form when ingredient changes
  useEffect(() => {
    if (open && ingredient) {
      setFormData({
        name: ingredient.name,
        preferred_unit_id: ingredient.preferred_unit_id,
        category: ingredient.category,
        description: ingredient.description || "",
      });
      setFormErrors({});
    }
  }, [open, ingredient]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Ingredient</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Ingredient Name"
              fullWidth
              value={formData.name || ""}
              onChange={handleChange("name")}
              error={!!formErrors.name}
              helperText={formErrors.name}
              required
              autoFocus
            />

            <FormControl fullWidth error={!!formErrors.categories}>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category || ""}
                label="Category"
                onChange={handleChange("category")}
                required
              >
                {Object.values(IngredientCategory).map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() +
                      category.slice(1).toLowerCase()}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.category && (
                <FormHelperText>{formErrors.category}</FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth error={!!formErrors.preferred_unit_id}>
              <InputLabel>Preferred Unit</InputLabel>
              <Select
                value={formData.preferred_unit_id || ""}
                label="Preferred Unit"
                onChange={handleChange("preferred_unit_id")}
                required
                disabled={isLoadingUnits}
              >
                {isLoadingUnits ? (
                  <MenuItem value="">
                    <CircularProgress size={20} /> Loading Units...
                  </MenuItem>
                ) : (
                  Object.entries(unitsByCategory).map(
                    ([category, categoryUnits]) => [
                      <MenuItem key={category} disabled divider>
                        {category.charAt(0).toUpperCase() +
                          category.slice(1).toLowerCase()}
                      </MenuItem>,
                      ...categoryUnits.map((unit) => (
                        <MenuItem key={unit.id} value={unit.id}>
                          {unit.name} ({unit.abbreviation})
                        </MenuItem>
                      )),
                    ],
                  )
                )}
              </Select>
              {formErrors.preferred_unit_id && (
                <FormHelperText>{formErrors.preferred_unit_id}</FormHelperText>
              )}
            </FormControl>

            <TextField
              label="Description (Optional)"
              fullWidth
              multiline
              rows={3}
              value={formData.description || ""}
              onChange={handleChange("description")}
            />

            {formErrors.apiError && (
              <FormHelperText error>{formErrors.apiError}</FormHelperText>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
