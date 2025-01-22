from fastapi import status

def test_create_step(client, created_recipe, sample_step):
    """
    Test creating a step for an existing recipe
    """
    response = client.post(
        f"/api/v1/step/recipe/{created_recipe['id']}",
        json = sample_step
    )

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()

    assert data["instruction"] == sample_step["instruction"]
    assert data["step_number"] == sample_step["step_number"]
    assert data["recipe_id"] == created_recipe["id"]
    assert "id" in data

def test_create_step_nonexistent_recipe(client, sample_step):
    """
    Test attempting to create a step for a nonexistent recipe
    """
    nonexistent_id = 42069
    response = client.post(
        f"/api/v1/step/recipe/{nonexistent_id}",
        json=sample_step
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert f"Recipe with id {nonexistent_id} not found" in response.json()["detail"]

def test_get_step(client, created_step):
    """
    Test retrieving a specific step
    """
    response = client.get(f"/api/v1/step/{created_step['id']}")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == created_step

def test_get_steps_for_recipe(client, created_recipe, created_step):
    """
    Test retrieving all steps for a recipe
    """
    response = client.get(f"/api/v1/step/recipe/{created_recipe['id']}")

    assert response.status_code == status.HTTP_200_OK
    steps = response.json()

    assert isinstance(steps, list)
    assert len(steps) >= 1
    assert any(step["id"] == created_step["id"] for step in steps)

def test_update_step(client, created_step):
    """
    Test updating a step
    """
    updated_data = {
        "step_number": 2,
        "instruction": "Apply liberally"
    }

    response = client.put(
        f"/api/v1/step/{created_step['id']}",
        json=updated_data
    )

    assert response.status_code == status.HTTP_200_OK
    updated_step = response.json()

    assert updated_step["id"] == created_step["id"]     # id should be unchanged
    assert updated_step["instruction"] == updated_data["instruction"]
    assert updated_step["step_number"] == updated_data["step_number"]

def test_delete_step(client, created_step):
    """
    Test deleting a step
    """
    # Delete the step
    delete_response = client.delete(f"/api/v1/step/{created_step['id']}")
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    # Verify the step no longer exists
    get_response = client.get(f"/api/v1/step/{created_step['id']}")
    assert get_response.status_code ==  status.HTTP_404_NOT_FOUND

def test_delete_nonexistent_step(client):
    """
    Test attempting to delete a nonexistent step
    """
    nonexistent_id = 42069
    response = client.delete(f"/api/v1/step/{nonexistent_id}")

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert f"Step with id {nonexistent_id} not found" in response.json()["detail"]

def test_recipe_cascade_delete(client, created_recipe, created_step):
    """
    Test that deleting a recipe also deletes its steps.
    This test verifies that our database cascade is working correctly.
    """
    # First verify the step exists
    step_response = client.get(f"/api/v1/step/{created_step['id']}")
    assert step_response.status_code == status.HTTP_200_OK

    # Delete the recipe
    recipe_delete_response = client.delete(f"/api/v1/recipe/{created_recipe['id']}")
    assert recipe_delete_response.status_code == status.HTTP_204_NO_CONTENT

    # Verify the step was also deleted
    step_response = client.get(f"/api/v1/step{created_step['id']}")
    assert step_response.status_code == status.HTTP_404_NOT_FOUND