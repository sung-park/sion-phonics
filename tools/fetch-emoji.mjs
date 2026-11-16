// Downloads the Twemoji SVGs (CC-BY 4.0, © Twitter/X and contributors, jdecked fork) used by the app.
import { PIC } from '../js/data.js';
import { emojiCode } from '../js/emoji.js';
import { STORIES } from '../js/stories.js';
import { TALK } from '../js/talk.js';
import { READERS } from '../js/readers.js';
import fs from 'node:fs';
const extra = ['🦸','🏆','⭐','🔥','🔒','🎁','💎','🧱','⛏️','🛡️','👑','🚀','🧪','🔨','🌋','🏙️','☁️','🌿','🪨','⚙️','🎯','🔊','📖','✨','🎉','💪','🧭'];
const story = STORIES.flatMap(s=>[s.cover, ...s.pages.flatMap(p=>p.pic)]).filter(p=>p!=='cubi'&&p!=='hero');
const talk = TALK.flatMap(t=>[t.scene, ...t.vocab.map(v=>v[1]), ...t.words.map(w=>w[1])]).filter(p=>!p.startsWith('#'));
const readers = READERS.flatMap(r=>[r.cover, ...r.pages.flatMap(p=>p.pic)]).filter(p=>p!=='cubi'&&p!=='hero');
const all = new Set([...Object.values(PIC), ...extra, ...story, ...talk, ...readers, '📚','🗣️','📜','💿']);
fs.mkdirSync('assets/emoji',{recursive:true});
let fail=[];
for (const e of all){
  const code = emojiCode(e); const f = `assets/emoji/${code}.svg`;
  if (fs.existsSync(f)) continue;
  const r = await fetch(`https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${code}.svg`);
  if (!r.ok){ fail.push(e+' '+code); continue; }
  fs.writeFileSync(f, await r.text());
}
console.log('emoji', all.size, 'failed', fail);
