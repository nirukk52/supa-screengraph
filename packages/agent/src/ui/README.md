# UI Placeholder

This directory is reserved for a future admin web interface.

## Future Features

- Session management dashboard
- Real-time iteration monitoring
- ScreenGraph visualization
- Budget/cost tracking
- Manual intervention controls

## Technology Stack (Planned)

- React or Next.js
- Graph visualization (React Flow, Cytoscape)
- WebSocket for real-time updates
- Tailwind CSS

## API Integration

The UI will consume the BFF REST API:

- `POST /sessions` - Create new session
- `POST /sessions/{id}/iterate` - Trigger iteration
- `GET /sessions/{id}/summary` - Get summary
- `WS /sessions/{id}/stream` - Real-time updates (future)
