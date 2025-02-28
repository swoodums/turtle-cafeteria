/* frontend/src/app/ingredients/page.tsx */

'use client';

import { useState } from 'react';
import { Typography, Box, Container } from '@mui/material';
import IngredientTable from '@/components/ingredients/IngredientTable';
import IngredientToolbar from '@/components/ingredients/IngredientToolbar';
import CreateIngredientModal from '@/components/ingredients/CreateIngredientModal';

export default function IngredientsPage() {
    const [isCreateModelOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');

    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    return(
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4}}>
                <Typography variant="h3" component="h1" gutterBottom>
                    Ingredients
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage your ingredient library.  Create, edit, and organize ingredients for use in your recipes.
                </Typography>
            </Box>

            <IngredientToolbar
                onCreateClick={handleOpenCreateModal}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
            />

            <IngredientTable
                searchQuery={searchQuery}
                categoryFilter={categoryFilter}
            />

            <CreateIngredientModal
                open={isCreateModelOpen}
                onClose={handleCloseCreateModal}
            />
        </Container>
    );
}