// Vocabulary & sentence checks for 학교 영어 lessons (js/talk*.js) and graded readers (js/readers.js).
// Rules
//  1. Every word (after lemmatizing) is in the 2022 curriculum basic word list (tools/basic3000.txt; the 800 starred
//     elementary words are tools/elem800.txt),
//     or is a word taught in a 학교 영어 lesson of the same grade or earlier (단어 도감),
//     or a name / number / interjection, or a story gloss word (shown with a Korean hint), or in EXTRA below.
//  2. Grade level: per lesson / story, words that are neither taught up to that grade nor closed-class "function" words
//     (including basic-list words that are not starred for elementary school)
//     are counted as above-grade; at most MAX_ABOVE[g] per lesson/story.
//  3. Sentence length: at most MAX_LEN[g] words per sentence (quotes split into their own sentences).
//  4. ≥ 90% of the distinct words used in each grade come from the 3,000-word basic list (tools/basic3000.txt), as the curriculum recommends.
//  5. Structure: unique ids, valid unlocks, 4+ vocab cards, 4+ dex words, quiz answers present, pictures present.
// Usage: node tools/validate_curriculum.mjs [-v]
import fs from 'node:fs';
import { TALK, GRADES } from '../js/talk.js';
import { READERS } from '../js/readers.js';
import { emojiCode } from '../js/emoji.js';

const list = f => new Set(fs.readFileSync(new URL(f, import.meta.url), 'utf8').split('\n').filter(x=>x && !x.startsWith('#')).map(x=>x.trim()));
const ELEM = list('./elem800.txt'), BASIC = list('./basic3000.txt');
const NAMES = new Set(['max','cubi','mia','leo','jun','sora','ella','sam','kim','ms','mr','bolt','santa','busan','seoul','jeju','gyeongju','hallasan','korea','canada','china','brazil','mars','hangeul','block','town','land','cloud','january','february','march','april','may','june','july','august','september','october','november','december','monday','tuesday','wednesday','thursday','friday','saturday','sunday','christmas','tv','mars','earth']);
const INTERJ = new Set(['oh','wow','yay','whoosh','hi','hello','bye','okay','ok','yum','brrr','clap','x','k-pop','kpop','cool','no']);
const NUM = new Set(['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety','hundred','first','second','third','fourth','fifth','ninth','twenty-fifth']);
// deliberately used words outside the list (each one is pictured or glossed where it appears)
const EXTRA = new Set(['stomachache','kimchi','hanbok','cafe','tomato','noodles','hot','dogs','dog','sandwiches','picnics','playground','knee','dentist','meals','seed','soil','sweet','stay','up','mr','snowballs','pancakes','scales','grandparents','swimsuit','smile','tonight','buses','shrimp','change','less','both','ways','dig','gold','shiny']);
const FUNCTION = new Set(('a an the and or but so because if then than to of in on at by for with from about into up down out over under after before ' +
  'i me my mine you your yours he him his she her hers it its we us our they them their this that these those there here ' +
  'be am is are was were do does did have has had can could will would shall should may must not no yes ' +
  'what who whom whose where when why how which all some any many much more most very too also only just again now today ' +
  'go come get make take give put see look say tell like want know think let please thank thanks sorry okay well good bad ' +
  'one two three four five six seven eight nine ten every each other another').split(' '));
const MAX_ABOVE = {3:4, 4:6, 5:9, 6:12};
const MAX_LEN = {3:8, 4:9, 5:10, 6:11};

const IRR = {went:'go',gone:'go',ate:'eat',saw:'see',did:'do',done:'do',had:'have',has:'have',was:'be',were:'be',is:'be',am:'be',are:'be',been:'be',
  made:'make',got:'get',came:'come',ran:'run',took:'take',found:'find',gave:'give',said:'say',told:'tell',thought:'think',bought:'buy',felt:'feel',
  flew:'fly',swam:'swim',rode:'ride',wrote:'write',read:'read',sat:'sit',stood:'stand',slept:'sleep',woke:'wake',won:'win',lost:'lose',met:'meet',
  left:'leave',broke:'break',built:'build',caught:'catch',drew:'draw',drank:'drink',fell:'fall',forgot:'forget',knew:'know',sang:'sing',spoke:'speak',
  dug:'dig',children:'child',leaves:'leaf',more:'many',most:'many',others:'other',these:'this',those:'that',could:'can',would:'will',an:'a',teeth:'tooth',feet:'foot',people:'person',men:'man',women:'woman',better:'good',best:'good',worse:'bad',
  hurt:'hurt',cut:'cut',put:'put',let:'let',him:'he',her:'she',them:'they',us:'we',me:'i',my:'i',your:'you',our:'we',their:'they',his:'he',its:'it'};
