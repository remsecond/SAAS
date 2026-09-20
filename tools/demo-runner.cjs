// Phone-frame demo runner: plays a storyboard against a web app inside a
// simulated phone, with captions and tap indicators, and records a video.
// Usage: node demo-runner.js storyboard.json [--headed] [--out demo.mp4]
const path = require('path'), fs = require('fs'), { execSync, execFileSync } = require('child_process');
let pw; try { pw = require('playwright'); } catch { pw = require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); }
const { chromium } = pw;

const args = process.argv.slice(2);
const sbPath = args.find(a => !a.startsWith('--')) || 'storyboard.json';
const headed = args.includes('--headed');
const outIdx = args.indexOf('--out');
const out = path.resolve(outIdx > -1 ? args[outIdx + 1] : 'demo.mp4');
fs.mkdirSync(path.dirname(out),{recursive:true});
const videoDir=fs.mkdtempSync(path.join(require('os').tmpdir(),'hallway-demo-video-'));
const revision=execFileSync('git',['rev-parse','HEAD'],{cwd:path.join(__dirname,'..'),encoding:'utf8'}).trim();
const sb = JSON.parse(fs.readFileSync(sbPath, 'utf8'));
const W = 1920, H = 1080, PW = sb.phone?.width || 390, PH = sb.phone?.height || 844;
const accent = sb.accent || '#e0473a';

const host = `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box}html,body{margin:0;height:100%;overflow:hidden}
body{font-family:-apple-system,"SF Pro Display","Segoe UI",system-ui,sans-serif;color:#f4f2ea;
 background:radial-gradient(1200px 800px at 30% 40%,#2b2f36,#121317 70%);display:flex;align-items:center;justify-content:center;gap:120px}
.phone{position:relative;width:${PW + 28}px;height:${PH + 28}px;border-radius:62px;background:#0b0b0c;padding:14px;
 box-shadow:0 0 0 2px #3a3b40,0 0 0 5px #1b1c1f,0 40px 120px rgba(0,0,0,.6)}
.screen{width:${PW}px;height:${PH}px;border-radius:48px;overflow:hidden;background:#fff;position:relative}
iframe{border:0;width:100%;height:calc(100% - 50px);display:block}
.status{height:50px;display:flex;align-items:center;justify-content:space-between;padding:6px 34px 0 44px;font:600 17px -apple-system,system-ui,sans-serif;color:var(--sf,#111);background:var(--sb,#fff)}.ic{display:flex;gap:6px;align-items:center}.ic svg{fill:currentColor}
.island{position:absolute;top:25px;left:50%;transform:translateX(-50%);width:120px;height:34px;border-radius:20px;background:#000;z-index:5}
.side{width:560px}
.brand{font-size:22px;letter-spacing:.14em;text-transform:uppercase;color:${accent};font-weight:700;margin-bottom:18px}
.title{font-size:54px;font-weight:800;line-height:1.05;margin:0 0 36px}
.cap{font-size:34px;line-height:1.35;min-height:190px;transition:opacity .35s,transform .35s}
.cap.hide{opacity:0;transform:translateY(12px)}
.sub{font-size:22px;color:#a9a79c;margin-top:14px;line-height:1.4}
.dots{display:flex;gap:10px;margin-top:40px}.dots i{width:10px;height:10px;border-radius:50%;background:#44464d}.dots i.on{background:${accent};width:28px;border-radius:6px}
</style></head><body>
<div class="phone"><div class="island"></div><div class="screen"><div class="status" id="sbar"><span>9:41</span><span class="ic"><svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2.5" width="3" height="9.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg><svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0zM3.5 7a6.4 6.4 0 0 1 9 0l1.5-1.5a8.5 8.5 0 0 0-12 0zM.5 4a10.6 10.6 0 0 1 15 0L16 3.4A11.4 11.4 0 0 0 0 3.4z"/></svg><svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".45"/><rect x="2" y="2" width="20" height="9" rx="2"/><rect x="25" y="4.5" width="1.6" height="4" rx=".8" opacity=".45"/></svg></span></div><iframe id="app"></iframe></div></div>
<div class="side"><div class="brand">${sb.brand || ''}</div><h1 class="title">${sb.title || ''}</h1>
<div class="cap" id="cap"></div><div class="dots" id="dots"></div></div>
</body></html>`;

// Injected into the app frame: a finger-tap ripple, no scrollbars.
const tapInit = `(()=>{addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');
s.textContent='.__tap{position:fixed;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(120,120,120,.35);border:2px solid rgba(255,255,255,.9);box-shadow:0 2px 10px rgba(0,0,0,.35);pointer-events:none;z-index:2147483647;transition:transform .45s ease-out,opacity .45s ease-out}::-webkit-scrollbar{display:none}';
document.head.appendChild(s)});window.__tap=(x,y)=>{const d=document.createElement('div');d.className='__tap';d.style.left=x+'px';d.style.top=y+'px';
document.body.appendChild(d);requestAnimationFrame(()=>{d.style.transform='scale(1.5)';d.style.opacity='0'});setTimeout(()=>d.remove(),600)}})()`;

