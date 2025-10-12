"""Tests for health check endpoints."""

from fastapi.testclient import TestClient


def test_health_check(client: TestClient) -> None:
    """Test health check endpoint returns healthy status from bff.main."""
    response = client.get("/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("ok", "healthy")

