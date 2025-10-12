"""Pytest configuration and fixtures."""

import os
import sys

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client() -> TestClient:
    """Create a test client for the FastAPI app from entrypoint shim."""
    # Ensure src is on sys.path when running tests directly
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    src_path = os.path.join(repo_root, "src")
    if src_path not in sys.path:
        sys.path.insert(0, src_path)

    from agent.main import app  # import after sys.path setup

    return TestClient(app)

