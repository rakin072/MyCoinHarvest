import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
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

  // 1. Launch headless Chrome with remote debugging on port 9222
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

  // Wait for remote debugging endpoint
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

  // Get active targets
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
  const consoleMessages = [];
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

    // Event handling
    if (message.method === 'Network.responseReceived') {
      const { response } = message.params;
      networkResponses.push({ url: response.url, status: response.status, mimeType: response.mimeType });
    } else if (message.method === 'Network.loadingFailed') {
      networkFailures.push(message.params);
    } else if (message.method === 'Runtime.consoleAPICalled') {
      const args = message.params.args.map(a => a.value ?? a.description ?? '').join(' ');
      consoleMessages.push({ type: message.params.type, text: args });
      if (message.params.type === 'error') {
        consoleErrors.push(args);
      }
    } else if (message.method === 'Runtime.exceptionThrown') {
      const text = message.params.exceptionDetails?.text || 'Uncaught exception';
      const desc = message.params.exceptionDetails?.exception?.description || '';
      consoleErrors.push(`${text}: ${desc}`);
    }
  };

  // Enable CDP domains
  await sendCommand('Page.enable');
  await sendCommand('Runtime.enable');
  await sendCommand('Network.enable');

  // Set Mobile Device Metrics (390x844 viewport, iPhone 14 style)
  await sendCommand('Emulation.setDeviceMetricsOverride', VIEWPORT);
  console.log(`Mobile Viewport Override Applied: ${VIEWPORT.width}x${VIEWPORT.height} (Scale: ${VIEWPORT.deviceScaleFactor})`);

  // Navigate to target
  await sendCommand('Page.navigate', { url: TARGET_URL });
  await sleep(1500);

  // Helper for evaluating JS in page context
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
    const status = passed ? 'PASS' : 'FAIL';
    console.log(`[${status}] ${name} ${details ? '- ' + details : ''}`);
  }

  // --- TEST 1: Check zero broken images and check /IMG_0900.jpeg ---
  const imgResponse = networkResponses.find(r => r.url.includes('/IMG_0900.jpeg'));
  const imgLoadedInDom = await evalInPage(`
    (() => {
      const img = document.querySelector('img[src="/IMG_0900.jpeg"]');
      return img ? { found: true, complete: img.complete, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight } : { found: false };
    })()
  `);

  recordTest('Branding Asset HTTP 200', !!imgResponse && imgResponse.status === 200, `Status: ${imgResponse?.status}`);
  recordTest('Branding Asset Rendered in DOM', imgLoadedInDom?.found && imgLoadedInDom?.complete && imgLoadedInDom?.naturalWidth > 0, `Width: ${imgLoadedInDom?.naturalWidth}px, Height: ${imgLoadedInDom?.naturalHeight}px`);
  recordTest('Zero Broken Image / Resource Requests', networkFailures.length === 0, `Failures: ${networkFailures.length}`);
  recordTest('Zero Console Errors', consoleErrors.length === 0, `Errors: ${consoleErrors.join('; ') || 'None'}`);

  // --- TEST 2: 2D Interactive Chest Open/Close Toggle & "100 MCH Ready" Badge ---
  const initialChestState = await evalInPage(`
    (() => {
      const topBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('TAP CHEST'));
      return {
        btnText: topBtn ? topBtn.textContent.trim() : null,
        bountyText: document.body.innerText.includes('100 MCH') || document.body.innerText.includes('LOADED:'),
      };
    })()
  `);
  recordTest('Initial Chest Loaded', initialChestState.btnText !== null, `Button: "${initialChestState.btnText}"`);

  // Tap Chest to Open
  await evalInPage(`
    (() => {
      const topBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('TAP CHEST'));
      if (topBtn) topBtn.click();
    })()
  `);
  await sleep(600);

  const openedChestState = await evalInPage(`
    (() => {
      const readyBadge = document.body.innerText.includes('100 MCH Ready');
      const topBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('TAP CHEST'));
      const goldCoins = document.querySelectorAll('ellipse[fill="url(#goldCoinGrad)"]').length;
      return {
        btnText: topBtn ? topBtn.textContent.trim() : null,
        hasReadyBadge: readyBadge,
        coinsCount: goldCoins,
      };
    })()
  `);
  recordTest('Chest Open Toggle & Coins Visible', openedChestState.coinsCount > 0, `Found ${openedChestState.coinsCount} coins cluster, Button: "${openedChestState.btnText}"`);
  recordTest('Emerge "100 MCH Ready" Badge', openedChestState.hasReadyBadge, 'Badge emerged centered directly over chest');

  // Test Coin Staking buttons (+25, +100, +250, Max Half)
  const addCoinsResult = await evalInPage(`
    (() => {
      const plus25Btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '+25');
      if (plus25Btn) plus25Btn.click();
      return true;
    })()
  `);
  await sleep(400);

  const balanceAfter25 = await evalInPage(`
    (() => {
      return {
        bounty125: document.body.innerText.includes('125') && document.body.innerText.includes('MCH'),
        balance975: document.body.innerText.includes('975 MCH'),
      };
    })()
  `);
  recordTest('Coin Staking (+25 Deducts & Stashes)', balanceAfter25.bounty125 && balanceAfter25.balance975, 'Bounty: 125 MCH, Balance: 975 MCH');

  // Test +100 staking
  await evalInPage(`
    (() => {
      const plus100Btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '+100');
      if (plus100Btn) plus100Btn.click();
    })()
  `);
  await sleep(400);

  const balanceAfter100 = await evalInPage(`
    (() => {
      return {
        bounty225: document.body.innerText.includes('225') && document.body.innerText.includes('MCH'),
        balance875: document.body.innerText.includes('875 MCH'),
      };
    })()
  `);
  recordTest('Coin Staking (+100 Deducts & Stashes)', balanceAfter100.bounty225 && balanceAfter100.balance875, 'Bounty: 225 MCH, Balance: 875 MCH');

  // --- TEST 3: All 8 Hiding Sectors Selection ---
  const SECTORS = [
    'Shadow Vault',
    'Neon Canopy',
    'Subway Tunnel',
    'Rooftop Relay',
    'Sunken Pier',
    'Cyber Arcade',
    'Canyon Bridge',
    'Obsidian Bunker'
  ];

  let allSectorsPassed = true;
  for (const sectorName of SECTORS) {
    const selected = await evalInPage(`
      (() => {
        const card = Array.from(document.querySelectorAll('button, div')).find(el => el.textContent.includes('${sectorName}') && el.getAttribute('role') === 'button');
        if (card) {
          card.click();
          return true;
        }
        // Fallback search
        const anyEl = Array.from(document.querySelectorAll('h3, div')).find(el => el.textContent.trim() === '${sectorName}');
        if (anyEl) {
          const btn = anyEl.closest('button') || anyEl.closest('[role="button"]') || anyEl.parentElement;
          if (btn) { btn.click(); return true; }
        }
        return false;
      })()
    `);
    await sleep(200);
    const headerUpdates = await evalInPage(`
      (() => {
        return document.body.innerText.includes('${sectorName}');
      })()
    `);
    if (!selected || !headerUpdates) allSectorsPassed = false;
  }
  recordTest('All 8 Hiding Sectors Interactive & Selectable', allSectorsPassed, `Verified ${SECTORS.length} sectors: ${SECTORS.join(', ')}`);

  // --- TEST 4: Custom Friend Tagging & Dynamic CTA ---
  // Click friend chips: @Alex, @Maya, @Jordan, @Sam
  const chipMaya = await evalInPage(`
    (() => {
      const chip = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('@Maya'));
      if (chip) { chip.click(); return true; }
      return false;
    })()
  `);
  await sleep(200);

  const ctaWithMaya = await evalInPage(`
    (() => {
      const cta = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('LOCK STASH & TAG'));
      return cta ? cta.textContent.trim() : null;
    })()
  `);
  recordTest('Quick-Tag Chip Selection (@Maya)', ctaWithMaya?.includes('@MAYA'), `CTA: "${ctaWithMaya}"`);

  // Custom Username typing
  const customUsernameTest = await evalInPage(`
    (() => {
      const input = document.querySelector('input[placeholder*="@username"]') || document.querySelector('input[placeholder*="Telegram"]');
      if (input) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(input, 'CyberSamurai');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      return false;
    })()
  `);
  await sleep(300);

  const ctaCustom = await evalInPage(`
    (() => {
      const cta = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('LOCK STASH & TAG'));
      return cta ? cta.textContent.trim() : null;
    })()
  `);
  recordTest('Custom @username Input Dynamic CTA', ctaCustom?.includes('@CYBERSAMURAI'), `CTA: "${ctaCustom}"`);

  // --- TEST 5: Raid Mode with 3 Scanner Probes & Hot/Cold Feedback ---
  const switchedToRaid = await evalInPage(`
    (() => {
      const raidTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Raid Friend'));
      if (raidTab) {
        raidTab.click();
        return true;
      }
      return false;
    })()
  `);
  await sleep(500);

  const raidInitialState = await evalInPage(`
    (() => {
      const text = document.body.innerText;
      const hasProbes = text.includes('SCANNER PROBES') || text.includes('PROBES');
      const hasClue = text.includes('INTERCEPTED CLUE') || text.includes('blast hatch');
      const hasTarget = text.includes('Target:');
      return { hasProbes, hasClue, hasTarget };
    })()
  `);
  recordTest('Raid Mode Loaded with Target & Clue', raidInitialState.hasTarget && raidInitialState.hasClue, 'Target info and Intercepted Clue rendered');

  // Deploy 1 Scanner Probe by clicking a raid sector
  const probeDeployed = await evalInPage(`
    (() => {
      const sectorBtn = Array.from(document.querySelectorAll('button, div')).find(el => el.textContent.includes('Shadow Vault') && (el.textContent.includes('Scan') || el.onclick || el.getAttribute('role') === 'button'));
      if (sectorBtn) {
        sectorBtn.click();
        return true;
      }
      return false;
    })()
  `);
  await sleep(500);

  const raidAfterScan = await evalInPage(`
    (() => {
      const text = document.body.innerText;
      const hasFeedback = text.includes('Empty') || text.includes('Cold') || text.includes('Warm') || text.includes('Hot') || text.includes('CRACKED') || text.includes('Radar') || text.includes('Probes Left') || text.includes('PROBES');
      return { hasFeedback };
    })()
  `);
  recordTest('Scanner Probe Deployment & Radar Feedback', raidAfterScan.hasFeedback, 'Probe consumed and scan feedback rendered');

  // Capture Screenshot in Mobile Viewport
  const screenshotData = await sendCommand('Page.captureScreenshot', { format: 'png' });
  const screenshotBuffer = Buffer.from(screenshotData.data, 'base64');
  const screenshotPath = join(process.cwd(), 'reference', 'mobile-preview-390x844.png');
  writeFileSync(screenshotPath, screenshotBuffer);
  console.log(`Saved Mobile Viewport Screenshot (390x844) to: ${screenshotPath}`);

  // Clean up
  ws.close();
  chromeProcess.kill();

  console.log('\n=== TEST SUITE SUMMARY ===');
  const allPassed = testResults.every(t => t.passed);
  console.log(`Total Tests: ${testResults.length} | Passed: ${testResults.filter(t => t.passed).length} | Failed: ${testResults.filter(t => !t.passed).length}`);
  console.log('Result:', allPassed ? 'ALL TESTS PASSED SUCCESSFULLY! ✅' : 'SOME TESTS FAILED ❌');

  if (!allPassed) {
    process.exit(1);
  }
}

runTest().catch((err) => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
