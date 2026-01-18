import uuid


def unique_email():
    return f"viz_{uuid.uuid4().hex}@example.com"


def login_and_get_cookie(client):
    email = unique_email()
    client.post(
        "/api/v1/auth/register",
        json={"name": "Viz", "surname": "Tester", "email": email, "password": "password123"},
    )
    login = client.post("/api/v1/auth/login", json={"email": email, "password": "password123"})
    assert login.status_code == 200
    return {"email": email}


def test_saved_visualization_crud(client):
    login_and_get_cookie(client)

    payload = [5, 3, 7, 2]
    create = client.post(
        "/api/v1/profile/me/saved-visualizations",
        json={"name": "bst-case", "kind": "bst", "payload": payload},
    )
    assert create.status_code == 201, create.text
    created = create.json()
    assert created["payload"] == payload
    viz_id = created["id"]

    listing = client.get("/api/v1/profile/me/saved-visualizations")
    assert listing.status_code == 200
    assert len(listing.json()) == 1

    get_one = client.get(f"/api/v1/profile/me/saved-visualizations/{viz_id}")
    assert get_one.status_code == 200
    assert get_one.json()["name"] == "bst-case"

    delete = client.delete(f"/api/v1/profile/me/saved-visualizations/{viz_id}")
    assert delete.status_code == 204

    listing_after = client.get("/api/v1/profile/me/saved-visualizations")
    assert listing_after.status_code == 200
    assert listing_after.json() == []


def test_saved_visualization_requires_numeric_payload(client):
    login_and_get_cookie(client)

    bad = client.post(
        "/api/v1/profile/me/saved-visualizations",
        json={"name": "bad", "kind": "stack", "payload": ["a", 2]},
    )
    assert bad.status_code == 400
