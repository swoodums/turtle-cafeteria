/* frontend/src/components/ingredients/IngredientToolbar.tsx */

"use client";

import React from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  Paper,
} from "@mui/material";
import { Add as AddIcon, Search as SearchIcon } from "@mui/icons-material";
import { IngredientCategory } from "@/types/ingredients";

interface IngredientToolbarProps {
  onCreateClick: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
}

export default function IngredientToolbar({
  onCreateClick,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
}: IngredientToolbarProps) {
  const categories = Object.values(IngredientCategory);

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexGrow: 1,
            maxWidth: { xs: "100%", sm: "70%" },
          }}
        >
          <TextField
            size="small"
            placeholder="Search ingredients..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{ flexGrow: 1 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            select
            size="small"
            label="category"
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category.charAt(0).toUpperCase() +
                  category.slice(1).toLowerCase()}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateClick}
        >
          Add Ingredient
        </Button>
      </Box>
    </Paper>
  );
}
