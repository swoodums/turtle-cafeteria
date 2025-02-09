/* frontend/src/components/recipes/RecipeForm.tsx */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Recipe, RecipeFormData } from "@/types/recipes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import recipeService from "@/services/recipeService";

interface RecipeFormProps {
  initialData?: Recipe;
  mode?: "create" | "edit";
}

export default function RecipeForm({
  initialData,
  mode = "create",
}: RecipeFormProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [formData, setFormData] = useState<RecipeFormData>(() => {
    if (initialData) {
      return {
        recipeInfo: {
          id: initialData.id,
          title: initialData.title,
          description: initialData.description,
          cooking_time: initialData.cooking_time,
          servings: initialData.servings,
        },
        recipeIngredients: initialData.recipe_ingredients?.map((ing) => ({
          id: ing.id,
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
        })) || [{ name: "", quantity: 0, unit: "" }],
        directions: initialData.directions?.map((dir) => ({
          id: dir.id,
          direction_number: dir.direction_number,
          instruction: dir.instruction,
        })) || [{ direction_number: 1, instruction: "" }],
      };
    }

    return {
      recipeInfo: {
        title: "",
        description: "",
        cooking_time: 0,
        servings: 1,
      },
      recipeIngredients: [{ name: "", quantity: 0, unit: "" }],
      directions: [{ direction_number: 1, instruction: "" }],
    };
  });

  const recipeMutation = useMutation({
    mutationFn: async (data: RecipeFormData) => {
      if (mode === "edit" && initialData) {
        //Update the recipe
        const recipe = await recipeService.updateRecipe(
          initialData.id,
          data.recipeInfo,
        );

        // Handle directions
        if (initialData.directions) {
          // First, delete all existing directions that are no longer present.
          // Doing this first ensures there's no conflict with direction numbers
          const newDirectionIds = new Set(
            data.directions.map((d) => d.id).filter(Boolean),
          );
          const deletedDirections = initialData.directions.filter(
            (d) => !newDirectionIds.has(d.id),
          );
          await Promise.all(
            deletedDirections.map((dir) =>
              recipeService.deleteDirection(dir.id),
            ),
          );

          // Then handle updates and creates with reindexed direction numbers
          await Promise.all(
            data.directions.map(async (dir, index) => {
              const directionData = {
                direction_number: index + 1,
                instruction: dir.instruction,
              };

              if (dir.id) {
                // If direction has an ID, update it
                await recipeService.updateDirection(dir.id, directionData);
              } else {
                // If no ID, it's a new direction
                await recipeService.createDirection(recipe.id, directionData);
              }
            }),
          );
        }

        // Handle  ingredients
        if (initialData.recipe_ingredients) {
          // Update existing ingredients
          await Promise.all(
            data.recipeIngredients.map(async (ing) => {
              if (ing.id) {
                // If ingredient has an ID, update it
                await recipeService.updateRecipeIngredient(ing.id, {
                  name: ing.name,
                  quantity: ing.quantity,
                  unit: ing.unit,
                });
              } else {
                // If no ID, it's a new ingredient
                await recipeService.createRecipeIngregient(recipe.id, ing);
              }
            }),
          );

          //Delete removed ingredients
          const newIngredientIds = new Set(
            data.recipeIngredients.map((i) => i.id).filter(Boolean),
          );
          const deletedIngredients = initialData.recipe_ingredients.filter(
            (i) => !newIngredientIds.has(i.id),
          );
          await Promise.all(
            deletedIngredients.map((ing) =>
              recipeService.deleteRecipeIngredient(ing.id),
            ),
          );
        } else {
          // No existing directions, create all with sequential numbers
          await Promise.all(
            data.directions.map((dir, index) =>
              recipeService.createDirection(recipe.id, {
                direction_number: index + 1,
                instruction: dir.instruction,
              }),
            ),
          );
        }

        return recipe;
      } else {
        // First create the recipe
        const recipe = await recipeService.createRecipe(data.recipeInfo);

        // Then add recipe ingredients and directions
        await Promise.all([
          // Create all recipe ingredients
          ...data.recipeIngredients.map((recipeIngredient) =>
            recipeService.createRecipeIngregient(recipe.id, {
              name: recipeIngredient.name,
              quantity: recipeIngredient.quantity,
              unit: recipeIngredient.unit,
            }),
          ),
          // Create all directions with sequential numbers
          ...data.directions.map((direction, index) =>
            recipeService.createDirection(recipe.id, {
              direction_number: index + 1,
              instruction: direction.instruction,
            }),
          ),
        ]);

        return recipe;
      }
    },
    onSuccess: async () => {
      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ["recipes"] });

      // If we're editing a specific recipe, also invalidate that specific query
      if (mode === "edit" && initialData) {
        await queryClient.invalidateQueries({
          queryKey: ["recipe", initialData.id],
        });
      }

      // Only navigate after queries are invalidated
      router.push("/recipes");
    },
  });

  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      recipeInfo: {
        ...prev.recipeInfo,
        [name]:
          name === "cooking_time" || name === "servings"
            ? parseInt(value) || 0
            : value,
      },
    }));
  };

  // Handle changes to any ingredient field
  const handleRecipeIngredientChange = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      recipeIngredients: prev.recipeIngredients.map((ingredient, i) =>
        i === index
          ? {
              ...ingredient,
              [field]:
                field === "quantity" ? parseFloat(value as string) || 0 : value,
            }
          : ingredient,
      ),
    }));
  };

  // Add a new empty ingredient to the list
  const handleAddRecipeIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      recipeIngredients: [
        ...prev.recipeIngredients,
        { name: "", quantity: 0, unit: "" },
      ],
    }));
  };

  // Remove an ingredient at the specified index
  const handleRemoveRecipeIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      recipeIngredients: prev.recipeIngredients.filter((_, i) => i !== index),
    }));
  };

  const handleDirectionChange = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      directions: prev.directions.map((direction, i) =>
        i === index
          ? {
              ...direction,
              [field]:
                field === "direction_number"
                  ? parseInt(value as string) || 0
                  : value,
            }
          : direction,
      ),
    }));
  };

  const handleAddDirection = () => {
    setFormData((prev) => ({
      ...prev,
      directions: [
        ...prev.directions,
        { direction_number: prev.directions.length + 1, instruction: "" },
      ],
    }));
  };

  const handleRemoveDirection = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      directions: prev.directions
        .filter((_, i) => i !== index)
        .map((direction, i) => ({
          ...direction,
          direction_number: i + 1,
        })),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recipeMutation.mutate(formData);
  };

  return (
    <Container maxWidth="lg" className="py-8">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent>
            <Stack spacing={4}>
              {/* Basic Recipe Information*/}
              <section>
                <Typography variant="h6" gutterBottom>
                  Recipe Details 📜
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    name="title"
                    label="Recipe Title"
                    value={formData.recipeInfo.title}
                    onChange={handleBasicInfoChange}
                    required
                    fullWidth
                  />
                  <TextField
                    name="description"
                    label="Description"
                    value={formData.recipeInfo.description}
                    onChange={handleBasicInfoChange}
                    multiline
                    rows={3}
                    required
                    fullWidth
                  />
                  <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
                    <TextField
                      name="cooking_time"
                      label="Cooking Time (minutes)"
                      type="number"
                      value={formData.recipeInfo.cooking_time}
                      onChange={handleBasicInfoChange}
                      required
                      slotProps={{ htmlInput: { min: 0 } }}
                    />
                    <TextField
                      name="servings"
                      label="Servings"
                      type="number"
                      value={formData.recipeInfo.servings}
                      onChange={handleBasicInfoChange}
                      required
                      slotProps={{ htmlInput: { min: 1 } }}
                    />
                  </Box>
                </Stack>
              </section>

              {/* Ingredients section*/}
              <section>
                <Box
                  className="flex justify-between items-center mb-4"
                  sx={{ mb: 3 }}
                >
                  <Typography variant="h6">Ingredients 🛒</Typography>
                </Box>

                <Stack spacing={3}>
                  {formData.recipeIngredients.map((ingredient, index) => (
                    <Box
                      key={`ingredient=${index}`}
                      sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: 2,
                          flex: 1,
                        }}
                      >
                        <TextField
                          label="Ingredient Name"
                          value={ingredient.name}
                          onChange={(e) =>
                            handleRecipeIngredientChange(
                              index,
                              "name",
                              e.target.value,
                            )
                          }
                          required
                          fullWidth
                          placeholder="e.g., Brussels Sprouts"
                        />
                        <TextField
                          label="Quantity"
                          type="number"
                          value={ingredient.quantity}
                          onChange={(e) =>
                            handleRecipeIngredientChange(
                              index,
                              "quantity",
                              e.target.value,
                            )
                          }
                          required
                          fullWidth
                        />
                        <TextField
                          label="Unit"
                          value={ingredient.unit}
                          onChange={(e) =>
                            handleRecipeIngredientChange(
                              index,
                              "unit",
                              e.target.value,
                            )
                          }
                          required
                          fullWidth
                          placeholder="e.g., cups, tablespoons, pc"
                        />
                      </Box>
                      <IconButton
                        onClick={() => handleRemoveRecipeIngredient(index)}
                        disabled={formData.recipeIngredients.length === 1}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Box
                    className="flex justify-between items-center mb-4"
                    sx={{ mb: 3 }}
                  >
                    <Button
                      startIcon={<AddIcon />}
                      onClick={handleAddRecipeIngredient}
                      variant="outlined"
                      size="small"
                    >
                      Add Ingredient
                    </Button>
                  </Box>
                </Stack>
              </section>

              {/* Directions section */}
              <section>
                <Box
                  className="flex justify-between items-center mb-4"
                  sx={{ mb: 3 }}
                >
                  <Typography variant="h6">Directions 🪜</Typography>
                </Box>

                <Stack spacing={3}>
                  {formData.directions.map((direction, index) => (
                    <Box
                      key={`direction-${index}`}
                      sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "flex-start",
                      }}
                    >
                      <Box sx={{ width: "100%" }}>
                        <TextField
                          label={`Direction ${direction.direction_number}`}
                          value={direction.instruction}
                          onChange={(e) =>
                            handleDirectionChange(
                              index,
                              "instruction",
                              e.target.value,
                            )
                          }
                          required
                          fullWidth
                          multiline
                          rows={2}
                          placeholder="Enter step instructions"
                        />
                      </Box>
                      <IconButton
                        onClick={() => handleRemoveDirection(index)}
                        disabled={formData.directions.length === 1}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Box
                    className="flex justify-between items-center mb-4"
                    sx={{ mb: 3 }}
                  >
                    <Button
                      startIcon={<AddIcon />}
                      onClick={handleAddDirection}
                      variant="outlined"
                      size="small"
                    >
                      Add Direction
                    </Button>
                  </Box>
                </Stack>
              </section>

              <Box className="flex justify-end gap-2">
                <Button onClick={() => router.back()}>Cancel</Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={recipeMutation.isPending}
                >
                  {mode === "edit" ? "Update Recipe" : "Create Recipe"}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </form>
    </Container>
  );
}
