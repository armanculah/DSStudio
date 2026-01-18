import uuid


def unique_email():
    return f"user_{uuid.uuid4().hex}@example.com"


def test_auth_cookie_flow(client):
    email = unique_email()
    # register
    reg = client.post(
        "/api/v1/auth/register",
        json={"name": "Test", "surname": "User", "email": email, "password": "password123"},
    )
    assert reg.status_code == 201

    # login
    login = client.post("/api/v1/auth/login", json={"email": email, "password": "password123"})
    assert login.status_code == 200
    assert any("access_token" in c for c in login.headers.getlist("set-cookie"))

    # me
    me = client.get("/api/v1/auth/me")
    assert me.status_code == 200
    body = me.json()
    assert body["email"] == email

    # logout clears access
    out = client.post("/api/v1/auth/logout")
    assert out.status_code == 200
    me2 = client.get("/api/v1/auth/me")
    assert me2.status_code == 401
