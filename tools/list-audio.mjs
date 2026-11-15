import { collectAudio, segment } from '../js/phonics.js';
import { UNITS } from '../js/data.js';
if (process.argv[2]==='seg'){ for (const u of UNITS) for (const w of (u.words||[])) console.log(u.id, w, segment(w).map(s=>s.g+(s.silent?'(_)':':'+s.p)).join(' ')); }
else console.log(JSON.stringify(collectAudio(),null,1));
