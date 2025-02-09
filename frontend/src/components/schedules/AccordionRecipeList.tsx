/* frontend/sr/components/schedule/AccordionRecipeList.tsx */

"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  TextField,
  InputAdornment
} from "@mui/material";
import { ExpandMore, AccessTime, People, Search } from "@mui/icons-material";
import recipeService from "@/services/recipeService";
import { Recipe } from "@/types/recipes/recipe.types";

export default function AccordionRecipeList() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: recipes, isLoading } = useQuery({
    queryKey: ["recipes"],
    queryFn: recipeService.getAllRecipes,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    recipe: Recipe,
  ) => {
    e.dataTransfer.setData("application/json", JSON.stringify(recipe));
    // Dragging class to style the dragged element.  Drag 'em!
    if (e.currentTarget.classList) {
      e.currentTarget.classList.add("dragging");
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    // Remove the dragging class
    if (e.currentTarget.classList) {
      e.currentTarget.classList.remove("dragging");
    }
  };

  // Filter recipes based on search term
  const filteredRecipes = recipes?.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Typography variant="h6" sx={{ p: 2, bgcolor: "background.paper" }}>
        Available Recipes
      </Typography>

      {/* Search Bar */}
      <Box
        sx={{
          px: 2,
          pb: 2
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Whatcha lookin' fer?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }
          }}
        />
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          px: 2,
          pb: 2,
        }}
      >
        {filteredRecipes?.map((recipe) => (
          <Accordion
            key={recipe.id}
            draggable
            onDragStart={(e) => handleDragStart(e, recipe)}
            onDragEnd={handleDragEnd}
            sx={{
              mb: 1,
              "&:before": {
                display: "none",
              },
              boxShadow: 1,
              cursor: "grab",
              "&:active": {
                cursor: "grabbing",
              },
              "&.dragging": {
                opacity: 0.8,
                boxShadow: 3,
              },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>{recipe.title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  mt: 1,
                  color: "text.secondary",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <AccessTime fontSize="small" />
                  <Typography variant="body2">
                    {recipe.cooking_time} mins
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <People fontSize="small" />
                  <Typography variant="body2">
                    Serves {recipe.servings}
                  </Typography>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}
