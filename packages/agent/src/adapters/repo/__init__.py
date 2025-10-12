"""
Repo Adapter: Graph Persistence Implementation

PURPOSE:
--------
Implement RepoPort and FileStorePort using database and storage.

DEPENDENCIES (ALLOWED):
-----------------------
- ports.repo_port (RepoPort interface)
- ports.filestore_port (FileStorePort interface)
- domain types (Node, Edge, ExplorationStats)
- Database driver (psycopg2, SQLAlchemy, etc.)
- Storage SDK (boto3 for S3, google-cloud-storage, etc.)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO other adapters

IMPLEMENTATION:
---------------
- RepoAdapter: Implements RepoPort (Postgres)
- FileStoreAdapter: Implements FileStorePort (S3/GCS/local)
- schema: Database schema for nodes/edges/runs

DATABASE SCHEMA:
----------------
- runs: run_id, app_id, created_at, budgets, final_state
- nodes: signature, app_id, metadata, created_at
- edges: from_signature, to_signature, action, metadata, created_at

FILE STORE:
-----------
- S3/GCS: runs/{run_id}/screenshots/{screen_id}.png
- Local: /tmp/screengraph/{run_id}/...

TODO:
-----
- [ ] Implement RepoAdapter (upsert_node, upsert_edge, etc.)
- [ ] Implement FileStoreAdapter (put, get, delete, etc.)
- [ ] Add connection pooling
- [ ] Add transaction support
"""

