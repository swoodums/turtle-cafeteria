from fastapi import status

def test_create_recipe(client, sample_recipe):
    """
    Test creating a recipe.
    We use sample_recipe fixture.
    """
    response = client.post("/api/v1/recipe/", json=sample_recipe)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == sample_recipe["title"]
    assert data["description"] == sample_recipe["description"]
    assert data["steps"] == sample_recipe["steps"]
    assert data["cooking_time"] == sample_recipe["cooking_time"]
    assert data["servings"] == sample_recipe["servings"]
    assert "id" in data

def test_get_recipe_by_id(client, created_recipe):
    response = client.get(f"/api/v1/recipe/{created_recipe['id']}")
    assert response.status_code == 200
    assert response.json() == created_recipe

def test_get_recipes(client, created_recipe):
    """
    Test retrieving all recipes.
    We use the created_recipe fixture to ensure there's at least one recipe in the database.
    This gives us a known state to test against.
    """
    # Make the GET request to retrieve all recipes
    response = client.get("/api/v1/recipe/")
    
    # Verify the response
    assert response.status_code == status.HTTP_200_OK
    recipes = response.json()
    
    # Check that we got a list and it contains our created recipe
    assert isinstance(recipes, list)
    assert len(recipes) >= 1
    assert any(recipe["id"] == created_recipe["id"] for recipe in recipes)
    
    # Verify the content of our known recipe
    matching_recipe = next(r for r in recipes if r["id"] == created_recipe["id"])
    assert matching_recipe["title"] == created_recipe["title"]
    assert matching_recipe["description"] == created_recipe["description"]

def test_get_nonexistent_recipe(client):
    """
    Test attempting to retrieve a recipe with an ID that doesn't exist.
    We use a very large ID to ensure it won't exist in our test database.
    """
    nonexistent_id = 99999
    response = client.get(f"/api/v1/recipe/{nonexistent_id}")
    
    # Verify we get a 404 response
    assert response.status_code == status.HTTP_404_NOT_FOUND
    
    # Verify the error message
    error_detail = response.json()["detail"]
    assert f"Recipe with id {nonexistent_id} not found" in error_detail

def test_update_recipe(client, created_recipe):
    """
    Test updating an existing recipe.
    We use the created_recipe fixture to ensure we have a recipe to update.
    """
    # Prepare updated data
    updated_data = {
        "title": "Updated Recipe Title",
        "description": "Updated description",
        "ingredients": "Updated ingredients list",
        "steps": "Updated cooking steps",
        "cooking_time": 45,
        "servings": 6
    }
    
    # Send update request
    response = client.put(
        f"/api/v1/recipe/{created_recipe['id']}", 
        json=updated_data
    )
    
    # Verify the response
    assert response.status_code == status.HTTP_200_OK
    updated_recipe = response.json()
    
    # Check that all fields were updated correctly
    assert updated_recipe["id"] == created_recipe["id"]  # ID should not change
    assert updated_recipe["title"] == updated_data["title"]
    assert updated_recipe["description"] == updated_data["description"]
    assert updated_recipe["cooking_time"] == updated_data["cooking_time"]
    assert updated_recipe["servings"] == updated_data["servings"]

def test_partial_update_recipe(client, created_recipe):
    """
    Test updating only specific fields of a recipe.
    Verifies that non-updated fields retain their original values.
    """
    # Prepare partial update data
    partial_update = {
        "title": "Updated Title",
        "cooking_time": 45
    }
    
    # Send partial update request
    response = client.put(
        f"/api/v1/recipe/{created_recipe['id']}", 
        json=partial_update
    )
    
    # Verify the response
    assert response.status_code == status.HTTP_200_OK
    updated_recipe = response.json()
    
    # Check that specified fields were updated
    assert updated_recipe["title"] == partial_update["title"]
    assert updated_recipe["cooking_time"] == partial_update["cooking_time"]
    
    # Check that other fields retained their original values
    assert updated_recipe["description"] == created_recipe["description"]
    assert updated_recipe["ingredients"] == created_recipe["ingredients"]
    assert updated_recipe["steps"] == created_recipe["steps"]
    assert updated_recipe["servings"] == created_recipe["servings"]

def test_update_nonexistent_recipe(client, sample_recipe):
    """
    Test attempting to update a recipe that doesn't exist.
    We use sample_recipe fixture for the update data, but with a nonexistent ID.
    """
    nonexistent_id = 99999
    
    response = client.put(
        f"/api/v1/recipe/{nonexistent_id}", 
        json=sample_recipe
    )
    
    # Verify we get a 404 response
    assert response.status_code == status.HTTP_404_NOT_FOUND
    
    # Verify the error message
    error_detail = response.json()["detail"]
    assert f"Recipe with id {nonexistent_id} not found" in error_detail

def test_delete_recipe(client, created_recipe):
    """
    Test deleting an existing recipe.
    We use created_recipe fixture to ensure we have a recipe to delete.
    Then we verify it's gone by trying to retrieve it.
    """
    # Delete the recipe
    delete_response = client.delete(f"/api/v1/recipe/{created_recipe['id']}")
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify the recipe no longer exists
    get_response = client.get(f"/api/v1/recipe/{created_recipe['id']}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND

def test_delete_nonexistent_recipe(client):
    """
    Test attempting to delete a recipe that doesn't exist.
    """
    nonexistent_id = 99999
    response = client.delete(f"/api/v1/recipe/{nonexistent_id}")
    
    # Verify we get a 404 response
    assert response.status_code == status.HTTP_404_NOT_FOUND
    
    # Verify the error message
    error_detail = response.json()["detail"]
    assert f"Recipe with id {nonexistent_id} not found" in error_detail