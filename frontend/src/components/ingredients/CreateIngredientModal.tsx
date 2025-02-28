/* frontend/src/components/ingredients/CreateIngredientModal.tsx */

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
  IngredientCategory,
  IngredientCreate,
  MeasurementUnit,
} from "@/types/ingredients";

interface CreateIngredientModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateIngredientModal({
  open,
  onClose,
}: CreateIngredientModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<IngredientCreate>({
    name: "",
    preferred_unit_id: 0,
    category: IngredientCategory.OTHER,
    description: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load Measurement units
  const { data: units, isLoading: isLoadingUnits } = useQuery({
    queryKey: ["units"],
    queryFn: () => measurementService.getAllUnits(),
    enabled: open, // Only fetch when modal is open
  });

  // Group units by category for easier selection
  const unitsByCategory = React.useMemo(() => {
    if (!units) return {};
    return units.reduce((acc: Record<string, MeasurementUnit[]>, unit) => {
      if (!acc[unit.category]) {
        acc[unit.category] = [];
      }
      acc[unit.category].push(unit);
      return acc;
    }, {});
  }, [units]);

  // Create ingredient mutation
  const createMutation = useMutation({
    mutationFn: (data: IngredientCreate) =>
      ingredientService.createIngredient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      handleClose();
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
    (field: keyof IngredientCreate) =>
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

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (formData.preferred_unit_id === 0) {
      errors.preferred_unit_id = "Please select a preferred unit";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      createMutation.mutate(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      preferred_unit_id: 0,
      category: IngredientCategory.OTHER,
      description: "",
    });
    setFormErrors({});
    onClose();
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: "",
        preferred_unit_id: 0,
        category: IngredientCategory.OTHER,
        description: "",
      });
      setFormErrors({});
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add New Ingredient</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Ingredient Name"
              fullWidth
              value={formData.name}
              onChange={handleChange("name")}
              error={!!formErrors.name}
              helperText={formErrors.name}
              required
              autoFocus
            />

            <FormControl fullWidth error={!!formErrors.category}>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
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
                    <CircularProgress size={20} /> Loading units...
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
                          {unit.name} {unit.abbreviation}
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
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Creating..." : "Create Ingredient"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
