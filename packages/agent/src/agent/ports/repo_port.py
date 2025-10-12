"""
RepoPort: Graph Persistence Interface

PURPOSE:
--------
Persist ScreenGraph nodes and edges to a database.
Enables PersistNode to store exploration results.

DEPENDENCIES (ALLOWED):
-----------------------
- abc, typing (stdlib)
- domain types (ScreenSignature, UIAction)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO database drivers (psycopg2, SQLAlchemy, etc.)
- NO ORM imports
- NO SQL strings

METHODS:
--------
- upsert_node(signature, metadata) -> NodeID
- upsert_edge(from_sig, to_sig, action, metadata) -> EdgeID
- get_node(signature) -> Optional[Node]
- get_neighbors(signature) -> List[Node]
- get_exploration_stats(run_id) -> Stats

DATA STRUCTURES:
----------------
- Node: Screen node with signature, metadata, timestamps
- Edge: Transition edge with action, verification, timestamps
- Stats: Coverage, node count, edge count

IDEMPOTENCY:
------------
- upsert operations must be idempotent
- Same signature → same node ID
- Same (from, to, action) → same edge ID

TODO:
-----
- [ ] Add graph queries (BFS, DFS, shortest path)
- [ ] Add subgraph extraction
- [ ] Add versioning/snapshots
"""

from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from dataclasses import dataclass


@dataclass
class Node:
    """A screen node in the ScreenGraph."""
    signature: str  # ScreenSignature.hash
    metadata: Dict[str, Any]
    created_at: str
    updated_at: str


@dataclass
class Edge:
    """A transition edge between screens."""
    from_signature: str
    to_signature: str
    action: str  # serialized UIAction
    metadata: Dict[str, Any]
    created_at: str


@dataclass
class ExplorationStats:
    """Exploration statistics for a run."""
    nodes_total: int
    edges_total: int
    screens_new: int
    coverage_pct: float


class RepoPort(ABC):
    """
    Interface for graph persistence.
    Implemented by adapters/repo.
    """
    
    @abstractmethod
    async def upsert_node(
        self,
        signature: str,
        metadata: Dict[str, Any],
    ) -> str:
        """
        Insert or update a screen node.
        
        Args:
            signature: ScreenSignature.hash.
            metadata: Node attributes (app_id, bundle_ref, etc.).
        
        Returns:
            Node ID (same as signature for determinism).
        
        Raises:
            PersistenceError: If upsert failed.
        """
        pass
    
    @abstractmethod
    async def upsert_edge(
        self,
        from_signature: str,
        to_signature: str,
        action: str,
        metadata: Dict[str, Any],
    ) -> str:
        """
        Insert or update a transition edge.
        
        Args:
            from_signature: Source screen signature.
            to_signature: Target screen signature.
            action: Serialized UIAction.
            metadata: Edge attributes (verification, timing, etc.).
        
        Returns:
            Edge ID.
        
        Raises:
            PersistenceError: If upsert failed.
        """
        pass
    
    @abstractmethod
    async def get_node(self, signature: str) -> Optional[Node]:
        """
        Retrieve node by signature.
        
        Args:
            signature: ScreenSignature.hash.
        
        Returns:
            Node if exists, None otherwise.
        """
        pass
    
    @abstractmethod
    async def get_neighbors(self, signature: str) -> List[Node]:
        """
        Get all nodes reachable from this node.
        
        Args:
            signature: ScreenSignature.hash.
        
        Returns:
            List of neighbor nodes.
        """
        pass
    
    @abstractmethod
    async def get_exploration_stats(self, run_id: str) -> ExplorationStats:
        """
        Get exploration statistics for a run.
        
        Args:
            run_id: Run identifier.
        
        Returns:
            ExplorationStats summary.
        """
        pass

