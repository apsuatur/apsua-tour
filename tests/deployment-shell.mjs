import assert from 'node:assert/strict';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
assert.equal(existsSync('public/index.html'),false,'Static root must not shadow the application worker');
assert.equal(existsSync('dist/client/index.html'),false,'Deployment cannot contain an old static entry page');
function files(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(f=>f.isDirectory()?files(join(dir,f.name)):[join(dir,f.name)])}
const worker=files('dist/server').filter(f=>f.endsWith('.js')).map(f=>readFileSync(f,'utf8')).join('\n');
for(const token of ['apsuaSkipIntro','apsuaPageBuildId','/live-updates.js?v=166','/user-app.js?v=190','/v146.css?v=146','/v152.css?v=176','/apple-system.css?v=12','/rail-motion.js?v=166','/api/app-icon-180.png'])assert.ok(worker.includes(token),token+' must be in the deployed page shell');
assert.match(readFileSync('public/user-app.js','utf8'),/header-account-avatar/,'Telegram avatar must be rendered in the header account control');
for(const name of ['mandarins','autumn','transfer'])for(const ext of ['webm','mp4'])assert.equal(existsSync(`public/assets/seasonal/${name}.${ext}`),true,`${name}.${ext} seasonal banner must be packaged`);
console.log('PASS: no static HTML shadows app routes; deployed worker connects latest refresh and intro scripts.');

// Build 172: the admin panel is a separate file that only staff download.
{const main=readFileSync('public/user-app.js','utf8'),admin=readFileSync('public/admin-app.js','utf8'),sw=readFileSync('public/sw.js','utf8');
assert.ok(main.includes("fetch('/admin-app.js?v=172'"),'user-app.js loads the current admin-app.js version');
assert.ok(!/\bconst ADM_RENDER\b|\bfunction adminView\b|\bfunction admClick\b/.test(main),'admin panel code must not be back in user-app.js');
assert.ok(/\bconst ADM_RENDER\b/.test(admin)&&/\nadminApp=\{/.test(admin),'admin-app.js defines the panel and its adminApp entry points');
const precache=(sw.match(/addAll\(\[([^\]]*)\]/)||[])[1];assert.ok(precache&&precache.includes('user-app.js?v=190'),'precache list found');assert.ok(!precache.includes('admin-app.js'),'admin-app.js must not be precached for every visitor');
assert.ok(!readFileSync('lib/site-shell.ts','utf8').includes('admin-app.js'),'the page shell must not load admin-app.js for every visitor');
console.log('PASS: admin panel is a separate file, loaded on demand and not precached.');}

const loginSource=readFileSync('public/user-app.js','utf8');
assert.ok(loginSource.includes('https://oauth.telegram.org/js/telegram-login.js?6'),'Keep the working Telegram SDK after archive imports');
assert.ok(!loginSource.includes('https://telegram.org/js/telegram-widget.js?22'),'Do not replace the working login with the legacy redirect widget');
assert.ok(loginSource.includes('authEpoch!==clientAuthEpoch'),'Stale state responses cannot undo a completed login');
