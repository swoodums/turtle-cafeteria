/* frontend/src/components/schedules/AccordionRecipeList.tsx */

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
  InputAdornment,
  Chip,
  Divider,
  Paper,
  alpha,
  useTheme,
} from "@mui/material";
import {
  ExpandMore,
  AccessTime,
  People,
  Search as SearchIcon,
  RestaurantMenu as RestaurantIcon,
} from "@mui/icons-material";
import recipeService from "@/services/recipeService";
import { Recipe } from "@/types/recipes";

export default function AccordionRecipeList() {
  const theme = useTheme();
  const [searchText, setSearchText] = useState("");
  const [expanded, setExpanded] = useState<string | false>(false);

  const { data: recipes, isLoading } = useQuery({
    queryKey: ["recipes"],
    queryFn: recipeService.getAllRecipes,
  });

  // Filter recipes based on search text only
  const filteredRecipes = React.useMemo(() => {
    if (!recipes) return [];

    let filtered = [...recipes];

    // Apply search filter if text is entered
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchLower) ||
          recipe.description.toLowerCase().includes(searchLower),
      );
    }

    return filtered;
  }, [recipes, searchText]);

  const handleAccordionChange =
    (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    recipe: Recipe,
  ) => {
    e.dataTransfer.setData("application/json", JSON.stringify(recipe));

    // Add dragging class for styling
    if (e.currentTarget.classList) {
      e.currentTarget.classList.add("dragging");
    }

    // Add visual feedback for dragging
    const el = e.currentTarget as HTMLElement;
    el.style.opacity = "0.7";
    el.style.transform = "scale(0.95)";
    el.style.boxShadow = theme.shadows[8];
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    // Remove the dragging class and restore original styles
    if (e.currentTarget.classList) {
      e.currentTarget.classList.remove("dragging");
    }

    const el = e.currentTarget as HTMLElement;
    el.style.opacity = "";
    el.style.transform = "";
    el.style.boxShadow = "";
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Search input */}
      <Box sx={{ p: 2, bgcolor: "background.paper" }}>
        <TextField
          fullWidth
          placeholder="Search recipes..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            sx: { borderRadius: 2 },
          }}
        />
      </Box>

      {/* Recipe count and helper text */}
      <Box
        sx={{
          px: 2,
          py: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {filteredRecipes.length} recipes found
        </Typography>

        <Chip
          label="Drag to Calendar"
          size="small"
          color="primary"
          variant="outlined"
          icon={<RestaurantIcon fontSize="small" />}
          sx={{ height: 24 }}
        />
      </Box>

      {/* Recipe list */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          px: 2,
          pb: 2,
        }}
      >
        {filteredRecipes.length === 0 ? (
          <Paper
            sx={{
              p: 3,
              textAlign: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px dashed ${theme.palette.primary.main}`,
              borderRadius: 2,
            }}
          >
            <RestaurantIcon
              sx={{ fontSize: 40, color: "text.secondary", mb: 1 }}
            />
            <Typography variant="subtitle1" fontWeight={500}>
              No recipes found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search
            </Typography>
          </Paper>
        ) : (
          filteredRecipes.map((recipe) => (
            <Accordion
              key={recipe.id}
              expanded={expanded === `recipe-${recipe.id}`}
              onChange={handleAccordionChange(`recipe-${recipe.id}`)}
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
                borderRadius: 1,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  transform: "translateY(-2px)",
                  boxShadow: 2,
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  borderLeft: "4px solid",
                  borderLeftColor:
                    recipe.cooking_time <= 30
                      ? theme.palette.success.main
                      : theme.palette.primary.main,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    pr: 2,
                  }}
                >
                  <Typography sx={{ flexGrow: 1, fontWeight: 500 }}>
                    {recipe.title}
                  </Typography>

                  {recipe.cooking_time <= 30 && (
                    <Chip
                      label="Quick"
                      size="small"
                      color="success"
                      sx={{ height: 20, fontSize: "0.7rem" }}
                    />
                  )}
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ pb: 2, pt: 0 }}>
                <Divider sx={{ mb: 1.5, mt: -0.5 }} />

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1.5 }}
                >
                  {recipe.description}
                </Typography>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <AccessTime fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {recipe.cooking_time} mins
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <People fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Serves {recipe.servings}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    mt: 2,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    border: "1px dashed",
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="primary"
                    sx={{ fontStyle: "italic" }}
                  >
                    Drag this recipe to add it to your meal plan
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>
    </Box>
  );
}
