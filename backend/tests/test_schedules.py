from fastapi import status

def test_create_schedule(client, created_recipe, sample_schedule):
    """
    Test creating a schedule for an existing recipe
    """
    response = client.post(
        f"/api/v1/schedule/recipe/{created_recipe['id']}",
        json = sample_schedule
    )

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()

    assert data["start_date"] == sample_schedule["start_date"]
    assert data["end_date"] == sample_schedule["end_date"]
    assert data["notes"] == sample_schedule["notes"]
    assert data["recipe_id"] == created_recipe["id"]
    assert "id" in data

def test_create_schedule_nonexistent_recipe(client, sample_schedule):
    """
    Test attempting to create a schedule for a nonexistent recipe
    """
    nonexistent_id = 42069
    response = client.post(
        f"/api/v1/schedule/recipe/{nonexistent_id}",
        json=sample_schedule
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert f"Recipe with id {nonexistent_id} not found" in response.json()["detail"]

def test_get_schedule(client, created_schedule):
    """
    Test retrieving a specific schedule
    """
    response = client.get(f"/api/v1/schedule/{created_schedule['id']}")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == created_schedule

def test_update_schedule(client, created_schedule):
    """
    Test updating a schedule
    """
    updated_data = {
        "start_date": "2024-02-03",
        "end_date": "2024-03-02",
        "notes": "An even cooler date"
    }

    response = client.put(
        f"/api/v1/schedule/{created_schedule['id']}",
        json=updated_data
    )

    assert response.status_code == status.HTTP_200_OK
    updated_schedule = response.json()

    assert updated_schedule["id"] == created_schedule["id"]     # id should be unchanged
    assert updated_schedule["start_date"] == updated_data["start_date"]
    assert updated_schedule["end_date"] == updated_data["end_date"]
    assert updated_schedule["notes"] == updated_data["notes"]

def test_delete_schedule(client, created_schedule):
    """
    Test deleting a schedule
    """
    # Delete the schedule
    delete_response = client.delete(f"/api/v1/schedule/{created_schedule['id']}")
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    # Verify the direction no longer exists
    get_response = client.get(f"/api/v1/schedule/{created_schedule['id']}")
    assert get_response.status_code ==  status.HTTP_404_NOT_FOUND

def test_delete_nonexistent_schedule(client):
    """
    Test attempting to delete a nonexistent schedule
    """
    nonexistent_id = 42069
    response = client.delete(f"/api/v1/schedule/{nonexistent_id}")

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert f"Schedule with id {nonexistent_id} not found" in response.json()["detail"]

def test_recipe_cascade_delete(client, created_recipe, created_schedule):
    """
    Test that deleting a recipe also deletes its schedules.
    This test verifies that our database cascade is working correctly.
    """
    # First verify the schedule exists
    schedule_response = client.get(f"/api/v1/schedule/{created_schedule['id']}")
    assert schedule_response.status_code == status.HTTP_200_OK

    # Delete the recipe
    recipe_delete_response = client.delete(f"/api/v1/recipe/{created_recipe['id']}")
    assert recipe_delete_response.status_code == status.HTTP_204_NO_CONTENT

    # Verify the schedule was also deleted
    schedule_response = client.get(f"/api/v1/schedule{created_schedule['id']}")
    assert schedule_response.status_code == status.HTTP_404_NOT_FOUND

def test_get_schedules_by_date_range(client, created_recipe):
    """
    Test getting schedules within a date rnage.
    Created multiple schedules and verified correct ones are returned based on date range.
    """
    # Create multiple schedules with different date ranges
    schedules = []

    # Schedule entirely within range
    middle_schedule = client.post(
        f"/api/v1/schedule/recipe/{created_recipe['id']}",
        json={
            "start_date": "2025-01-10",
            "end_date": "2025-01-15",
            "notes": "middle schedule"
        }
    ).json()
    schedules.append(middle_schedule)
    print(f"Schedules list: {schedules}")

    # Schedule overlapping start of range
    start_overlap = client.post(
        f"/api/v1/schedule/recipe/{created_recipe['id']}",
        json={
            "start_date": "2025-01-05",
            "end_date": "2025-01-12",
            "notes": "start overlap"
        }
    ).json()
    schedules.append(start_overlap)
    print(f"Schedules list: {schedules}")

    # Schedule overlapping end of range
    end_overlap = client.post(
        f"/api/v1/schedule/recipe/{created_recipe['id']}",
        json={
            "start_date": "2025-01-14",
            "end_date": "2025-01-20",
            "notes": "start overlap"
        }
    ).json()
    schedules.append(end_overlap)
    print(f"Schedules list: {schedules}")

    # Schedule before range
    before_range = client.post(
        f"/api/v1/schedule/recipe/{created_recipe['id']}",
        json={
            "start_date": "2025-01-01",
            "end_date": "2025-01-05",
            "notes": "before range"
        }
    ).json()
    schedules.append(before_range)
    print(f"Schedules list: {schedules}")

    # Schedule after range
    after_range = client.post(
        f"/api/v1/schedule/recipe/{created_recipe['id']}",
        json={
            "start_date": "2025-01-20",
            "end_date": "2025-01-25",
            "notes": "after range"
        }
    ).json()
    schedules.append(after_range)
    print(f"Schedules list: {schedules}")


    query_start = "2025-01-08"
    query_end = "2025-01-18"
    # Query for schedules between Jan 8 - 18
    response = client.get(
        "/api/v1/schedule/range/",
        params={
            "start_date": query_start,
            "end_date": query_end
        }
    )
    print(f"Response: {response}")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()

    # Shoudl return schedules that overlap with the query range
    expected_schedules = [
        schedule for schedule in schedules
        if schedule["start_date"] <= query_end and schedule["end_date"] >= query_start
    ]

    # Should return 3 schedules
    assert len(data) == len(expected_schedules)

    # Verify the correct schedules are returned by checking their ids
    returned_ids = {schedule["id"] for schedule in data}
    expected_ids = {schedule["id"] for schedule in expected_schedules}
    assert returned_ids == expected_ids

def test_get_schedules_invalid_date_range(client):
    """
    Test getting schedules with end_date before start_date
    Should return an empty list rather than an error.
    """
    response = client.get(
        "/api/v1/schedule/range/",
        params={
            "start_date": "2025-01-15",
            "end_date": "2025-01-10"
        }
    )

    # Should still return 200 but with empty list
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []

def test_get_schedules_invalid_date_format(client):
    """
    Test getting schedules with invalid date format.
    Should return 422 Unprocessable Entity.
    """
    response = client.get(
        "/api/v1/schedule/range/",
        params={
            "start_date": "2025-13-45",
            "end_date": "2025-01-01"
        }
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_get_schedules_missing_parameters(client):
    """
    Test getting schedules with missing required parameters.
    Should return 422 Unprocessable Entity
    """
    # Missing end_date
    response = client.get(
        "/api/v1/schedule/range/",
        params={
            "start_date": "2025-01-01"
        }
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # Missing both parameters
    response = client.get("/api/v1/schedule/range/")

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY