import RecipeView from "@/components/recipes/RecipeView";

interface RecipePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function RecipePage({ params }: RecipePageProps) {
    const resolvedParams = await params;
    const recipeId = parseInt(resolvedParams.id);
    return <RecipeView recipeId={recipeId} />;
}