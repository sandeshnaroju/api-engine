# APIEngine

A lightweight, protocol-agnostic API client designed to unify REST,
Server-Sent Events (SSE), and WebSockets (WS). It transforms your API
manifest into a strongly-typed, easy-to-use communication layer for
modern web applications.

------------------------------------------------------------------------

## 1. Installation

``` bash
npm install @@sandeshnaroju/api-engine
# or
yarn add @@sandeshnaroju/api-engine
```

------------------------------------------------------------------------

## 2. Configuration (`api.yml`)

Add all your Apis in the api.yml file. The engine is driven by a central manifest. It supports both relative
paths (using `baseUrl`) and absolute URLs (bypassing `baseUrl`).

``` yaml
version: "1.0"
baseUrl: "https://jsonplaceholder.typicode.com"
endpoints:
  get_post:
    protocol: "REST"
    path: "/posts/:id"
    method: "GET"
    timeout: 3000
  create_post:
    protocol: "REST"
    path: "/posts"
    method: "POST"
    timeout: 5000
  ws_test:
    protocol: "WS"
    path: "wss://echo.websocket.org" # Full URL for testing
    autoReconnect: true
  sse_test:
    protocol: "SSE"
    path: "http://localhost:3000/api-proxy/apps/api/v1/chat/completions"
    method: "POST"
    headers:
      "Content-Type": "application/json"
```

## 4. Usage

#### Initializing 

If you place your api.yml file in your project's public folder, the engine can find it automatically without you needing to import or pass anything. This is ideal if you want to update the API configuration without rebuilding your entire React/Vue app.

```javascript
// Looks for /api.yml in your web server's root automatically
const api = await APIEngine.init();
```

This is the most common method in modern development. You keep the api.yml in your src folder or project root and import it. Because bundlers convert these imports into URL strings, init() handles the background fetching for you.

```javascript
import manifestUrl from './api.yml';
// init() detects the URL string and fetches the content
const api = await APIEngine.init(manifestUrl);
```

If you are fetching your configuration from a custom database, a CMS, or even a text-area in your UI, you can pass the raw YAML text directly. The engine will parse it on the fly.

```javascript
const rawYaml = `
baseUrl: https://api.production.com
endpoints:
  get_users:
    protocol: REST
    path: /users
`;

// Works with the static initializer...
const api = await APIEngine.init(rawYaml);

// ...or directly with the constructor
const api = new APIEngine(rawYaml);
```

If you prefer to work with JSON or hardcoded configuration objects, you can skip the YAML parsing entirely. This is the fastest method as it involves no network requests or string parsing.

```javascript
const config = {
  baseUrl: "https://api.production.com",
  endpoints: {
    ping: { protocol: "REST", path: "/health" }
  }
};

// Pass the object directly
const api = new APIEngine(config);
```

You can use the api-engine like below:

#### REST:

```javascript
import manifest from './api.yml';

const api = await APIEngine.init(manifest);

// GET
const todo = await api.call('get_post', { 
  params: { id: 1 } 
});

console.log("Post Title:", todo.title);

//POST
const res = await api.call('create_post', { 
  body: { title: 'New Post', userId: 1 } 
});

```


#### SSE:
```javascript
import manifest from './api.yml';

const api = await APIEngine.init(manifest);

// Normal Usage: Listening to a live log stream
const stream = api.watch('sse_test');

const unsubscribe = stream.subscribe((log) => {
  console.log("New Server Log:", log.message);
});

// Stop listening when leaving the page
// unsubscribe();
```


#### WebSocket:
```javascript
import manifest from './api.yml';

const api = await APIEngine.init(manifest);

// Normal Usage: A real-time chat or command console
const socket = api.watch('ws_test');

// 1. Listen for incoming messages
socket.subscribe((msg) => {
  console.log("Incoming Message:", msg.text);
});

// 2. Send a message back
socket.send({ 
  message: "Hi", 
});

// Close connection when done
// socket.close();
```


