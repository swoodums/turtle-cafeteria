/* frontend/src/components/ingredients/IngredientTable.tsx */

"use client";

import React, { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Chip,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  TablePagination,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import ingredientService from "@/services/ingredientService";
import measurementService from "@/services/measurementService";
import { Ingredient, IngredientCategory } from "@/types/ingredients";
import EditIngredientModal from "./EditIngredientModal";

interface IngredientTableProps {
  searchQuery: string;
  categoryFilter: string;
}

export default function IngredientTable({
  searchQuery,
  categoryFilter,
}: IngredientTableProps) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null,
  );
  const [deleteIngredientId, setDeleteIngredientId] = useState<number | null>(
    null,
  );

  // Fetch ingredients
  const {
    data: ingredients,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ingredients", searchQuery, categoryFilter, page, rowsPerPage],
    queryFn: () =>
      ingredientService.searchIngredients({
        search: searchQuery || undefined,
        category: (categoryFilter as IngredientCategory) || undefined,
        offset: page * rowsPerPage,
        limit: rowsPerPage,
      }),
  });

  // Fetch measurement units for displaying preferred unit
  const { data: units } = useQuery({
    queryKey: ["units"],
    queryFn: () => measurementService.getAllUnits(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => ingredientService.deleteIngredient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      setDeleteIngredientId(null);
    },
  });

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle edit
  const handleEditClick = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
  };

  // Handle delete
  const handleDeleteClick = (id: number) => {
    setDeleteIngredientId(id);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (deleteIngredientId !== null) {
      deleteMutation.mutate(deleteIngredientId);
    }
  };

  // Get unit name by ID
  const getUnitName = (unitId: number) => {
    const unit = units?.find((u) => u.id === unitId);
    return unit ? `${unit.name} (${unit.abbreviation})` : "Unknown";
  };

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Typography color="error" align="center">
        Error loading ingredients:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </Typography>
    );
  }

  // Empty state
  if (!ingredients || ingredients.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No ingredients found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {searchQuery || categoryFilter
            ? "Try adjusting your search criteria"
            : "Start by adding your first ingredient"}
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              <TableCell>
                <strong>Category</strong>
              </TableCell>
              <TableCell>
                <strong>Preferred Unit</strong>
              </TableCell>
              <TableCell>
                <strong>Description</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ingredients.map((ingredient) => (
              <TableRow key={ingredient.id} hover>
                <TableCell>{ingredient.name}</TableCell>
                <TableCell>
                  <Chip
                    label={
                      ingredient.category.charAt(0).toUpperCase() +
                      ingredient.category.slice(1).toLowerCase()
                    }
                    size="small"
                    color={getCategoryColor(ingredient.category)}
                  />
                </TableCell>
                <TableCell>
                  {getUnitName(ingredient.preferred_unit_id)}
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      maxWidth: 300,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {ingredient.description || "-"}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(ingredient)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(ingredient.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50, 100]}
          component="div"
          count={-1} // We don't know the total count from the API
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Edit Ingredient Modal */}
      {editingIngredient && (
        <EditIngredientModal
          open={!!editingIngredient}
          ingredient={editingIngredient}
          onClose={() => setEditingIngredient(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteIngredientId !== null}
        onClose={() => setDeleteIngredientId(null)}
      >
        <DialogTitle>Reckon you mean to trash this?</DialogTitle>
        <DialogContent>
          You dead set on shakin this here ingredeient? Aint no comin back.
          <br />
          <br />
          <strong>Note:</strong> If this ingredient is used in any recipes,
          deletion will fail.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteIngredientId(null)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// Helper function to get color based on category
function getCategoryColor(category: IngredientCategory) {
  switch (category) {
    case IngredientCategory.PRODUCE:
      return "success";
    case IngredientCategory.MEAT:
      return "error";
    case IngredientCategory.DAIRY:
      return "info";
    case IngredientCategory.GRAINS:
      return "warning";
    case IngredientCategory.SPICES:
      return "secondary";
    case IngredientCategory.PANTRY:
      return "primary";
    default:
      return "default";
  }
}
