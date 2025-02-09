import RecipeForm from "@/components/recipes/RecipeForm";
import { Container, Typography } from "@mui/material";

export default function NewRecipePage() {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" className="mb-6 mt-8">
        Create New Recipe 🍽️
      </Typography>
      <RecipeForm />
    </Container>
  );
}
