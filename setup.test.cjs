'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const crypto=require('node:crypto');
const {provision}=require('./setup.cjs');
test('private provisioning creates distinct high entropy codes with matching hashes, without overwriting',()=>{
  const parent=fs.mkdtempSync(path.join(os.tmpdir(),'hallway-setup-test-'));
  const directories=[];
  try {
    const directory=provision(parent); directories.push(directory);
    const env=Object.fromEntries(fs.readFileSync(path.join(directory,'runtime.env'),'utf8').trim().split('\n').map(line=>line.split('=')));
    assert.doesNotThrow(()=>require('./server.cjs').readConfig(env),'generated settings must be accepted by the server');
    const codes=[];
    for(const student of ['max','adrian']) {
      const code=fs.readFileSync(path.join(directory,`${student}-access.txt`),'utf8').match(/Passcode: (\S+)/)[1];
      codes.push(code); assert.equal(code.length,24);
      const [kind,salt,key]=env[`HALLWAY_${student.toUpperCase()}_PASSCODE_HASH`].split('$');
      assert.equal(kind,'scrypt'); assert.equal(crypto.scryptSync(code,salt,64).toString('hex'),key);
    }
    assert.notEqual(codes[0],codes[1]); assert.equal(env.HALLWAY_SESSION_SECRET.length,64);
    const second=provision(parent); directories.push(second); assert.notEqual(directory,second);
    assert.notEqual(fs.readFileSync(path.join(directory,'runtime.env'),'utf8'),fs.readFileSync(path.join(second,'runtime.env'),'utf8'));
  } finally {
    // Delete only known files inside the fresh temporary directories; no recursive deletion.
    for(const directory of directories) {
      for(const file of ['runtime.env','max-access.txt','adrian-access.txt']) fs.unlinkSync(path.join(directory,file));
      fs.rmdirSync(directory);
    }
    fs.rmdirSync(parent);
  }
});
