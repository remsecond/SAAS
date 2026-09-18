const fs = require('node:fs');
const assert = require('node:assert/strict');
const html = fs.readFileSync('public/index.html', 'utf8');
new Function(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
assert(html.includes('Fictional sample data'));
assert(!/Adrian|Zeinemann|saas\.instructure|sk-proj-|appgprj_/.test(html));
console.log('PASS: script syntax, fictional-data marker, known private identifiers absent.');
