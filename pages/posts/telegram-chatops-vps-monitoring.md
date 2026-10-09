---
title: "Turning Telegram into a VPS Command Center & GitHub Actions Watchdog"
date: 2026-10-03T12:30:00Z
lang: en
duration: 6min
type: blog
description: "How to build a lightweight Node.js Telegram bot to monitor VPS server health, receive instant GitHub CI failure alerts, and trigger deployments from your phone."
---

Have you ever found yourself in this scenario: It is Friday evening, and you have just run `git push` on a new feature branch before stepping out for dinner or grabbing coffee with friends. In the back of your mind, the questions linger:

> *"Did the CI test suite pass on GitHub Actions, or did a subtle lint check fail?"*  
> *"Is the cron job on that personal VPS running fine, or did an unhandled edge case leak memory and freeze the node?"*

Pulling out a laptop, tethering cellular data, typing SSH keys, and refreshing browser tabs in the middle of a social gathering is inconvenient.

To solve this, I built a lightweight personal Telegram bot ([tuquet/bot](https://github.com/tuquet/bot), `@FlowupAI_bot`) to manage these tasks on the go. In this article, I share a straightforward blueprint to help you turn your phone into a pocket DevOps command center.

---

## 1. What Can the Bot Do?

Think of the bot as a **24/7 on-call sentinel** running quietly on your server:

* **Instant Server Health Metrics:** Send `/server`, and the bot immediately returns CPU load, available RAM, and disk utilization percentages.
* **Multi-Repo CI/CD Tracking:** Send `/ci all`, and the bot queries your GitHub repositories to report green (passing) and red (failing) build statuses across branches.
* **Actionable Error Logs:** When a GitHub Actions workflow fails, the bot extracts the last fifty lines of the relevant step log and sends them directly to your chat, allowing you to instantly diagnose missing environment variables or syntax bugs.
* **Remote One-Tap Deployment:** When you are ready to publish a release, tapping the **Deploy** inline button triggers a repository dispatch event without touching a terminal.
* **Automated Publication Announcements:** Whenever a new article is published or an open-source release is tagged, the bot notifies your channel with a summary link.

```text
📱 Your Mobile Telegram Screen
┌───────────────────────────────────────────────┐
│ @FlowupAI_bot                                 │
│                                               │
│ 💻 VPS Health Report:                         │
│ • CPU: 12% | 4 Cores                          │
│ • RAM: 1.8GB / 7.6GB (23.7%)                 │
│ • Disk: 14.2GB / 80GB (18%)                   │
│ • Uptime: 14 days, 6 hours                    │
│                                               │
│ [ 📊 Inspect CI ] [ 🚀 Deploy ] [ 📦 Releases]│
└───────────────────────────────────────────────┘
```

---

## 2. Why Telegram over Discord or Slack?

* **Native Mobile Experience:** Telegram opens instantly, has reliable push notifications, and natively supports interactive inline button keyboards designed for one-handed operation.
* **Extremely Low Memory Footprint:** A Node.js Telegram bot using modern libraries consumes **less than 25MB of RAM**, making it practical even on minimal entry-level virtual servers (such as 1GB RAM instances).
* **Zero Open Inbound Ports:** The bot connects via **Long Polling**—it initiates outbound HTTP requests to the Telegram API to pull updates. As a result, you **do not need a public domain, SSL certificates, or open firewall ports** on your server.

---

## 3. Building the Bot in 4 Steps

You can set up a functional ChatOps bot in minutes with Node.js and TypeScript.

### Step 1: Create the Bot Identity via BotFather

1. Open Telegram and search for `@BotFather`.
2. Send `/newbot`, and follow the prompts to choose a display name and handle (e.g. `MyDevOpsBot`).
3. BotFather will provide an authorization **API Token** formatted like `7123456789:AAFxxx_your_token_here`. Keep this credential secure.

### Step 2: Initialize Node.js with GrammY

[GrammY](https://grammy.dev/) is an ergonomic, TypeScript-first Telegram Bot framework for Node.js:

```bash
mkdir my-bot && cd my-bot
npm init -y
npm install grammy
```

Create `bot.js`:

```javascript
import { Bot, InlineKeyboard } from 'grammy';
import os from 'os';

const bot = new Bot(process.env.TELEGRAM_TOKEN);

// Security boundary: Only allow your personal Telegram User ID
const ADMIN_ID = 123456789; // Replace with your ID from @userinfobot

// /start command: Render an interactive inline keyboard
bot.command('start', async (ctx) => {
  const keyboard = new InlineKeyboard()
    .text('💻 Inspect Server', 'check_server')
    .text('🚀 Deploy Website', 'do_deploy');

  await ctx.reply('Hello! Your personal DevOps assistant is online.', {
    reply_markup: keyboard,
  });
});

// Handle the "Inspect Server" callback button
bot.callbackQuery('check_server', async (ctx) => {
  const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(1);
  const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);

  await ctx.reply(
    `💻 <b>VPS Metrics:</b>\n` +
    `• Free RAM: ${freeMem} GB / ${totalMem} GB\n` +
    `• Uptime: ${(os.uptime() / 3600).toFixed(1)} hours`,
    { parse_mode: 'HTML' }
  );
  await ctx.answerCallbackQuery();
});

bot.start();
console.log('Bot process started via long polling...');
```

Test it locally:

```bash
TELEGRAM_TOKEN="your_token_here" node bot.js
```

Open your bot in Telegram on your phone, send `/start`, tap **Inspect Server**, and your server responds within one second.

---

## 4. Key Security Considerations for ChatOps

Granting administrative server control to a messaging interface requires strict guardrails:

### 1. Enforce Strict User Whitelisting
Never expose administrative actions to unauthenticated users. If your bot resides in a group chat, write middleware that verifies `ctx.from.id`:
* If the sender's ID does not match your administrator ID, reject destructive commands (`reboot`, `deploy`, or file inspection).
* Non-whitelisted users should only see harmless public read-outs.

### 2. Prefer Outbound Long Polling over Webhooks for Personal Nodes
While webhooks provide a push-based mechanism, they require a public DNS record and open inbound ports (443/8443). Long Polling eliminates external attack surfaces entirely, running cleanly behind NAT routers and restrictive corporate firewalls.

---

## Conclusion

Automating server workflows via Telegram provides peace of mind without tying you to your desk. With a handful of lines of Node.js, you turn an everyday messaging app into an unobtrusive command console.

The complete open-source implementation—including systemd service definitions and GitHub Actions webhooks—is available in the [tuquet/bot](https://github.com/tuquet/bot) repository.

---

### Related Infrastructure & Monitoring Architecture
* [Zero-Trust Architecture & Risk Isolation: Survival Guide for Web Agencies and Freelancers](/posts/zero-trust-architecture-agency-risk-management)
* [Reliable SSH SOCKS5 Forwarding through Cloudflare WebSocket Bridges](/posts/ssh-socks5-cloudflare-bridge)
