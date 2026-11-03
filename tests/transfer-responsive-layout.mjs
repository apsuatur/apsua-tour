import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const js=readFileSync(new URL('../public/user-app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../public/v152.css',import.meta.url),'utf8');
assert.ok(js.includes('data-transfer-aside-submit'),'desktop summary has a real submit action');
assert.ok(js.includes("if(tr.step==='done'){box.hidden=true"),'summary disappears after submission');
assert.match(css,/grid-template-columns:minmax\(0,1fr\) 300px!important/,'desktop uses form and summary columns');
assert.match(css,/@media\(max-width:900px\)[\s\S]*#trRates\{display:none!important\}/,'mobile uses the existing bottom bar instead of duplicating the summary');
assert.ok(!css.includes('.transfer-booking-ticket{display:none'),'existing ticket stays visible');
console.log('PASS: desktop transfer summary, mobile bottom bar and non-duplicated final ticket.');
