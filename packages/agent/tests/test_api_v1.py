"""Tests for API v1 endpoints."""

from fastapi.testclient import TestClient


def test_process_request(client: TestClient) -> None:
    """Test process endpoint handles requests correctly."""
    response = client.post(
        "/api/v1/process",
        json={"message": "test message"},
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["processed"] is True
    assert "test message" in data["result"]

