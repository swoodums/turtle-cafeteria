from fastapi import status

def test_create_direction(client, created_recipe, sample_direction):
    """
    Test creating a direction for an existing recipe
    """
    response = client.post(
        f"/api/v1/direction/recipe/{created_recipe['id']}",
        json = sample_direction
    )

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()

    assert data["instruction"] == sample_direction["instruction"]
    assert data["direction_number"] == sample_direction["direction_number"]
    assert data["recipe_id"] == created_recipe["id"]
    assert "id" in data

def test_duplicate_direction_number(client, created_recipe, sample_direction):
    """
    Test that we can't create two directions with the same direction number for a recipe
    """
    # Create first direction
    response1 = client.post(
        f"/api/v1/direction/recipe/{created_recipe['id']}",
        json=sample_direction
    )
    assert response1.status_code == status.HTTP_201_CREATED

    # Try to create second direction with the same number
    response2 = client.post(
        f"/api/v1/direction/recipe/{created_recipe['id']}",
        json=sample_direction
    )
    assert response2.status_code == status.HTTP_400_BAD_REQUEST
    assert f"Direction number {sample_direction['direction_number']} already exists" in response2.json()["detail"]

def test_create_direction_nonexistent_recipe(client, sample_direction):
    """
    Test attempting to create a direction for a nonexistent recipe
    """
    nonexistent_id = 42069
    response = client.post(
        f"/api/v1/direction/recipe/{nonexistent_id}",
        json=sample_direction
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert f"Recipe with id {nonexistent_id} not found" in response.json()["detail"]

def test_get_direction(client, created_direction):
    """
    Test retrieving a specific direction
    """
    response = client.get(f"/api/v1/direction/{created_direction['id']}")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == created_direction

def test_get_directions_for_recipe(client, created_recipe, created_direction):
    """
    Test retrieving all directions for a recipe
    """
    response = client.get(f"/api/v1/direction/recipe/{created_recipe['id']}")

    assert response.status_code == status.HTTP_200_OK
    directions = response.json()

    assert isinstance(directions, list)
    assert len(directions) >= 1
    assert any(direction["id"] == created_direction["id"] for direction in directions)

def test_update_direction(client, created_direction):
    """
    Test updating a direction
    """
    updated_data = {
        "direction_number": 2,
        "instruction": "Apply liberally"
    }

    response = client.put(
        f"/api/v1/direction/{created_direction['id']}",
        json=updated_data
    )

    assert response.status_code == status.HTTP_200_OK
    updated_direction = response.json()

    assert updated_direction["id"] == created_direction["id"]     # id should be unchanged
    assert updated_direction["instruction"] == updated_data["instruction"]
    assert updated_direction["direction_number"] == updated_data["direction_number"]

def test_delete_direction(client, created_direction):
    """
    Test deleting a direction
    """
    # Delete the direction
    delete_response = client.delete(f"/api/v1/direction/{created_direction['id']}")
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    # Verify the direction no longer exists
    get_response = client.get(f"/api/v1/direction/{created_direction['id']}")
    assert get_response.status_code ==  status.HTTP_404_NOT_FOUND

def test_delete_nonexistent_direction(client):
    """
    Test attempting to delete a nonexistent direction
    """
    nonexistent_id = 42069
    response = client.delete(f"/api/v1/direction/{nonexistent_id}")

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert f"Direction with id {nonexistent_id} not found" in response.json()["detail"]

def test_recipe_cascade_delete(client, created_recipe, created_direction):
    """
    Test that deleting a recipe also deletes its directions.
    This test verifies that our database cascade is working correctly.
    """
    # First verify the direction exists
    direction_response = client.get(f"/api/v1/direction/{created_direction['id']}")
    assert direction_response.status_code == status.HTTP_200_OK

    # Delete the recipe
    recipe_delete_response = client.delete(f"/api/v1/recipe/{created_recipe['id']}")
    assert recipe_delete_response.status_code == status.HTTP_204_NO_CONTENT

    # Verify the direction was also deleted
    direction_response = client.get(f"/api/v1/direction{created_direction['id']}")
    assert direction_response.status_code == status.HTTP_404_NOT_FOUND