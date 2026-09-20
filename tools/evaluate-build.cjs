'use strict';
// Read-only evaluation of an explicitly selected checkout. Artifacts stay outside it.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const args=process.argv.slice(2);
function arg(k){const i=args.indexOf(k);return i<0?undefined:args[i+1]}
function run(cmd,a,cwd){return spawnSync(cmd,a,{cwd,encoding:'utf8',timeout:180000,windowsHide:true,maxBuffer:8*1024*1024})}
const repo=path.resolve(arg('--repo')||path.join(__dirname,'..'));
function git(...a){const r=run('git',a,repo);if(r.status!==0)throw Error(r.stderr||'git failed');return r.stdout.trim()}
const expected=arg('--expect-revision');
if(!expected)throw Error('Required: --expect-revision <commit/ref>. Optional: --repo <checkout> --out <new external directory>');
const revision=git('rev-parse','HEAD'),wanted=git('rev-parse',expected+'^{commit}');
if(revision!==wanted)throw Error('Checkout HEAD does not match requested revision; select the intended checkout first.');
const dirty=git('status','--porcelain');
if(dirty)throw Error('Target checkout must be clean to attribute results to a commit. Preserve changes and use a separate worktree.');
const out=path.resolve(arg('--out')||path.join(os.tmpdir(),'hallway-evaluation-'+Date.now()));
const rel=path.relative(repo,out);
if(!rel||(!rel.startsWith('..'+path.sep)&&!path.isAbsolute(rel)))throw Error('Output must be outside the evaluated checkout.');
if(fs.existsSync(out))throw Error('Use a new output directory; prior evidence is never overwritten.');
fs.mkdirSync(out,{recursive:true});
const report={schema:1,revision,repo,startedAt:new Date().toISOString(),environment:{platform:process.platform,node:process.version},evaluatorSha256:crypto.createHash('sha256').update(fs.readFileSync(__filename)).digest('hex'),scope:'Local checkout, synthetic data. Not deployment or real-device certification.',checks:[]};
function check(id,cmd,a){const r=run(cmd,a,repo);const log=id+'.log';fs.writeFileSync(path.join(out,log),(r.stdout||'')+(r.stderr||'')+(r.error?'\n'+r.error.message:''));report.checks.push({id,status:r.status===0?'PASS':'FAIL',exitCode:r.status,log});}
check('source-contract',process.execPath,['check.cjs']);
check('automated-regressions',process.execPath,['--test','security.test.cjs','ui.test.cjs','capture.test.cjs']);
let browserAvailable=false;try{require.resolve(process.env.HALLWAY_PLAYWRIGHT_PATH||'playwright',{paths:[repo]});browserAvailable=true}catch{}
if(browserAvailable)check('browser-smoke',process.execPath,['test-support/board-browser-check.cjs',path.join(out,'browser')]);
else report.checks.push({id:'browser-smoke',status:'NOT RUN',reason:'Provide Playwright via HALLWAY_PLAYWRIGHT_PATH and Chrome via HALLWAY_CHROME_PATH.'});
for(const [id,reason] of [
 ['phone-comparison-usability','Human acceptance required: useful content on arrival; change scope while viewing results; no scroll-up/down comparison loop. Existing overflow checks do not establish this.'],
 ['actual-data-preview','Verify both profiles privately in the intended preview; synthetic tests do not establish capture ownership, freshness or completeness.'],
 ['real-iphone','Safari/Home Screen, larger text, touch and native Canvas sign-in must be checked on a real device.'],
 ['deployment-identity-and-live-smoke','This runner does not contact production. Verify intended release commit, deployment identity, both live views and recovery separately.']
])report.checks.push({id,status:'NOT RUN',reason});
report.unchanged=git('rev-parse','HEAD')===revision&&!git('status','--porcelain');
report.checks.push({id:'checkout-unchanged',status:report.unchanged?'PASS':'FAIL'});
report.finishedAt=new Date().toISOString();
const fail=report.checks.filter(c=>c.status==='FAIL').length,gaps=report.checks.filter(c=>c.status==='NOT RUN').length;
report.overall=fail?'FAIL':gaps?'INCOMPLETE':'PASS';
fs.writeFileSync(path.join(out,'scorecard.json'),JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(path.join(out,'scorecard.md'),`# Hallway build evaluation\n\nRevision: ${revision}\n\nOverall: **${report.overall}**. ${report.scope}\n\n| Check | Result | Evidence / next action |\n|---|---|---|\n`+report.checks.map(c=>`| ${c.id} | ${c.status} | ${c.log?'['+c.log+']('+c.log+')':c.reason||'Git revision and worktree checked before/after'} |`).join('\n')+'\n\nNo weighted percentage: untested experience and data checks cannot be averaged into a green release score.\n');
console.log(JSON.stringify({revision,overall:report.overall,artifacts:out,failures:fail,notRun:gaps}));
process.exitCode=fail?1:0;
