'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {provision}=require('./setup.cjs');
test('private provisioning creates a high entropy session secret without overwriting',()=>{
  const parent=fs.mkdtempSync(path.join(os.tmpdir(),'hallway-setup-test-'));
  const directories=[];
  try {
    const directory=provision(parent); directories.push(directory);
    const env=Object.fromEntries(fs.readFileSync(path.join(directory,'runtime.env'),'utf8').trim().split('\n').map(line=>line.split('=')));
    assert.doesNotThrow(()=>require('./server.cjs').readConfig(env),'generated settings must be accepted by the server');
    for(const student of ['max','adrian']) {
      const note=fs.readFileSync(path.join(directory,`${student}-access.txt`),'utf8');
      assert(!note.includes('Passcode:'));
    }
    assert.deepEqual(Object.keys(env),['HALLWAY_SESSION_SECRET']);
    assert.equal(env.HALLWAY_SESSION_SECRET.length,64);
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
