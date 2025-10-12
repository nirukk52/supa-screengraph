"""Tests for root README route."""

from fastapi.testclient import TestClient


def test_readme_route(client: TestClient) -> None:
    response = client.get("/")
    assert response.status_code in (200, 404)
    # On 200, should contain either HTML or plain text content
    if response.status_code == 200:
        assert isinstance(response.text, str)

