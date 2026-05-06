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
baseUrl: "http://localhost:3000"
endpoints:
  get_post:
    protocol: "REST"
    path: "https://jsonplaceholder.typicode.com/posts/:id"
    method: "GET"
    timeout: 3000
  create_post:
    protocol: "REST"
    path: "https://jsonplaceholder.typicode.com/posts"
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

You can use the api-engine like below:

#### REST:

```javascript
import manifest from './api.yml';

const api = new APIEngine(manifest);

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

const api = new APIEngine(manifest);

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

const api = new APIEngine(manifest);

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

  const api = new APIEngine(manifest);

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
