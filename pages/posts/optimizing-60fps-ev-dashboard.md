---
title: "Optimizing EV Fleet Dashboards: Sustaining 60 FPS Under Heavy Telemetry Streams"
date: 2026-05-18T10:00:00Z
lang: en
duration: 8min
type: blog
description: "Solving main-thread bottlenecks and frame drops when rendering tens of thousands of real-time EV telemetry markers using Web Workers, OffscreenCanvas, and Zustand transient updates."
---

When managing a nationwide fleet of connected smart electric vehicles, the Fleet Monitoring Dashboard serves as mission control for operations engineers. On a single display, the interface must continuously visualize tens of thousands of vehicles: real-time GPS coordinates overlaid onto satellite maps, battery cell voltage charts (SoC/SoH), motor temperatures, active charging wattage, and critical CAN bus alarms.

When incoming packets from the WebSocket Gateway cluster surge into tens of thousands of payloads per second, the ultimate bottleneck is no longer server compute or network bandwidth—it is the **browser's Main Thread**.

> [!NOTE]
> Architectural metrics and solutions presented here stem from direct production leadership on large-scale fleet telemetry dashboards. Client-identifying information has been omitted under NDA guidelines.

---

## 1. The Performance Bottleneck: Why the Traditional DOM Breaks Down

In standard single-page React applications, state updates follow a predictable lifecycle:

```
WebSocket onmessage ──> setState() ──> Virtual DOM Diffing ──> Re-render ──> Browser Paint
```

At modest update rates (1-2 updates per second), this model works seamlessly. But when 5,000 active vehicles emit telemetry updates every 500ms:

1. **Main Thread Contention (Long Tasks > 100ms):** JSON/Protobuf deserialization and Virtual DOM reconciliations continuously block the main thread. User interactions—such as panning map layers or clicking inspection panels—freeze with noticeable input lag.
2. **Garbage Collection (GC) Thrashing:** Instantiating tens of thousands of transient JavaScript objects every second triggers frequent garbage collection cycles, causing abrupt frame drops from 60 FPS down to 10-15 FPS.
3. **Layout & Style Recalculation Overhead:** Thousands of DOM nodes mutating style attributes simultaneously trigger heavy browser Reflow and Style Recalculation across the entire tree.

---

## 2. Architectural Remedy: Decoupling from the Main Thread

To guarantee a stable 60 FPS refresh rate, we restructured the client-side data pipeline into four decoupled layers:

```
[WebSocket Stream]
        │
        ▼ (Binary Protobuf Packets)
[Dedicated Web Worker] ──> (Decoding, Deduplication & Interpolation)
        │
        ▼ (60Hz requestAnimationFrame Batches)
[Zustand Transient State Store]
        │
        ├──> [Offscreen Canvas / WebGL Map Layer] (Vehicle markers & trail paths)
        └──> [Direct DOM Node Ref Updates] (Live km/h & SoC% without React renders)
```

### Step 1: Offloading Parsing and Computation to a Web Worker

Modern browsers provide multi-threaded execution through Web Workers. We moved all incoming WebSocket connections and stream ingestion logic off the main thread:

* **Binary Protocol Decoding:** Raw telemetry packets are transmitted as compact Protocol Buffers and decoded directly inside the worker thread without touching UI cycles.
* **Dead Reckoning & Motion Interpolation:** Vehicles report coordinates at 1-2 second intervals. The worker computes smooth micro-interpolation vectors between consecutive GPS fixes.
* **Display Refresh Synchronization (Tick Batching):** Instead of posting messages to the main thread on every incoming packet, the worker batches state deltas aligned with the browser's 60Hz display refresh cycle (~16.6ms).

### Step 2: Replacing DOM Elements with Canvas & WebGL for High-Density Maps

Rather than mounting thousands of individual React component nodes for map pins:

* We utilize **HTML5 Canvas / WebGL** to batch-render all vehicle markers and charging vectors. GPU shaders handle coordinate projections and animated pulse rings with virtually zero memory overhead compared to maintaining tens of thousands of `<div>` tags in the DOM.
* We leverage **OffscreenCanvas** so that complex battery telemetry graphs can render directly inside the worker thread, completely freeing the main thread for user interaction.

### Step 3: Direct DOM Updates Bypassing React Re-renders (Transient Updates)

Certain UI readouts—such as speedometer digits (km/h), available battery percentage (SoC %), or charger voltage—update multiple times per second.

Placing these fast-changing fields in React component state triggers full subtree re-renders. Instead, we use **Zustand Transient Subscriptions** with direct DOM element mutations:

```typescript
// Maintain direct reference to the target DOM element
const speedTextRef = useRef<HTMLSpanElement>(null)

useEffect(() => {
  // Subscribe directly to the store WITHOUT triggering React re-renders
  const unsubscribe = useTelemetryStore.subscribe(
    state => state.activeVehicle.speed,
    (newSpeed) => {
      if (speedTextRef.current) {
        speedTextRef.current.textContent = `${newSpeed} km/h`
      }
    }
  )
  return unsubscribe
}, [])
```

By mutating the text node directly, numerical values update instantaneously with negligible CPU cost, skipping Virtual DOM diffing altogether.

---

## 3. Production Benchmark Results

Following this architectural refactor:

* **Frame Rate:** Maintained a consistent 58–60 FPS even when rendering more than 20,000 active vehicles on screen simultaneously.
* **Interaction to Next Paint (INP):** Dropped from 380ms down to **under 120ms**, comfortably reaching the top tier of Google's Core Web Vitals.
* **RAM Allocation:** Reduced client-side memory footprint by over 55% by transferring `ArrayBuffer` objects across thread boundaries rather than cloning nested JavaScript dictionaries.

A responsive, high-performance UI ensures operations engineers can dispatch roadside assistance and coordinate charging infrastructure without interface hesitation when managing fleets on the road.

---

### Related Fleet Telemetry Architecture
* [Real-Time Telemetry Architecture for 100,000+ Connected Electric Vehicles](/posts/telemetry-architecture-100k-evs)
* [Preventing Memory Bloat with Bounded Channels in High-Rate Telemetry](/posts/bounded-channels-telemetry)
