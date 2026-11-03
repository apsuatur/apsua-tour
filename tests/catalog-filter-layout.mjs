import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const css=readFileSync(new URL('../public/v152.css',import.meta.url),'utf8');
assert.match(css,/grid-template-columns:minmax\(0,29fr\) minmax\(0,38fr\) minmax\(0,33fr\)!important/,'format, price and sorting share one row');
assert.match(css,/\.catalog-selects :is\(select\.input,\.catalog-price>summary\)\{width:100%!important;min-width:0!important/,'all three controls fill their grid tracks without overflow');
assert.match(css,/height:44px!important;min-height:44px!important[^}]*border-radius:15px!important/,'mobile controls share one height and radius');
assert.match(css,/border:1px solid var\(--apple-hairline,#dedee3\)!important;[\s\S]*background-color:#fff!important;[\s\S]*box-shadow:none!important/,'all controls share the same white surface, border and shadow');
console.log('PASS: format, price and sorting stay in one aligned row with a wider price track.');