(async () => {
  const browser = await chromium.launch({ headless: !headed, executablePath: process.env.HALLWAY_CHROME_PATH || undefined });
  const ctx = await browser.newContext({
    viewport: { width: W, height: H }, deviceScaleFactor: 1,
    recordVideo: headed ? undefined : { dir: videoDir, size: { width: W, height: H } },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  // Allow our own app to be framed for the recording only (strip anti-framing headers).
  const origin = new URL(sb.url).origin;
  await ctx.route(u => u.origin === origin, async route => {
    const r = await route.fetch();
    const h = { ...r.headers() }; delete h['x-frame-options'];
    if (h['content-security-policy']) h['content-security-policy'] = h['content-security-policy'].replace(/frame-ancestors[^;]*;?/, '');
    await route.fulfill({ response: r, headers: h });
  });
  await ctx.addInitScript(tapInit);
  const page = await ctx.newPage(); ctx.setDefaultTimeout(6000);
  await page.setContent(host);
  const steps = sb.steps;
  await page.evaluate(n => { document.getElementById('dots').innerHTML = '<i></i>'.repeat(n) }, steps.filter(s => s.caption).length);
  await page.evaluate(u => document.getElementById('app').src = u, sb.url);
  const frameEl = await page.waitForSelector('#app');
  let app; while (!(app = await frameEl.contentFrame()) || app.url() === 'about:blank') await page.waitForTimeout(100);
  await app.waitForLoadState('networkidle');
  if (sb.init) await app.evaluate(sb.init);
  // Status bar colour: storyboard override, else the app's theme-color.
  const bar = sb.statusBar || await app.evaluate(() => { const c = document.querySelector('meta[name=theme-color]')?.content; return c ? { bg: c } : null; });
  if (bar) await page.evaluate(b => { const el = document.getElementById('sbar'); el.style.setProperty('--sb', b.bg);
    const m = b.bg.match(/^#?(..)(..)(..)$/); const lum = m ? (parseInt(m[1],16)*299+parseInt(m[2],16)*587+parseInt(m[3],16)*114)/1000 : 255;
    el.style.setProperty('--sf', b.fg || (lum < 140 ? '#fff' : '#111')); }, bar);
  await page.waitForTimeout(800);

  let capIdx = -1, failures = [];
  const setCaption = async (text, sub) => { capIdx++;
    await page.evaluate(([t, s, i]) => { const c = document.getElementById('cap'); c.classList.add('hide');
      setTimeout(() => { c.innerHTML = t + (s ? '<div class="sub">' + s + '</div>' : ''); c.classList.remove('hide') }, 350);
      [...document.querySelectorAll('.dots i')].forEach((d, k) => d.classList.toggle('on', k === i)) }, [text, sub || '', capIdx]);
    await page.waitForTimeout(500); };
  const find = s => {
    let l = s.role ? app.getByRole(s.role, { name: s.name ? new RegExp(s.name, 'i') : undefined })
          : s.selector ? app.locator(s.selector) : app.getByText(new RegExp(s.text, 'i'));
    if (s.within) l = app.locator(s.within).locator(l);
    return s.nth === 'last' ? l.last() : l.nth(s.nth || 0);
  };
  const glide = async (dy, ms = 1400) => app.evaluate(([dy, ms]) => new Promise(res => {
    const sc = document.scrollingElement, y0 = sc.scrollTop, t0 = performance.now();
    const f = t => { const k = Math.min(1, (t - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      sc.scrollTop = y0 + dy * e; k < 1 ? requestAnimationFrame(f) : res() }; requestAnimationFrame(f) }), [dy, ms]);

  for (const s of steps) {
    try {
      if (s.caption) await setCaption(s.caption, s.sub);
      if (s.tap) {
        const l = find(s.tap); await l.scrollIntoViewIfNeeded(); const b = await l.boundingBox();
        const fb = await frameEl.boundingBox();
        const x = b.x - fb.x + b.width / 2, y = b.y - fb.y + b.height / 2;
        await app.evaluate(([x, y]) => window.__tap && window.__tap(x, y), [x, y]);
        await page.waitForTimeout(250); await l.click();
      }
      if (s.select) await find(s.select).selectOption(s.select.value);
      if (s.reveal) { const l = find(s.reveal); await l.waitFor({state:'visible'}); await l.evaluate(el=>el.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'})); await page.waitForTimeout(300); }
      if (s.scroll) await glide(s.scroll, s.scrollMs);
      if (s.scrollTo === 'top') await glide(-(await app.evaluate(() => document.scrollingElement.scrollTop)), 900);
      if (s.expect) {
        const l = find(s.expect); await l.waitFor({state:'visible', timeout:5000});
        const shown = await l.evaluate(el => {
          const r=el.getBoundingClientRect();
          const x=r.left+r.width/2,y=r.top+r.height/2;
          const hit=document.elementFromPoint(x,y);
          return r.width>0 && r.height>0 && r.top>=0 && r.bottom<=innerHeight && r.left>=0 && r.right<=innerWidth && (hit===el || el.contains(hit));
        });
        if (!shown) throw new Error('Expected content is outside viewport or obscured');
      }
      await page.waitForTimeout(s.pause ?? 1600);
    } catch (e) { await page.screenshot({path:path.join(path.dirname(out),`fail-${failures.length+1}.png`)}); failures.push(`${s.caption || JSON.stringify(s.tap)}: ${e.message.split('\n')[0]}`); console.error('STEP FAILED', failures.at(-1)); }
  }
  fs.writeFileSync(out+'.results.json', JSON.stringify({revision,url:sb.url,phone:{width:PW,height:PH-50},checkedAt:new Date().toISOString(),steps:steps.length,failures},null,2));
  await page.waitForTimeout(1200);
  const video = page.video(); await ctx.close(); await browser.close();
  if (video) { const webm = await video.path();
    execFileSync('ffmpeg', ['-y','-loglevel','error','-i',webm,'-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',out]);
    console.log('Saved', out); }
  console.log(failures.length ? `\n${failures.length} step(s) failed:\n- ` + failures.join('\n- ') : '\nAll steps passed ✔');
  process.exit(failures.length ? 1 : 0);
})();