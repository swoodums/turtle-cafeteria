from fastapi import status

def test_create_recipe_ingredient(client, created_recipe, sample_recipe_ingredient, sample_measurement_unit):
    """
    Test creating a recipe ingredient for an existing recipe
    """
    response = client.post(
        f"/api/v1/recipe_ingredients/recipe/{created_recipe['id']}",
        json = sample_recipe_ingredient
    )

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()

    assert data["ingredient_id"] == sample_recipe_ingredient["ingredient_id"]
    assert data["ingredient"]["name"] == sample_recipe_ingredient["name"]
    assert data["quantity"] == sample_recipe_ingredient["quantity"]
    assert data["unit_id"] == sample_recipe_ingredient["unit_id"]
    assert data["unit"]["name"] ==  sample_recipe_ingredient["unit_name"]
    assert data["recipe_id"] == created_recipe["id"]
    assert "id" in data

def test_create_recipe_ingredients_nonexistent_recipe(client, sample_recipe_ingredient):
    """
    Test attempting to create a recipe ingredient for a nonexistent recipe
    """
    nonexistent_id = 42069
    response = client.post(
        f"/api/v1/recipe_ingredients/recipe/{nonexistent_id}",
        json=sample_recipe_ingredient
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert f"Recipe with id {nonexistent_id} not found" in response.json()["detail"]

def test_get_recipe_ingredient(client, created_recipe_ingredient):
    """
    Test retrieving a specific direction
    """
    response = client.get(f"/api/v1/recipe_ingredients/{created_recipe_ingredient['id']}")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == created_recipe_ingredient

def test_get_recipe_ingredients_for_recipe(client, created_recipe, created_recipe_ingredient):
    """
    Test retrieving all directions for a recipe
    """
    response = client.get(f"/api/v1/recipe_ingredients/recipe/{created_recipe['id']}")

    assert response.status_code == status.HTTP_200_OK
    recipe_ingredients = response.json()

    assert isinstance(recipe_ingredients, list)
    assert len(recipe_ingredients) >= 1
    assert any(recipe_ingredient["id"] == created_recipe_ingredient["id"] for recipe_ingredient in recipe_ingredients)

def test_update_recipe_ingredient(client, created_recipe_ingredient):
    """
    Test updating a recipe ingredient
    """
    updated_data = {
        "ingredient_id": 1,
        "quantity": 3,
        "unit_id": 2
    }

    response = client.put(
        f"/api/v1/recipe_ingredients/{created_recipe_ingredient['id']}",
        json=updated_data
    )

    assert response.status_code == status.HTTP_200_OK
    updated_recipe_ingredient = response.json()

    assert updated_recipe_ingredient["id"] == created_recipe_ingredient["id"]     # id should be unchanged
    assert updated_recipe_ingredient["ingredient"]["id"] == updated_data["ingredient_id"]
    assert updated_recipe_ingredient["quantity"] == updated_data["quantity"]
    assert updated_recipe_ingredient["unit"]["id"] == updated_data["unit_id"]

def test_delete_recipe_ingredient(client, created_recipe_ingredient):
    """
    Test deleting a recipe ingredient
    """
    # Delete the direction
    delete_response = client.delete(f"/api/v1/recipe_ingredients/{created_recipe_ingredient['id']}")
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    # Verify the direction no longer exists
    get_response = client.get(f"/api/v1/recipe_ingredients/{created_recipe_ingredient['id']}")
    assert get_response.status_code ==  status.HTTP_404_NOT_FOUND

def test_delete_nonexistent_direction(client):
    """
    Test attempting to delete a nonexistent direction
    """
    nonexistent_id = 42069
    response = client.delete(f"/api/v1/recipe_ingredients/{nonexistent_id}")

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert f"Recipe Ingredient with id {nonexistent_id} not found" in response.json()["detail"]