const CONTR = {"i'm":['i','be'],"it's":['it','be'],"that's":['that','be'],"what's":['what','be'],"he's":['he','be'],"she's":['she','be'],"there's":['there','be'],
  "let's":['let','we'],"don't":['do','not'],"doesn't":['do','not'],"didn't":['do','not'],"isn't":['be','not'],"aren't":['be','not'],"can't":['can','not'],
  "won't":['will','not'],"shouldn't":['should','not'],"i'll":['i','will'],"you'll":['you','will'],"we'll":['we','will'],"i'd":['i','would'],"you're":['you','be'],
  "they're":['they','be'],"we're":['we','be'],"how's":['how','be'],"o'clock":['clock'],"where's":['where','be'],"who's":['who','be']};

export function words(text){
  return text.replace(/[“”"]/g,' ').replace(/[\u2019\u2018]/g,"'").split(/\s+/).map(t=>t.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g,'')).filter(Boolean);
}
function candidates(w){
  const out = new Set([w]);
  if (CONTR[w]) return CONTR[w];
  if (w.endsWith("'s")) out.add(w.slice(0,-2));
  if (w.endsWith("s'")) out.add(w.slice(0,-2));
  if (IRR[w]) out.add(IRR[w]);
  const add = x => { if (x && x.length > 1) out.add(x); };
  for (const x of [...out]){
    if (IRR[x]) add(IRR[x]);
    if (x.includes('-')) x.split('-').forEach(add);
    if (/ies$/.test(x)) add(x.slice(0,-3)+'y');
    if (/es$/.test(x)) add(x.slice(0,-2));
    if (/s$/.test(x)) add(x.slice(0,-1));
    if (/ied$/.test(x)) add(x.slice(0,-3)+'y');
    if (/ed$/.test(x)){ add(x.slice(0,-2)); add(x.slice(0,-1)); if (/(.)\1ed$/.test(x)) add(x.slice(0,-3)); }
    if (/ing$/.test(x)){ add(x.slice(0,-3)); add(x.slice(0,-3)+'e'); if (/(.)\1ing$/.test(x)) add(x.slice(0,-4)); }
    if (/iest$/.test(x)) add(x.slice(0,-4)+'y');
    if (/est$/.test(x)){ add(x.slice(0,-3)); add(x.slice(0,-2)); if (/(.)\1est$/.test(x)) add(x.slice(0,-4)); }
    if (/ier$/.test(x)) add(x.slice(0,-3)+'y');
    if (/er$/.test(x)){ add(x.slice(0,-2)); add(x.slice(0,-1)); if (/(.)\1er$/.test(x)) add(x.slice(0,-3)); }
    if (/ily$/.test(x)) add(x.slice(0,-3)+'y');
    if (/ly$/.test(x)) add(x.slice(0,-2));
    if (/ful$/.test(x)) add(x.slice(0,-3));
    if (/y$/.test(x)){ add(x.slice(0,-1)); if (/(.)\1y$/.test(x)) add(x.slice(0,-2)); }
    if (/^un/.test(x)) add(x.slice(2));
    const cm = x.match(/^(every|some|any|no)(thing|one|body|where)$/); if (cm){ add(cm[1]); add(cm[2]); }
  }
  return [...out];
}
const dexUpTo = g => new Set(TALK.filter(t=>t.g<=g).flatMap(t=>t.words.map(w=>w[0].toLowerCase())));
const known = (w, set) => candidates(w).some(c=>set.has(c));

function sentences(text){ return text.replace(/[“”]/g,'"').split(/(?<=[.!?])\s+|"/).map(s=>s.trim()).filter(s=>/[a-z]/i.test(s)); }

export function check(){
  const errors = [], warns = [], stats = {};
  const ids = new Set();
  const emojiOk = e => e==='cubi' || e==='hero' || e.startsWith('#') || fs.existsSync(new URL(`../assets/emoji/${emojiCode(e)}.svg`, import.meta.url));
  const units = [
    ...TALK.map(t=>({kind:'lesson', id:t.id, g:t.g, gloss:{}, texts:[...t.lines.map(l=>l[1]), ...t.vocab.map(v=>v[0]), ...(t.read?[t.read.t, t.read.q, ...t.read.opts]:[])], obj:t})),
    ...READERS.map(r=>({kind:'reader', id:r.id, g:r.g, gloss:r.gloss||{}, texts:[r.title, ...r.pages.map(p=>p.t), ...r.quiz.flatMap(q=>[q.q, ...q.opts])], obj:r})),
  ];
  for (const g of GRADES) stats[g] = {types:new Set(), outside:new Set()};
  for (const u of units){
    if (ids.has(u.id)) errors.push(`${u.id}: duplicate id`); ids.add(u.id);
    const dex = dexUpTo(u.g); const above = new Set();
    const glossSet = new Set(Object.keys(u.gloss).flatMap(k=>k.split(' ')));
    for (const text of u.texts){
      for (const s of sentences(text)){ const n = words(s).length; if (n > MAX_LEN[u.g]) errors.push(`${u.id}: sentence too long (${n} > ${MAX_LEN[u.g]}): "${s}"`); }
      for (const w of words(text)){
        if (/^[0-9]/.test(w)) continue;
        const c = candidates(w);
        const isName = c.some(x=>NAMES.has(x)), isNum = c.some(x=>NUM.has(x)), isInt = INTERJ.has(w);
        if (isName || isNum || isInt) continue;
        const inElem = c.some(x=>ELEM.has(x)), inDex = c.some(x=>dex.has(x)), inGloss = c.some(x=>glossSet.has(x)) || glossSet.has(w), inExtra = c.some(x=>EXTRA.has(x));
        const lemma = IRR[w] || c.find(x=>dex.has(x)) || c.find(x=>ELEM.has(x)) || c.find(x=>BASIC.has(x)) || w;
        stats[u.g].types.add(lemma); if (!c.some(x=>BASIC.has(x))) stats[u.g].outside.add(lemma);
        const inBasic = c.some(x=>BASIC.has(x));
        if (!inElem && !inBasic && !inDex && !inGloss && !inExtra){ errors.push(`${u.id}: '${w}' is not in the basic word list, not taught by grade ${u.g}, and not glossed`); continue; }
        if (!inDex && !inGloss && !c.some(x=>FUNCTION.has(x))) above.add(lemma);
      }
    }
    if (above.size > MAX_ABOVE[u.g]) errors.push(`${u.id}: ${above.size} above-grade words (max ${MAX_ABOVE[u.g]}): ${[...above].join(', ')}`);
    else if (above.size && process.argv.includes('-v')) warns.push(`${u.id}: above-grade (ok): ${[...above].join(', ')}`);
    // structure
    if (u.kind==='lesson'){
      const t = u.obj;
      if (t.vocab.length < 4) errors.push(`${t.id}: needs 4+ vocab cards`);
      if (t.words.length < 4) errors.push(`${t.id}: needs 4+ dex words`);
      if (t.lines.length < 2) errors.push(`${t.id}: needs 2+ lines`);
      if (t.g >= 5 && !t.read) errors.push(`${t.id}: grade 5–6 lessons need a reading passage`);
      if (t.read && !(t.read.opts.length >= 2 && t.read.opts[t.read.a])) errors.push(`${t.id}: bad reading question`);
      [t.scene, ...t.vocab.map(v=>v[1]), ...t.words.map(w=>w[1])].forEach(p=>{ if (!emojiOk(p)) errors.push(`${t.id}: missing picture ${p}`); });
    } else {
      const r = u.obj;
      if (!TALK.find(t=>t.id===r.after && t.g===r.g)) errors.push(`${r.id}: unlock lesson ${r.after} not in grade ${r.g}`);
      if (r.quiz.length < 2) errors.push(`${r.id}: needs 2+ quiz questions`);
      r.quiz.forEach(q=>{ if (!q.opts[q.a]) errors.push(`${r.id}: quiz answer missing`); });
      [r.cover, ...r.pages.flatMap(p=>p.pic)].forEach(p=>{ if (!emojiOk(p)) errors.push(`${r.id}: missing picture ${p}`); });
      const want = {3:[6,8],4:[8,8],5:[10,10],6:[10,12]}[r.g]; if (r.pages.length < want[0] || r.pages.length > want[1]) warns.push(`${r.id}: ${r.pages.length} pages`);
    }
  }
  const report = GRADES.map(g=>{ const s = stats[g]; const pct = s.types.size ? 1 - s.outside.size/s.types.size : 1;
    if (pct < 0.9) errors.push(`grade ${g}: only ${(pct*100).toFixed(1)}% of words are from the basic word list (need ≥ 90%)`);
    return {g, types:s.types.size, outside:s.outside.size, pct:(pct*100).toFixed(1), outsideWords:[...s.outside].sort()}; });
  return {errors, warns, report};
}
if (import.meta.url === `file://${process.argv[1]}`){
  const {errors, warns, report} = check();
  for (const r of report) console.log(`grade ${r.g}: ${r.types} word types, ${r.pct}% from the basic 3,000-word list` + (process.argv.includes('-v') ? `  (outside: ${r.outsideWords.join(', ')})` : ''));
  warns.forEach(w=>console.log('  · '+w));
  errors.forEach(e=>console.log('  ✗ '+e));
  console.log(errors.length ? `\n${errors.length} problems` : `\nAll ${TALK.length} lessons and ${READERS.length} readers pass ✔`);
  process.exit(errors.length ? 1 : 0);
}
