# Mock Development Setup

This guide covers the complete setup for rapid prototyping with mocks while the backend is being developed.

## 🛠️ Tools Installed

### 1. **MSW (Mock Service Worker)**
- Version: Latest
- Purpose: API mocking at the network level
- Works in: Browser, Node.js, Storybook, Tests

### 2. **Storybook**
- Version: 9.x
- Purpose: Component development in isolation
- Addons: Essentials, Interactions, Docs

### 3. **OpenAPI Toolchain**
- `openapi-typescript`: Generate TypeScript types from OpenAPI specs
- `openapi-typescript-helpers`: Helper types for API responses
- `msw-auto-mock`: Auto-generate MSW handlers from OpenAPI
- `dredd`: API contract testing (optional)

---

## 🚀 Quick Start

### 1. Initialize MSW Service Worker
```bash
pnpm --filter @repo/web msw:init
```

### 2. Start Development with Mocks
```bash
# Regular development (no mocks)
pnpm --filter @repo/web dev

# Development with API mocking enabled
pnpm --filter @repo/web dev:mock
```

### 3. Run Storybook
```bash
pnpm --filter @repo/web storybook
```
Opens at http://localhost:6006

### 4. Generate API Types (when backend is ready)
```bash
pnpm --filter @repo/web generate:api-types
```

---

## 📁 File Structure

```
apps/web/
├── mocks/
│   ├── handlers.ts       # MSW request handlers
│   ├── browser.ts        # Browser-side setup
│   ├── server.ts         # Node.js setup (for tests)
│   └── index.ts          # Exports
├── scripts/
│   └── generate-api-types.ts  # OpenAPI → TypeScript
├── types/
│   └── api.d.ts          # Generated API types
├── .storybook/
│   ├── main.ts           # Storybook config
│   └── preview.ts        # Global decorators
└── msw.init.ts           # Runtime MSW initialization
```

---

## 🔧 Usage Examples

### Creating Mock Handlers

**Basic Handler (`mocks/handlers.ts`)**
```typescript
import { http, HttpResponse } from 'msw'

export const handlers = [
  // GET request
  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'John Doe',
      email: 'john@example.com',
    })
  }),

  // POST request
  http.post('/api/users', async ({ request }) => {
    const data = await request.json()
    return HttpResponse.json({ ...data, id: '123' }, { status: 201 })
  }),

  // Error response
  http.get('/api/error', () => {
    return HttpResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }),
]
```

### Creating Storybook Stories

**Component Story (`modules/ui/button.stories.tsx`)**
```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    children: 'Click me',
    variant: 'primary',
  },
}
```

### Using OpenAPI-Generated Types

**After running `pnpm generate:api-types`**
```typescript
import type { paths } from '../types/api'

type UserResponse = paths['/api/users/{id}']['get']['responses']['200']['content']['application/json']

// Fully typed API calls
async function getUser(id: string): Promise<UserResponse> {
  const res = await fetch(`/api/users/${id}`)
  return res.json()
}
```

---

## 🎯 Workflows

### Workflow 1: Frontend-First Development
1. Design component in Figma
2. Build component in Storybook
3. Add mock handlers for required APIs
4. Integrate component into app with mocks
5. Switch to real API when backend is ready

### Workflow 2: Contract-First Development
1. Define OpenAPI schema with backend team
2. Generate TypeScript types: `pnpm generate:api-types`
3. Create MSW handlers matching the schema
4. Build frontend against typed mocks
5. Backend implements to match the contract

### Workflow 3: Component Library
1. Build reusable components in `modules/ui/`
2. Document in Storybook with all variants
3. Test in isolation
4. Export for use across the app

---

## 🧪 Testing with MSW

### Playwright Test with Mocks

```typescript
import { test, expect } from '@playwright/test'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

test.beforeAll(() => server.listen())
test.afterEach(() => server.resetHandlers())
test.afterAll(() => server.close())

test('displays user data', async ({ page }) => {
  // Override handler for this test
  server.use(
    http.get('/api/user', () => {
      return HttpResponse.json({ name: 'Test User' })
    })
  )

  await page.goto('/profile')
  await expect(page.locator('text=Test User')).toBeVisible()
})
```

---

## 🎨 Design-to-Code Tools

### Recommended Workflow
1. **v0.dev** ($20/mo) - Paste Figma screenshot → Get Shadcn/Tailwind code
2. **Figma Dev Mode** ($12/mo) - Better component inspect & code gen
3. **MSW + Storybook** - Build with mocks, no backend needed

### Figma → Code Flow
```
Figma Design
    ↓
v0.dev or Figma Plugin
    ↓
Generated Component Code
    ↓
Refactor to match our patterns
    ↓
Create Storybook story
    ↓
Add to component library
```

---

## 📚 Scripts Reference

| Command | Description |
|---------|-------------|
| `pnpm dev` | Normal development |
| `pnpm dev:mock` | Development with API mocking |
| `pnpm storybook` | Launch Storybook |
| `pnpm build-storybook` | Build static Storybook |
| `pnpm generate:api-types` | Generate types from OpenAPI |
| `pnpm msw:init` | Initialize MSW service worker |

---

## 💡 Tips & Best Practices

### 1. **Organize Mock Data**
Create a `mocks/data/` folder for reusable mock data:
```typescript
// mocks/data/users.ts
export const mockUsers = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
]
```

### 2. **Realistic Delays**
Add delays to simulate real API latency:
```typescript
http.get('/api/users', async () => {
  await delay(500) // 500ms delay
  return HttpResponse.json(mockUsers)
})
```

### 3. **Error States**
Create stories for error states:
```typescript
export const Error: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/data', () => {
          return HttpResponse.json({ error: 'Failed' }, { status: 500 })
        }),
      ],
    },
  },
}
```

### 4. **Component Composition**
Build small, composable components:
- Max 50 lines per function
- Single responsibility
- Props for all variations

### 5. **Type Safety**
Always use generated types from OpenAPI:
- No `any` types
- Validate at boundaries
- Use Zod for runtime validation

---

## 🔗 Resources

- [MSW Documentation](https://mswjs.io/)
- [Storybook Next.js Guide](https://storybook.js.org/docs/get-started/nextjs)
- [openapi-typescript](https://github.com/drwpow/openapi-typescript)
- [Shadcn UI](https://ui.shadcn.com/)
- [v0.dev](https://v0.dev/)

---

## 🐛 Troubleshooting

### MSW not intercepting requests
1. Make sure you ran `pnpm msw:init`
2. Check `NEXT_PUBLIC_API_MOCKING=true` is set
3. Verify `public/mockServiceWorker.js` exists

### Storybook not loading styles
1. Verify `import '../globals.css'` in `.storybook/preview.ts`
2. Check Tailwind config includes Storybook paths

### Type generation fails
1. Ensure API server is running
2. Or provide local OpenAPI schema file
3. Check OpenAPI spec is valid JSON

---

**Happy prototyping! 🚀**

