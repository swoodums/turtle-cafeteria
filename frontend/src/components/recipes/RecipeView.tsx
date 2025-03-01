/* frontend/src/components/recipes/RecipeView.tsx */

"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Switch,
  FormControlLabel,
  styled,
  Divider,
  Card,
  CardContent,
  Stack,
  Chip,
  Alert,
  IconButton,
  Skeleton,
  Fade,
  Collapse,
  Grid2 as Grid,
  useTheme,
  alpha,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
  ArrowBack as ArrowBackIcon,
  Restaurant as RestaurantIcon,
  LocalDining as DiningIcon,
  CheckCircleOutline as CheckIcon,
  EditNote as EditIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import recipeService from "@/services/recipeService";

// Icons for different ingredient categories
import EggIcon from "@mui/icons-material/EggAlt";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import KitchenIcon from "@mui/icons-material/Kitchen";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import EmojiFoodBeverageIcon from "@mui/icons-material/EmojiFoodBeverage";
import BakeryDiningIcon from "@mui/icons-material/BakeryDining";

// Custom styled Switch component for cook mode
const CookModeSwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    transform: "translateX(6px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(22px)",
      "& .MuiSwitch-thumb": {
        backgroundColor: theme.palette.primary.main,
        "&:before": {
          content: "'🔥'",
          fontSize: "16px",
        },
      },
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: alpha(theme.palette.primary.main, 0.5),
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: theme.palette.mode === "dark" ? "#003892" : "#001e3c",
    width: 32,
    height: 32,
    "&:before": {
      content: "'👨‍🍳'",
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  "& .MuiSwitch-track": {
    opacity: 1,
    backgroundColor: theme.palette.mode === "dark" ? "#8796A5" : "#aab4be",
    borderRadius: 20,
  },
}));

