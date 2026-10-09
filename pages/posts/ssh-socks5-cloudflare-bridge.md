---
title: Reliable SSH SOCKS5 Forwarding through Cloudflare WebSocket Bridges
date: 2026-09-14T10:00:00Z
lang: en
duration: 1min
type: note
---

When routing development traffic through corporate firewalls that inspect non-standard ports, combining `cloudflared access tcp` over port 443 with a local SSH SOCKS5 tunnel (`ssh -p 2222 -N -D 1080`) yields maximum stability.

Always specify `ServerAliveInterval 15` and `ServerAliveCountMax 3` in `~/.ssh/config` to prevent silent half-open TCP timeouts when crossing NAT boundaries.
For multi-VPS mesh configuration and automated supervisor daemons, see the [Specter Network Bridge](https://docs.tuquet.com/en/specter/bridge/) documentation.
