/* frontend/src/components/RecipeList.tsx */

"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import recipeService from "@/services/recipeService";
import {
  Box,
  Button,
  Chip,
  Container,
  Fade,
  Grid2 as Grid,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  Tabs,
  Tab,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  AccessTime as AccessTimeIcon,
  RestaurantMenu as RestaurantMenuIcon,
  LocalDining as LocalDiningIcon,
} from "@mui/icons-material";
import RecipeCard from "./RecipeCard";
import { useRouter } from "next/navigation";

// Recipe categories for filtering
const CATEGORIES = ["All", "Breakfast", "Lunch",  "Dinner"];

export default function RecipeList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortOption, setSortOption] = useState("newest");
  const router = useRouter();

  const {
    data: recipes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["recipes"],
    queryFn: recipeService.getAllRecipes,
  });

  // Filter recipes based on search and category
  const filteredRecipes = React.useMemo(() => {
    if (!recipes) return [];

    return recipes
      .filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .sort((a, b) => {
        if (sortOption === "time") {
          return a.cooking_time - b.cooking_time;
        } else if (sortOption === "servings") {
          return b.servings - a.servings;
        }
        // Default: sort by newest (id)
        return b.id - a.id;
      });
  }, [recipes, searchQuery, sortOption]);

  // Handle category change
  const handleCategoryChange = (_: React.SyntheticEvent, newValue: string) => {
    setActiveCategory(newValue);
  };

  // Navigate to new recipe page
  const handleCreateRecipe = () => {
    router.push('/recipes/new');
  };

  // Render loading skeletons
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            position: "relative",
            mb: 6,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Skeleton variant="text" width={200} height={60} />
          <Skeleton variant="rectangular" width={150} height={40} />
        </Box>

        <Skeleton
          variant="rectangular"
          width="100%"
          height={60}
          sx={{ mb: 4 }}
        />

        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton
                variant="rectangular"
                height={240}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          sx={{ p: 3, bgcolor: "error.light", color: "error.contrastText" }}
        >
          <Typography variant="h6">Error loading recipes</Typography>
          <Typography>
            {error instanceof Error ? error.message : "Unknown error"}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with title and action button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 600 }}>
            Recipes
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {filteredRecipes.length} recipes in your collection
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateRecipe}
          size="large"
          sx={{
            borderRadius: 2,
            px: 3,
          }}
        >
          New Recipe
        </Button>
      </Box>

      {/* Search and filters section */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 4,
          borderRadius: 2,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search recipes by name or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }
            }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Tabs
            value={activeCategory}
            onChange={handleCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ ".MuiTabs-indicator": { borderRadius: 1 } }}
          >
            {CATEGORIES.map((category) => (
              <Tab key={category} label={category} value={category} />
            ))}
          </Tabs>

          <Stack direction="row" spacing={1}>
            <Chip
              icon={<AccessTimeIcon />}
              label="Cooking Time"
              clickable
              color={sortOption === "time" ? "primary" : "default"}
              onClick={() => setSortOption(sortOption === "time" ? "newest" : "time")}
            />
            <Chip
              icon={<LocalDiningIcon />}
              label="Servings"
              clickable
              color={sortOption === "servings" ? "primary" : "default"}
              onClick={() => setSortOption(sortOption === "servings" ? "newest" : "servings")}
            />
          </Stack>
        </Box>
      </Paper>

      {/* Recipe grid */}
      {filteredRecipes.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center", borderRadius: 2 }}>
          <RestaurantMenuIcon
            sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h5" gutterBottom>
            No recipes found
          </Typography>
          <Typography color="text.secondary" paragraph>
            Try adjusting your search or filters, or add a new recipe to get
            started.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateRecipe}
            sx={{ mt: 2 }}
          >
            Create New Recipe
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredRecipes.map((recipe, index) => (
            <Fade
              in={true}
              style={{ transitionDelay: `${index * 50}ms` }}
              key={recipe.id}
            >
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RecipeCard
                  recipe={recipe}
                />
              </Grid>
            </Fade>
          ))}
        </Grid>
      )}
    </Container>
  );
}
