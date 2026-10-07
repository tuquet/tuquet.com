import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1200px;
      height: 630px;
      background: #09090b;
      color: #fafafa;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 60px 80px;
      position: relative;
      overflow: hidden;
    }
    /* Ambient Glow */
    .glow-1 {
      position: absolute;
      width: 600px;
      height: 600px;
      top: -200px;
      right: -100px;
      background: radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(0, 0, 0, 0) 70%);
      border-radius: 50%;
      pointer-events: none;
    }
    .glow-2 {
      position: absolute;
      width: 500px;
      height: 500px;
      bottom: -150px;
      left: -100px;
      background: radial-gradient(circle, rgba(244, 63, 94, 0.12) 0%, rgba(0, 0, 0, 0) 70%);
      border-radius: 50%;
      pointer-events: none;
    }
    /* Subtle Grid */
    .grid {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
    }
    .content {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-between;
    }
    .top-bar {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .logo-badge {
      width: 68px;
      height: 68px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border-radius: 9999px;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.25);
      color: #38bdf8;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .main-text {
      margin-top: auto;
      margin-bottom: auto;
    }
    h1 {
      font-size: 58px;
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -1.5px;
      background: linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 16px;
    }
    p.desc {
      font-size: 24px;
      color: #a1a1aa;
      line-height: 1.45;
      max-width: 920px;
      font-weight: 400;
    }
    .bottom-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 24px;
    }
    .tags {
      display: flex;
      gap: 12px;
    }
    .tag {
      padding: 6px 14px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 14px;
      color: #d4d4d8;
      font-weight: 500;
    }
    .domain {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 18px;
      color: #71717a;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .domain span {
      color: #38bdf8;
    }
  </style>
</head>
<body>
  <div class="grid"></div>
  <div class="glow-1"></div>
  <div class="glow-2"></div>
  
  <div class="content">
    <div class="top-bar">
      <div class="logo-badge">
        <svg viewBox="-15.71 -74.80 122.16 152.46" width="46" height="46" fill="#f43f5e">
          <path d="M24 1.80Q15.30 1.80 10.42-3.30Q5.55-8.40 5.55-17.55Q5.55-25.05 8.25-32.25Q3.75-32.25 1.20-33.15Q-3-34.05-3-36.30Q-3-37.20-1.65-37.20Q-0.60-37.20 0.83-37.12Q2.25-37.05 4.20-36.90Q6.30-36.75 7.80-36.67Q9.30-36.60 10.20-36.60L15.45-48.90Q17.25-53.25 18.75-55.95Q20.25-58.65 21.15-59.70Q23.40-62.10 27.15-62.10Q30.75-62.10 30.75-60.60L25.50-52.35Q22.65-47.85 20.47-43.80Q18.30-39.75 16.65-36.15Q25.95-36.15 31.50-36.23Q37.05-36.30 39-36.30L40.20-36.30Q42-36.30 42-35.85Q42-34.95 38.40-34.20Q31.95-33.45 26.25-33Q20.55-32.55 15.45-32.55Q13.95-28.65 12.97-24.37Q12-20.10 12-16.20Q12-10.35 14.70-6Q17.40-1.65 24.30-1.65Q32.55-1.65 37.42-5.62Q42.30-9.60 47.40-15.90Q48.15-16.80 48.75-16.80Q49.20-16.80 49.20-16.05Q49.20-15 48-13.35Q41.55-5.10 35.92-1.65Q30.30 1.80 24 1.80M51 64.95Q44.25 64.95 41.55 61.13Q38.85 57.30 38.85 51.30Q38.85 45.90 40.58 39.38Q42.30 32.85 44.92 26.10Q47.55 19.35 50.63 13.13Q53.70 6.90 56.40 2.10Q54 1.50 54-0.30Q54-1.20 55.05-1.20Q55.50-1.20 56.48-0.97Q57.45-0.75 58.05-0.75Q59.70-3.15 60.83-5.25Q61.95-7.35 62.70-9Q62.10-9 58.20-6.45Q54.75-4.05 52.05-4.05Q46.65-4.05 46.65-10.95Q46.65-17.85 52.65-24.75Q59.10-31.65 65.70-31.65Q72.75-31.65 73.80-28.95Q74.55-28.95 76.05-29.17Q77.55-29.40 78.30-29.40Q81-29.40 81-27.90L73.65-16.50Q66.60-5.40 66.30-3Q67.35-2.25 69.15-2.25Q74.25-2.25 80.47-5.17Q86.70-8.10 92.25-15.90Q92.70-16.50 93.15-16.50Q93.75-16.50 93.75-15.60Q93.75-15.15 93.45-14.47Q93.15-13.80 92.85-13.35Q90.45-10.20 87.60-7.57Q84.75-4.95 80.85-2.85Q76.65-0.30 72.45 0.53Q68.25 1.35 64.65 1.35Q83.70 10.35 83.70 28.35Q83.70 34.95 81.07 41.40Q78.45 47.85 73.95 53.17Q69.45 58.50 63.52 61.72Q57.60 64.95 51 64.95M52.65-6.90Q57.30-6.90 63.30-13.80Q72.15-23.85 72.15-25.65Q72.15-27.90 68.55-27.90Q63-27.90 56.55-21.90Q49.95-16.20 49.95-10.80Q49.95-6.90 52.65-6.90M51.15 60.75Q57.15 60.75 62.40 57.52Q67.65 54.30 71.63 49.05Q75.60 43.80 77.85 37.73Q80.10 31.65 80.10 25.95Q80.10 21.15 77.55 15.97Q75 10.80 70.88 7.20Q66.75 3.60 61.80 3.60Q57.30 11.25 52.50 20.02Q47.70 28.80 44.48 36.98Q41.25 45.15 41.25 51.15Q41.25 55.65 43.58 58.20Q45.90 60.75 51.15 60.75" />
        </svg>
      </div>
      <div class="role-badge">Technical Lead & Systems Architect</div>
    </div>
    
    <div class="main-text">
      <h1>Nguyen Dinh Tu (Tu Quet)</h1>
      <p class="desc">Engineering robust distributed systems, high-concurrency real-time telemetry streaming, and developer tooling at scale.</p>
    </div>
    
    <div class="bottom-bar">
      <div class="tags">
        <div class="tag">Rust & Tokio</div>
        <div class="tag">Distributed Systems</div>
        <div class="tag">Chromium CDP</div>
        <div class="tag">Vue 3 & Vite</div>
        <div class="tag">PostgreSQL & Supabase</div>
      </div>
      <div class="domain">
        https://<span>tuquet.github.io</span>
      </div>
    </div>
  </div>
</body>
</html>`;

const tempHtmlPath = path.resolve('public/temp_og_render.html');
const outPngPath = path.resolve('public/og.png');

fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const cmd = `"${edgePath}" --headless --disable-gpu --window-size=1200,630 --screenshot="${outPngPath}" "file:///${tempHtmlPath.replace(/\\\\/g, '/')}"`;

console.log('Rendering OG image via Edge...');
execSync(cmd);

fs.unlinkSync(tempHtmlPath);
console.log('Rendered successfully to public/og.png!');