------------------------------------------------------------------------

## 4. Options

 `call` and `watch`  methods support below extra options.

|        Property        |Type                          |Description                         |
|----------------|-------------------------------|-----------------------------|
|params|Replaces path variables (e.g., `:id` in `/users/:id`).            |`params: { id: 101 }`          |
|query          |Appends key-value pairs as query strings (e.g., `?limit=10`).            |`query: { limit: 10, page: 1 }`            |
|body          |The request payload (JSON) for POST, PUT, and SSE.|`body: { name: 'Sandesh' }`|
|headers          |Custom HTTP headers (e.g., Auth tokens).|`headers: { 'Authorization': 'Bearer ...' }`|
|timeout          |Maximum time (ms) to wait before the request fails.|`timeout: 5000`|
|signal          |An `AbortSignal` used to manually cancel requests.|`signal: controller.signal`|
|fetchOptions          |Pass-through for raw Axios or Fetch configurations.|`fetchOptions: { withCredentials: true }`|

------------------------------------------------------------------------

## 5. Framework Implementation Examples

### Vanilla HTML / JavaScript

``` html

<script type="module">
  import { APIEngine } from './dist/index.js';
  import manifest from './api.yml';

  const api = await APIEngine.init(manifest);

  const todo = await api.call('get_todo', { params: { id: 1 } });

  const stream = api.watch('live_logs');
  const unsubSSE = stream.subscribe(data => console.log("Log Received:", data));

  const socket = api.watch('field_comms');
  socket.subscribe(msg => console.log("WS Message:", msg));
  socket.send({ type: 'hello' });
</script>

```

------------------------------------------------------------------------

### React (Functional Components)

``` tsx

import { useEffect, useState } from 'react';
import { api } from './api-client';
import manifest from './api.yml';

const api = await APIEngine.init(manifest);

export const Dashboard = ({ sensorId }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const stream = api.watch('live_logs', { params: { id: sensorId } });
    const unsubscribe = stream.subscribe(setData);

    const socket = api.watch('field_comms');
    socket.subscribe(msg => console.log("Real-time WS:", msg));

    return () => {
      unsubscribe();
      socket.close();
    };
  }, [sensorId]);

  return <div>{JSON.stringify(data)}</div>;
};

```

------------------------------------------------------------------------

### Vue 3 (Composition API)

``` html

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { api } from '@/services/api';
import manifest from './api.yml';

const api = await APIEngine.init(manifest);

const messages = ref([]);
let sseUnsub = null;
let socket = null;

onMounted(() => {
  const stream = api.watch('live_logs');
  sseUnsub = stream.subscribe(msg => messages.value.push(msg));

  socket = api.watch('field_comms');
  socket.subscribe(msg => console.log("WS Data:", msg));
});

onUnmounted(() => {
  if (sseUnsub) sseUnsub();
  if (socket) socket.close();
});
</script>

```

------------------------------------------------------------------------

## 6. Core Logic Highlights

### Smart URL Resolution

If a path starts with `http://`, `https://`, `ws://`, or `wss://`, the
`baseUrl` is automatically ignored.

### Path Variable Injection

The internal `buildUrl` utility maps `params` to `:keys` in the URL
string and converts remaining keys into query strings.

### Unified Watcher

Both SSE and WS are accessed via `.watch()`.

-   **SSE (Unidirectional)**
    -   Use `.subscribe()`
    -   Returns an unsubscribe function
-   **WebSocket (Bidirectional)**
    -   Use `.subscribe()`
    -   Use `.send()`
    -   Use `.close()`

### Browser-First

Optimized for browser environments with native `WebSocket` and
`EventSource` support.

### Connection Management

-   Automatic exponential backoff for WebSocket reconnections
-   Clean resource disposal via subscription lifecycle

------------------------------------------------------------------------

## License

Apache License Version 2.0, January 2004
