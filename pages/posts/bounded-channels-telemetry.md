---
title: Preventing Memory Bloat with Bounded Channels in High-Rate Telemetry
date: 2026-08-20T10:00:00Z
lang: en
duration: 1min
type: note
---

In IoT systems with hundreds of thousands of streaming devices, slow consumer clients (browsers on weak 3G) can cause unbounded queues in WebSocket servers, ballooning server memory until an Out-Of-Memory (OOM) crash occurs.

Use **bounded circular buffers** (e.g. `tokio::sync::broadcast` with fixed capacity). When a slow client falls behind the threshold, discard non-critical intermediate frames (such as micro GPS fluctuations) while preserving critical telemetry state alarms.