// Styled component for the expandable direction step
const ExpandableDirection = styled(Box, {
  shouldForwardProp: (prop) => prop !== "completed" && prop !== "active",
})<{ completed?: boolean; active?: boolean }>(
  ({ theme, completed, active }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${
      completed
        ? theme.palette.success.light
        : active
          ? theme.palette.primary.light
          : theme.palette.divider
    }`,
    backgroundColor: completed
      ? alpha(theme.palette.success.light, 0.05)
      : active
        ? alpha(theme.palette.primary.light, 0.05)
        : theme.palette.background.paper,
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.05),
      transform: "translateY(-2px)",
      boxShadow: theme.shadows[2],
    },
  }),
);

// Get the icon for each ingredient category
const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "produce":
      return <LocalFloristIcon color="success" />;
    case "meat":
      return <RestaurantIcon color="error" />;
    case "dairy":
      return <EggIcon color="warning" />;
    case "grains":
      return <BakeryDiningIcon color="warning" />;
    case "spices":
      return <EmojiFoodBeverageIcon color="info" />;
    case "pantry":
      return <KitchenIcon color="secondary" />;
    default:
      return <SoupKitchenIcon color="action" />;
  }
};

interface RecipeViewProps {
  recipeId: number;
}

export default function RecipeView({ recipeId }: RecipeViewProps) {
  const theme = useTheme();
  const {
    data: recipe,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["recipe", recipeId],
    queryFn: () => recipeService.getRecipeById(recipeId),
  });
  const router = useRouter();
  const [cookMode, setCookMode] = useState(false);
  const [completedIngredients, setCompletedIngredients] = useState<Set<number>>(
    new Set(),
  );
  const [completedDirections, setCompletedDirections] = useState<Set<number>>(
    new Set(),
  );
  const [showConfetti, setShowConfetti] = useState(false);
  // Track expanded steps with a Set
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  // Check if everything is complete whenever ingredients or directions change
  useEffect(() => {
    if (!cookMode || !recipe) return;

    const allIngredientsComplete =
      recipe.recipe_ingredients?.every((ingredient) =>
        completedIngredients.has(ingredient.id),
      ) ?? false;

    const allDirectionsComplete =
      recipe.directions?.every((direction) =>
        completedDirections.has(direction.id),
      ) ?? false;

    // If everything is completed, party time
    if (allIngredientsComplete && allDirectionsComplete) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [completedIngredients, completedDirections, recipe, cookMode]);

  // Group ingredients by category
  const groupedIngredients = React.useMemo(() => {
    if (!recipe?.recipe_ingredients) return {};

    return recipe.recipe_ingredients.reduce(
      (groups, item) => {
        const category = item.ingredient.category || "other";
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(item);
        return groups;
      },
      {} as Record<string, typeof recipe.recipe_ingredients>,
    );
  }, [recipe]);

  // Get the categories in a reasonable order
  const orderedCategories = React.useMemo(() => {
    const categoryOrder = [
      "produce",
      "meat",
      "dairy",
      "grains",
      "spices",
      "pantry",
      "other",
    ];

    if (!recipe?.recipe_ingredients) return [];

    const availableCategories = Object.keys(groupedIngredients);
    return categoryOrder.filter((cat) => availableCategories.includes(cat));
  }, [groupedIngredients, recipe]);

  // Find the first incomplete direction for highlighting
  const sortedDirections = React.useMemo(() => {
    return (
      recipe?.directions?.sort(
        (a, b) => a.direction_number - b.direction_number,
      ) || []
    );
  }, [recipe]);

  const firstIncompleteIndex = sortedDirections.findIndex(
    (direction) => !completedDirections.has(direction.id),
  );

  const toggleIngredient = (id: number) => {
    if (!cookMode) return;
    setCompletedIngredients((prev) => {
      const newSet = new Set(prev);
      if (prev.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleDirection = (id: number, index: number) => {
    if (!cookMode) return;

    setCompletedDirections((prev) => {
      const newSet = new Set(prev);
      if (prev.has(id)) {
        // If unchecking a direction, remove from completed
        newSet.delete(id);
        // Make sure this step is expanded
        setExpandedSteps((prevExpanded) => {
          const newExpanded = new Set(prevExpanded);
          newExpanded.add(index);
          return newExpanded;
        });
      } else {
        // If completing a direction, add to completed
        newSet.add(id);
        // Auto-collapse completed directions
        setExpandedSteps((prevExpanded) => {
          const newExpanded = new Set(prevExpanded);
          newExpanded.delete(index);
          return newExpanded;
        });
      }
      return newSet;
    });
  };

  const resetProgress = () => {
    setCompletedIngredients(new Set());
    setCompletedDirections(new Set());
    setShowConfetti(false);
    // Reset expanded steps to none when exiting cook mode
    setExpandedSteps(new Set());
  };

  // Toggle expanded state for a step
  const toggleExpandStep = (index: number) => {
    setExpandedSteps((prev) => {
      const newSet = new Set(prev);
      if (prev.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Initialize expanded steps when entering cook mode
  useEffect(() => {
    if (cookMode && recipe?.directions) {
      // When cook mode is activated, expand all steps that aren't completed
      const uncompleted = new Set(
        recipe.directions
          .map((_, index) => index)
          .filter(
            (index) => !completedDirections.has(recipe.directions![index].id),
          ),
      );
      setExpandedSteps(uncompleted);
    }
  }, [cookMode, recipe?.directions, completedDirections]);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 1 }} />
          <Skeleton variant="text" width={120} height={40} />
        </Box>

        <Skeleton
          variant="rectangular"
          height={200}
          sx={{ borderRadius: 2, mb: 3 }}
        />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton
              variant="rectangular"
              height={400}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton
              variant="rectangular"
              height={400}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !recipe) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading recipe:{" "}
          {error instanceof Error ? error.message : "Recipe not found"}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/recipes")}
          variant="outlined"
        >
          Back to Recipes
        </Button>
      </Container>
    );
  }

  // Check if all items in a category are completed
  const isCategoryCompleted = (
    categoryItems: typeof recipe.recipe_ingredients,
  ) => {
    return (
      categoryItems?.every((item) => completedIngredients.has(item.id)) ?? false
    );
  };

  // Calculate overall progress
  const totalIngredients = recipe.recipe_ingredients?.length || 0;
  const totalDirections = recipe.directions?.length || 0;
  const completedIngredientsCount = completedIngredients.size;
  const completedDirectionsCount = completedDirections.size;
  const totalProgress = totalIngredients + totalDirections;
  const completedProgress =
    completedIngredientsCount + completedDirectionsCount;
  const progressPercentage =
    totalProgress > 0 ? (completedProgress / totalProgress) * 100 : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Confetti overlay when completed */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={1000}
        />
      )}

      {/* Navigation and action buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/recipes")}
          variant="text"
        >
          Back to Recipes
        </Button>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            startIcon={<EditIcon />}
            onClick={() => router.push(`/recipes/${recipe.id}/edit`)}
            variant="contained"
          >
            Edit Recipe
          </Button>
        </Box>
      </Box>

      {/* Recipe Header Card */}
      <Paper
        elevation={3}
        sx={{
          borderRadius: 3,
          mb: 4,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          sx={{
            height: 12,
            bgcolor: "primary.main",
            width: "100%",
          }}
        />

        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                {recipe.title}
              </Typography>

              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Chip
                  icon={<AccessTimeIcon />}
                  label={`${recipe.cooking_time} mins`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  icon={<PeopleIcon />}
                  label={`Serves ${recipe.servings}`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Box>

            <FormControlLabel
              control={
                <CookModeSwitch
                  checked={cookMode}
                  onChange={(e) => {
                    const newCookMode = e.target.checked;
                    setCookMode(newCookMode);
                    // If cook mode is being turned off, reset progress
                    if (!newCookMode) {
                      resetProgress();
                    }
                  }}
                />
              }
              label={
                <Box
                  component="span"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <Typography variant="body2" sx={{ ml: 1, fontWeight: 600 }}>
                    Cook Mode
                  </Typography>
                </Box>
              }
              sx={{
                "& .MuiFormControlLabel-label": {
                  display: "flex",
                  alignItems: "center",
                },
              }}
            />
          </Box>

          <Typography
            variant="body1"
            sx={{
              mb: 3,
              fontStyle: "italic",
              color: "text.secondary",
            }}
          >
            {recipe.description}
          </Typography>

          {/* Progress bar shown only in cook mode */}
          {cookMode && (
            <Fade in={cookMode}>
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    Progress: {Math.round(progressPercentage)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {completedProgress} of {totalProgress} steps completed
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: "100%",
                    height: 8,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: 1,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: `${progressPercentage}%`,
                      height: "100%",
                      bgcolor: "primary.main",
                      transition: "width 0.3s ease-in-out",
                    }}
                  />
                </Box>
              </Box>
            </Fade>
          )}
        </Box>
      </Paper>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Ingredients Column */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={2} sx={{ height: "100%", borderRadius: 2 }}>
            <CardContent>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <KitchenIcon /> Ingredients
              </Typography>

              <Divider sx={{ mb: 3 }} />

              {orderedCategories.map((category) => (
                <Box key={category} sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    {getCategoryIcon(category)}
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        textTransform: "capitalize",
                        color:
                          cookMode &&
                          isCategoryCompleted(groupedIngredients[category])
                            ? "text.disabled"
                            : "text.primary",
                      }}
                    >
                      {category}
                    </Typography>

                    {cookMode &&
                      isCategoryCompleted(groupedIngredients[category]) && (
                        <CheckIcon fontSize="small" color="success" />
                      )}
                  </Box>

                  <Stack spacing={1} sx={{ pl: 1 }}>
                    {groupedIngredients[category]?.map((ingredient) => (
                      <Box
                        key={ingredient.id}
                        onClick={() => toggleIngredient(ingredient.id)}
                        sx={{
                          // p: 1,
                          borderRadius: 1,
                          cursor: cookMode ? "pointer" : "default",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          transition: "all 0.2s ease",
                          textDecoration: completedIngredients.has(
                            ingredient.id,
                          )
                            ? "line-through"
                            : "none",
                          color: completedIngredients.has(ingredient.id)
                            ? "text.disabled"
                            : "text.primary",
                          bgcolor: cookMode
                            ? alpha(
                                theme.palette.primary.main,
                                completedIngredients.has(ingredient.id)
                                  ? 0.05
                                  : 0,
                              )
                            : "transparent",
                          "&:hover": {
                            bgcolor: cookMode
                              ? alpha(theme.palette.primary.main, 0.1)
                              : "transparent",
                          },
                        }}
                      >
                        <Typography variant="body1">
                          {ingredient.ingredient.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {ingredient.quantity} {ingredient.unit.abbreviation}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Directions Column */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <DiningIcon /> Directions
              </Typography>

              <Divider sx={{ mb: 3 }} />

              {sortedDirections.map((direction, index) => (
                <ExpandableDirection
                  key={direction.id}
                  completed={completedDirections.has(direction.id)}
                  active={index === firstIncompleteIndex && cookMode}
                  onClick={() =>
                    cookMode && toggleDirection(direction.id, index)
                  }
                  sx={{
                    cursor: cookMode ? "pointer" : "default",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={`Step ${direction.direction_number}`}
                        size="small"
                        color={
                          completedDirections.has(direction.id)
                            ? "success"
                            : index === firstIncompleteIndex && cookMode
                              ? "primary"
                              : "default"
                        }
                        variant="filled"
                      />

                      {cookMode && completedDirections.has(direction.id) && (
                        <CheckIcon fontSize="small" color="success" />
                      )}
                    </Box>

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpandStep(index);
                      }}
                      sx={{
                        transform: expandedSteps.has(index)
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                  </Box>

                  <Collapse in={expandedSteps.has(index) || !cookMode}>
                    <Typography
                      variant="body1"
                      sx={{
                        mt: 1,
                        pl: 1,
                        color: completedDirections.has(direction.id)
                          ? "text.disabled"
                          : "text.primary",
                      }}
                    >
                      {direction.instruction}
                    </Typography>
                  </Collapse>
                </ExpandableDirection>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cook Mode completion alert */}
      {cookMode && showConfetti && (
        <Fade in={showConfetti}>
          <Alert
            severity="success"
            variant="filled"
            sx={{
              position: "fixed",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 9999,
              maxWidth: 500,
              borderRadius: 2,
              boxShadow: 6,
            }}
          >
            <Typography variant="h6">Congratulations! 🎉</Typography>
            <Typography variant="body2">
              You&apos;ve completed all the steps for this recipe! Enjoy your
              meal!
            </Typography>
          </Alert>
        </Fade>
      )}
    </Container>
  );
}
