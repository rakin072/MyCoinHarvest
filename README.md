# MyCoinHarvest (MCH) — Telegram Mini-App

**MyCoinHarvest** is a mobile-first Telegram Mini-App built with **React, Vite, TypeScript, Tailwind CSS, and Lucide React icons**, styled with a dark cyberpunk neon aesthetic (`#0a0b14`), glowing borders, and cyber-botanical accents in cyan (`#00f0ff`), purple (`#a855f7`), hot pink (`#ec4899`), and gold (`#fbbf24`).

---

## Features

### 1. Persistent Top Header & Player Stats
- **Header Row:**
  - Neon cyan-to-pink circular avatar with the MCH emblem.
  - Gradient title **"MyCoinHarvest"** and subtitle `"mycoinharvest.com • Treasure Tag"`.
  - Pill button **"Connect Wallet"** with a pulsing status dot inside a dark teal border (opens non-custodial Polygon/TON wallet modal).
- **Player Stats Row:**
  - Left Card: **MCH Coins** displaying live balance (e.g. `1,000 MCH` in bold gold).
  - Right Card: **Scout Rank** in cyan displaying tag streak (e.g. `🔥 2x Streak` in bold coral).
- **Mode Switcher Tabs:**
  - `🔒 Hide & Tag Friend` (Active default with glowing cyan/pink border)
  - `📡 Raid Friend's Stash` (Interactive radar scanner game)

### 2. Interactive 2D Animated Treasure Chest
- Outer container with a glowing cyan-to-pink gradient border.
- **Top Bar:** Badges for `"TAP CHEST TO OPEN / CLOSE"` and `"LOADED: {stashedBounty} MCH"`.
- **2D Neon Cyberpunk Chest Graphic:**
  - Smoothly toggles between **OPEN** and **CLOSED** on tap/click with hydraulic audio cues.
  - Curved lid, horizontal gold trim bands, vertical cyan (left) and hot pink (right) glowing ribs.
  - Floating neon diamond particles and glowing rings at the base.
  - **Dynamic Coin Stacking:** Golden coins visually stack higher as `stashedBounty` increases, illuminated by a warm gold/cyan inner vault glow.
  - **Lock Emblem:** Center circular gold-ringed medallion containing the custom **MCH** logo (cyan-to-pink tree branches above "MCH" and roots below). Supports `IMG_0900.jpeg` placed in `/public` or uploaded via the in-app tester.
- **Bounty Status Bar:**
  - Stashed bounty readout in bold gold text.
  - Stealth bonus pill badge (e.g. `+20% Stealth Bonus`).
  - **Clear** button to safely return stashed coins back to your main balance.

### 3. Step 01: Coin Loading Controls
- Buttons: `+25`, `+100`, `+250`, and `Max Half` (50% of balance).
- Automatically deducts from `mchBalance`, increases `stashedBounty`, pops open the chest, animates the coin stack, and plays audio feedback.

### 4. Step 02: Pick Hiding Zone (8 Spots)
8 tactical sector cards in a 2x4 grid with glowing cyan borders on selection:
1. **Shadow Vault** | High Stealth | Encrypted cipher lock
2. **Neon Canopy** | Treehouse Grid | High branches & vines
3. **Subway Tunnel** | Underground Line | Echoing metro tracks
4. **Rooftop Relay** | Signal Tower | Skyline antenna dish
5. **Sunken Pier** | Harbor Docks | Foggy tide pilings
6. **Cyber Arcade** | Backroom Locker | Retro cabinet alley
7. **Canyon Bridge** | Outpost Gorge | Suspended steel span
8. **Obsidian Bunker** | Deep Core | Sub-level blast door

### 5. Step 03: Drop Clue & Tag Friend
- 3 preset clickable riddle pills.
- Custom 1-line riddle input field.
- Quick-tag squad chips: `⚡ @Alex`, `🦊 @Maya`, `🎯 @Jordan`, `🛡️ @Sam`.
- Custom Telegram `@username` input.
- **Primary CTA:** Dynamic button `"🔒 LOCK STASH & TAG @ALEX"` that triggers:
  - Victory confetti animation (`canvas-confetti`).
  - Triumph synthesizer audio.
  - Live activity feed update.
  - Direct Telegram Mini-App challenge share modal with copyable link: `https://t.me/mycoinharvest_bot/app?startapp=...`.

### 6. Mode 2: Raid Friend's Stash
- Intercepted clues from squad members.
- 3 Scanner Probes indicator.
- Hot / Cold radar proximity feedback.
- Cracking the correct sector awards the bounty and increases rank!

---

## Getting Started

### Run Development Server
```bash
npm install
npm run dev
```
The app runs at `http://localhost:5173/`.

### Build for Production
```bash
npm run build
```
Generates production-ready, minified HTML, CSS, and JS in `dist/`.
