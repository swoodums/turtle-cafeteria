export default function RecipeDetailpage({
    params,
} : {
    params: { id:string };
}) {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Recipe Details</h1>
        </div>
    );
}