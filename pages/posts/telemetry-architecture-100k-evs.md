---
title: Real-Time Telemetry Architecture for 100,000+ Connected Electric Vehicles
date: 2026-03-15T09:00:00Z
lang: en
duration: 7min
type: blog
description: Lessons from designing a high-throughput EV streaming pipeline with Kafka, WebSocket clusters, and backpressure mitigation at CMC Global.
---

When the number of connected smart vehicles scales from a few thousand to over 100,000 electric vehicles, the engineering challenge ceases to be simply "saving data to a database." Every second, hundreds of thousands of state-of-charge (SoC) telemetry packets, GPS coordinates, CAN bus fault codes, and motor temperatures flood into the servers 24/7.

In this article, I share field-tested architectural lessons from leading engineering teams building high-throughput, low-latency telemetry infrastructure.

> [!NOTE]
> Brand names, proprietary schemas, and client-sensitive identifiers have been omitted to comply with Non-Disclosure Agreements (NDAs). The focus remains on distributed systems design patterns.

---

## 1. The Core Challenge: I/O Storms and Backpressure

Electric vehicles driving through tunnels or cellular dead zones cache telemetry frames in onboard memory. The moment 4G/5G connectivity resumes, the accumulated backlog drains into the server cluster in an instantaneous burst:

```
[100,000+ Smart EVs] ──(MQTT / WSS)──> [Ingestion Gateway Cluster]
                                                │
                                                ▼ (Burst Buffer)
                                         [Apache Kafka Topic]
                                                │
                          ┌─────────────────────┴─────────────────────┐
                          ▼                                           ▼
            [Real-Time Anomaly Streamer]                [Time-Series Hot Storage]
```

If the ingestion gateway attempts synchronous writes to a relational database, the system will collapse almost immediately under connection pool exhaustion and disk write saturation.

---

## 2. Decoupled Processing: Hot vs Cold Path

To guarantee sub-50ms latency for end-user mobile apps (e.g. locating a vehicle or viewing live battery charging) while maintaining a complete historical audit trail for machine learning and fleet analytics:

1. **Hot Path (Real-Time Streaming):**
   * Telemetry packets flow directly through **Apache Kafka** partitioned by vehicle UUID, with in-memory deduplication and aggregation.
   * Filtered streams are broadcast directly to fleet monitoring dashboards and companion mobile apps via a distributed **WebSocket Cluster** with automated heartbeats.
2. **Cold Path (Historical Analytics):**
   * High-volume sensor metrics are micro-batched into **TimescaleDB / ClickHouse** on a 10-second interval.
   * This cuts individual database `INSERT` operations by more than 90%, preserving I/O bandwidth for analytical aggregations.

---

## 3. WebSocket Channel Management and Safe Drop Policies

When fleet operators monitor thousands of vehicles concurrently, maintaining WebSocket connections without memory bloat requires disciplined flow control:

* We leverage **bounded circular broadcast channels** (see deep dive: [Preventing Memory Bloat with Bounded Channels](/posts/bounded-channels-telemetry)) with fixed capacity per consumer.
* When a slow consumer client (such as an operator on unstable cellular data) falls behind the queue threshold, the system proactively drops non-critical intermediate frames (such as micro GPS jitter) rather than buffering them indefinitely and ballooning server memory into an Out-Of-Memory (OOM) crash.

This architecture has maintained 99.9% uptime across national holiday travel spikes, when active vehicles on the road reach historic records.

---

### Related Fleet Telemetry Architecture
* [Optimizing EV Fleet Dashboards: Sustaining 60 FPS Under Heavy Telemetry Streams](/posts/optimizing-60fps-ev-dashboard)
* [Preventing Memory Bloat with Bounded Channels in High-Rate Telemetry](/posts/bounded-channels-telemetry)
