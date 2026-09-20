'use strict';
// Explicit local test preview. Never a production fallback or public listener.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createServer}=require('../server.cjs');
const args=process.argv.slice(2),value=k=>args[args.indexOf(k)+1];
const synthetic=args.includes('--synthetic'),privateDir=args.includes('--snapshot-dir')?value('--snapshot-dir'):null;
if(synthetic===!!privateDir)throw Error('Choose exactly one: --synthetic OR --snapshot-dir <private-directory>');
let dir=privateDir&&path.resolve(privateDir);
if(synthetic){
 dir=fs.mkdtempSync(path.join(os.tmpdir(),'hallway-explicit-synthetic-'));
 const {bundleFor}=require('./synthetic-capture.cjs');
 for(const id of ['max','adrian'])fs.writeFileSync(path.join(dir,id+'.json'),JSON.stringify(bundleFor(id)));
}
const port=args.includes('--port')?Number(value('--port')):4317;
if(!Number.isInteger(port)||port<0||port>65535)throw Error('Invalid port');
const server=createServer({snapshotDir:dir});
server.listen(port,'127.0.0.1',()=>console.log(JSON.stringify({url:'http://127.0.0.1:'+server.address().port,mode:synthetic?'SYNTHETIC TEST DATA':'PRIVATE LOCAL CAPTURE',notice:'Loopback only. Not production. Stop with Ctrl+C.'})));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
