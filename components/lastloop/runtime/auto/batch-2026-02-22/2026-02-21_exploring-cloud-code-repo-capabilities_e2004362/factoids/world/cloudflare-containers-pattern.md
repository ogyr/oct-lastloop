# Cloudflare Containers Pattern

## Context
Cloudflare Workers now supports containers via Durable Objects. The cloud-code repo demonstrates this pattern.

## Architecture
```
CF Worker (src/index.ts)
    ↓ forwards requests
Durable Object (AgentContainer)
    ↓ manages lifecycle
Container (Docker)
    └─ opencode web :2633
```

## Key Components

### wrangler.jsonc
```jsonc
{
  "containers": [{
    "name": "cloud-code-container",
    "class_name": "AgentContainer",
    "instance_type": { "vcpu": 1, "memory_mib": 4096 }
  }],
  "durable_objects": {
    "bindings": [{ "class_name": "AgentContainer", "name": "AGENT_CONTAINER" }]
  }
}
```

### Container Class
```typescript
export class AgentContainer extends Container {
  sleepAfter = '10m'
  defaultPort = 2633
  envVars = { ...containerEnv, PORT: '2633' }
}
```

### Singleton Pattern
```typescript
const objectId = env.AGENT_CONTAINER.idFromName('cf-singleton-container')
const container = env.AGENT_CONTAINER.get(objectId)
return container.fetch(request)
```

## SSE Keep-Alive
The container monitors `/global/event` SSE stream. `session.updated` events renew the activity timeout, preventing the container from sleeping while users are active.
