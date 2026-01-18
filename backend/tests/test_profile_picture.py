import io
import uuid


def unique_email():
    return f"pic_{uuid.uuid4().hex}@example.com"


def make_png_bytes():
    # Minimal 1x1 transparent PNG
    return (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
        b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\x0bIDATx\x9cc``"
        b"\x00\x00\x00\x02\x00\x01\xe2!\xbc3\x00\x00\x00\x00IEND\xaeB`\x82"
    )


def login(client):
    email = unique_email()
    client.post(
        "/api/v1/auth/register",
        json={"name": "Pic", "surname": "User", "email": email, "password": "password123"},
    )
    login = client.post("/api/v1/auth/login", json={"email": email, "password": "password123"})
    assert login.status_code == 200
    return email


def test_profile_picture_upload_and_replace(client, create_db):
    login(client)

    first = client.put(
        "/api/v1/profile/profile-picture",
        files={"file": ("first.png", io.BytesIO(make_png_bytes()), "image/png")},
    )
    assert first.status_code == 200, first.text
    body = first.json()
    assert body.get("profile_picture") or body.get("profile_picture_url")

    # Capture stored path to verify replacement
    first_path = body.get("profile_picture")

    second = client.put(
        "/api/v1/profile/profile-picture",
        files={"file": ("second.png", io.BytesIO(make_png_bytes()), "image/png")},
    )
    assert second.status_code == 200
    body2 = second.json()
    second_path = body2.get("profile_picture")

    assert second_path != first_path
