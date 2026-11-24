import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\omarr\\AppData\\Local\\Temp\\chrome-mch-test-' + Date.now();
const TARGET_URL = 'http://localhost:4173/';
const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 2, mobile: true };

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  console.log('=== STARTING MOBILE DEVICE EMULATION TEST (390x844) ===');
  console.log('Target URL:', TARGET_URL);

  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${USER_DATA_DIR}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--disable-background-networking',
    TARGET_URL,
  ], { stdio: 'ignore' });

  let versionData = null;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (res.ok) {
        versionData = await res.json();
        break;
      }
    } catch {}
    await sleep(300);
  }

  if (!versionData) {
    chromeProcess.kill();
    throw new Error('Failed to connect to Chrome debugging endpoint on port 9222');
  }

  console.log('Connected to Chrome:', versionData['Browser']);

  const targetsRes = await fetch('http://127.0.0.1:9222/json');
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page');
  if (!pageTarget || !pageTarget.webSocketDebuggerUrl) {
    chromeProcess.kill();
    throw new Error('No page target found');
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let idCounter = 1;
  const pendingRequests = new Map();

  function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  const networkResponses = [];
  const networkFailures = [];
  const consoleErrors = [];

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pendingRequests.has(message.id)) {
      const { resolve, reject } = pendingRequests.get(message.id);
      pendingRequests.delete(message.id);
      if (message.error) {
        reject(new Error(message.error.message || JSON.stringify(message.error)));
      } else {
        resolve(message.result);
      }
      return;
    }

    if (message.method === 'Network.responseReceived') {
      const { response } = message.params;
      networkResponses.push({ url: response.url, status: response.status });
    } else if (message.method === 'Network.loadingFailed') {
      networkFailures.push(message.params);
    } else if (message.method === 'Runtime.consoleAPICalled') {
      if (message.params.type === 'error') {
        const args = message.params.args.map(a => a.value ?? a.description ?? '').join(' ');
        consoleErrors.push(args);
      }
    } else if (message.method === 'Runtime.exceptionThrown') {
      const text = message.params.exceptionDetails?.text || 'Uncaught exception';
      consoleErrors.push(text);
    }
  };

  await sendCommand('Page.enable');
  await sendCommand('Runtime.enable');
  await sendCommand('Network.enable');
  await sendCommand('Emulation.setDeviceMetricsOverride', VIEWPORT);

  await sendCommand('Page.navigate', { url: TARGET_URL });
  await sleep(1200);

  async function evalInPage(expression) {
    const res = await sendCommand('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }

  const testResults = [];
  function recordTest(name, passed, details = '') {
    testResults.push({ name, passed, details });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name}${details ? ' - ' + details : ''}`);
  }

  // Ensure clean state first (clear localStorage)
  await evalInPage(`localStorage.clear(); location.reload();`);
  await sleep(1200);

  // TEST 1: Branding Asset & Zero Errors
  const imgResponse = networkResponses.find(r => r.url.includes('/IMG_0900.jpeg'));
  const imgLoadedInDom = await evalInPage(`
    (() => {
      const img = document.querySelector('img[src="/IMG_0900.jpeg"]');
      return img ? { found: true, complete: img.complete, naturalWidth: img.naturalWidth } : { found: false };
    })()
  `);
  recordTest('Branding Asset HTTP 200 & Rendered', !!imgResponse && imgResponse.status === 200 && imgLoadedInDom?.naturalWidth > 0, `Status ${imgResponse?.status}, Width ${imgLoadedInDom?.naturalWidth}px`);
  recordTest('Zero Broken Requests & Console Errors', networkFailures.length === 0 && consoleErrors.length === 0, `Failures: ${networkFailures.length}, Errors: ${consoleErrors.length}`);

  // TEST 2: Header has no truncated subtitle & Settings modal works
  const headerClean = await evalInPage(`
    (() => {
      const text = document.querySelector('header')?.innerText || '';
      return text.includes('mycoinharvest.com • MCH') && !text.includes('...');
    })()
  `);
  recordTest('Header Subtitle Untruncated', headerClean);

  // Open Help/Settings modal and toggle sound
  await evalInPage(`document.querySelector('button[aria-label="How to play and settings"]')?.click()`);
  await sleep(300);
  const helpModalVisible = await evalInPage(`document.body.innerText.includes('How to Play & Settings')`);
  await evalInPage(`document.querySelector('button[aria-label="Close settings"]')?.click()`);
  await sleep(200);
  recordTest('Help & Settings Modal Opens/Closes', helpModalVisible);

  // TEST 3: Chest open toggle & "100 MCH Ready" badge
  await evalInPage(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('TAP CHEST'))?.click()`);
  await sleep(400);
  const openedState = await evalInPage(`
    (() => ({
      hasReady: document.body.innerText.includes('100 MCH Ready'),
      coins: document.querySelectorAll('ellipse[fill="url(#goldCoinGrad)"]').length
    }))()
  `);
  recordTest('Chest Open Toggle & 100 MCH Ready Badge', openedState.hasReady && openedState.coins > 0, `Coins: ${openedState.coins}`);

  // TEST 4: Reset empties coins completely (no fake coins at 0 MCH!)
  await evalInPage(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Reset')?.click()`);
  await sleep(300);
  const emptyChestState = await evalInPage(`
    (() => ({
      coins: document.querySelectorAll('ellipse[fill="url(#goldCoinGrad)"]').length,
      emptyHint: document.body.innerText.includes('Vault is empty')
    }))()
  `);
  recordTest('Reset Empties Coins Inside Open Chest', emptyChestState.coins === 0 && emptyChestState.emptyHint, `Coins at 0 MCH: ${emptyChestState.coins}`);

  // TEST 5: Quick Load & +25/+100 coin loading
  await evalInPage(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '+100')?.click()`);
  await sleep(300);
  await evalInPage(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '+25')?.click()`);
  await sleep(300);
  const afterLoad = await evalInPage(`
    document.body.innerText.includes('LOADED: 125 MCH') && document.body.innerText.includes('975 MCH')
  `);
  recordTest('Coin Loading (+100 +25 = 125 MCH)', afterLoad);

  // TEST 6: All 8 Hiding Sectors
  const SECTORS = [
    'Shadow Vault', 'Neon Canopy', 'Subway Tunnel', 'Rooftop Relay',
    'Sunken Pier', 'Cyber Arcade', 'Canyon Bridge', 'Obsidian Bunker',
  ];
  let sectorsOk = true;
  for (const name of SECTORS) {
    const ok = await evalInPage(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('${name}'));
        if (btn) { btn.click(); return true; }
        return false;
      })()
    `);
    if (!ok) sectorsOk = false;
  }
  await sleep(200);
  recordTest('All 8 Hiding Sectors Selectable', sectorsOk);

  // TEST 7: Custom @username Tagging + Lock Stash Share Modal URL & Exact Amount
  await evalInPage(`
    (() => {
      const input = document.querySelector('input[placeholder*="@username"]');
      if (input) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(input, 'CyberSamurai');
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    })()
  `);
  await sleep(200);
  await evalInPage(`
    Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('LOCK STASH'))?.click()
  `);
  await sleep(400);

  const shareModalState = await evalInPage(`
    (() => {
      const shareInput = document.querySelector('input[value*="t.me/mycoinharvest_bot"]');
      const modalText = document.body.innerText;
      return {
        url: shareInput ? shareInput.value : null,
        hasExact125: modalText.includes('125 MCH'),
        hasFriend: modalText.includes('@CyberSamurai'),
        hasTelegramSend: modalText.toLowerCase().includes('send challenge in telegram'),
      };
    })()
  `);
  recordTest(
    'Share Modal Shows Exact Amount & /treasure Link',
    Boolean(shareModalState.url?.includes('https://t.me/mycoinharvest_bot/treasure?startapp=')) &&
      shareModalState.hasExact125 &&
      shareModalState.hasFriend &&
      shareModalState.hasTelegramSend,
    shareModalState.url || 'Missing URL'
  );

  // Close Share Modal
  await evalInPage(`document.querySelector('button[aria-label="Close share modal"]')?.click()`);
  await sleep(200);

  // TEST 8: Raid Mode Clean UI (no dead coin buttons) + Hot/Cold Sector Badges
  await evalInPage(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Raid Friend'))?.click()`);
  await sleep(400);
  const raidUiClean = await evalInPage(`
    (() => ({
      noCoinButtons: !document.body.innerText.includes('Load MCH Coins Into Vault'),
      hasTargetVault: document.body.innerText.includes('MCH Prize'),
      hasProbes: document.body.innerText.includes('PROBES (3)'),
    }))()
  `);
  recordTest('Raid Mode Hides Dead Coin Controls & Shows Target Vault', raidUiClean.noCoinButtons && raidUiClean.hasTargetVault && raidUiClean.hasProbes);

  // Scan a Cold sector (Shadow Vault when target is Obsidian Bunker)
  await evalInPage(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Shadow Vault') && b.textContent.includes('Scan Sector'))?.click()`);
  await sleep(300);
  const coldFeedback = await evalInPage(`document.body.innerText.includes('Cold Signal') && document.body.innerText.includes('PROBES (2)')`);
  recordTest('Raid Cold Signal & Probe Deduction', coldFeedback);

  // Scan a Hot sector (Canyon Bridge when target is Obsidian Bunker)
  await evalInPage(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Canyon Bridge') && b.textContent.includes('Scan Sector'))?.click()`);
  await sleep(300);
  const hotFeedback = await evalInPage(`document.body.innerText.includes('Hot Nearby') && document.body.innerText.includes('PROBES (1)')`);
  recordTest('Raid Hot Nearby Signal & Probe Deduction', hotFeedback);

  // Scan Winning sector (Obsidian Bunker)
  await evalInPage(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Obsidian Bunker') && b.textContent.includes('Scan Sector'))?.click()`);
  await sleep(400);
  const winFeedback = await evalInPage(`document.body.innerText.includes('VAULT CRACKED') && document.body.innerText.includes('+180 MCH Won!')`);
  recordTest('Raid Win Cracks Vault & Awards Bounty', winFeedback);

  // Screenshot Raid Mode
  const screenshotData = await sendCommand('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(process.cwd(), 'reference', 'mobile-preview-390x844.png'), Buffer.from(screenshotData.data, 'base64'));

  // TEST 9: Deep-link ?startapp= parsing opens Raid Mode with tagged challenge
  await sendCommand('Page.navigate', { url: `${TARGET_URL}?startapp=rooftop-relay__Viper__320` });
  await sleep(1000);
  const deepLinkOk = await evalInPage(`
    document.body.innerText.includes('@Viper') && document.body.innerText.includes('320 MCH') && document.body.innerText.includes('TAGGED')
  `);
  recordTest('Telegram ?startapp= Deep-Link Loads Friend Raid', deepLinkOk);

  ws.close();
  chromeProcess.kill();

  const passedCount = testResults.filter(t => t.passed).length;
  console.log(`\n=== SUMMARY: ${passedCount}/${testResults.length} PASSED ===`);
  if (passedCount !== testResults.length) {
    process.exit(1);
  }
}

runTest().catch((err) => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
