'use strict';
// Run locally. Secret values are written to private files, never printed.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');

function provision(parent = path.join(__dirname, 'private-data')) {
  fs.mkdirSync(parent, {recursive:true, mode:0o700});
  const directory = fs.mkdtempSync(path.join(parent, 'access-'));
  fs.chmodSync(directory, 0o700);
  if (process.platform === 'win32') {
    const identity = execFileSync('whoami', [], {encoding:'utf8', windowsHide:true}).trim();
    execFileSync('icacls', [directory, '/inheritance:r', '/grant:r', `${identity}:(OI)(CI)F`], {stdio:'pipe', windowsHide:true});
  }
  const config = `HALLWAY_SESSION_SECRET=${crypto.randomBytes(48).toString('base64url')}\n`;
  fs.writeFileSync(path.join(directory,'runtime.env'), config, {flag:'wx',mode:0o600});
  for (const student of ['max','adrian']) {
    fs.writeFileSync(path.join(directory,`${student}-access.txt`), `Hallway ${student} demo access\n\nURL: not deployed yet. Add only the verified HTTPS deployment URL.\nChoose ${student === 'max' ? 'Max' : 'Adrian'} from the sign-in screen. These are fictional fixtures until verified snapshots are installed.\n`, {flag:'wx',mode:0o600});
  }
  return directory;
}
if (require.main === module) {
  try { console.log(`Private access files created at: ${provision()}`); }
  catch { console.error('Could not create protected access files. Check local directory permissions before retrying.'); process.exitCode=1; }
}
module.exports={provision};
