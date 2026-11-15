// Block Hero Phonics — curriculum data (original content).
// Sequence follows the scope & sequence of the "Phonics Works" 1–4 series
// (alphabet → short vowels → magic e → blends → long-vowel teams →
// digraphs → r-controlled & other vowels → sight words).
// All words, sentences and pictures here are original to this project.

// ---------- Picture dictionary (emoji rendered with bundled Twemoji SVGs) ----------
export const PIC = {
  apple:'🍎', ant:'🐜', ax:'🪓', bat:'🦇', bee:'🐝', bus:'🚌', cat:'🐱', cup:'☕', cake:'🎂',
  dog:'🐶', duck:'🦆', drum:'🥁', egg:'🥚', elf:'🧝', elephant:'🐘', fox:'🦊', fish:'🐟', fire:'🔥',
  goat:'🐐', gift:'🎁', ghost:'👻', hero:'🦸', hat:'🎩', house:'🏠', insect:'🐞', inch:'📏',
  juice:'🧃', jacket:'🧥', jar:'🫙', key:'🔑', kite:'🪁', king:'🤴', lava:'🌋', leaf:'🍃', lion:'🦁',
  map:'🗺️', moon:'🌙', mouse:'🐭', net:'🥅', nose:'👃', nest:'🪺', ox:'🐂', octopus:'🐙', otter:'🦦',
  pig:'🐷', pick:'⛏️', pizza:'🍕', queen:'👸', question:'❓', robot:'🤖', rocket:'🚀', rabbit:'🐰',
  sword:'🗡️', sun:'☀️', snake:'🐍', tent:'⛺', tiger:'🐯', tree:'🌳', umbrella:'☂️', up:'⬆️',
  van:'🚐', violin:'🎻', vest:'🦺', web:'🕸️', wolf:'🐺', watch:'⌚', box:'📦', six:'6️⃣',
  yoyo:'🪀', yarn:'🧶', zap:'⚡', zebra:'🦓', zombie:'🧟',
  // short vowels
  rat:'🐀', sad:'😢', mad:'😠', dad:'👨', cap:'🧢', nap:'😴', tap:'🚰', pot:'🍲', hot:'🥵',
  dot:'🔴', log:'🪵', fog:'🌫️', hog:'🐗', jog:'🏃', mop:'🧹', hop:'🐇', pop:'🎈', pet:'🐕', wet:'💦',
  jet:'✈️', vet:'🩺', ten:'🔟', hen:'🐔', pen:'🖊️', red:'🟥', bed:'🛏️', dig:'⛏️', wig:'💇',
  sit:'🪑', kit:'🧰', pin:'📌', win:'🏆', fin:'🦈', bin:'🗑️', big:'🐘', bug:'🐛', hug:'🤗', mug:'☕',
  jug:'🏺', cut:'✂️', hut:'🛖', nut:'🥜', run:'🏃', bun:'🍞', fun:'🎉', pup:'🐶', tub:'🛁',
  // magic e
  cape:'🦸', tape:'📼', lake:'🏞️', game:'🎮', gate:'🚧', wave:'🌊', name:'📛', bike:'🚲', five:'5️⃣',
  nine:'9️⃣', dive:'🤿', mine:'⛏️', pine:'🌲', dime:'🪙', bone:'🦴', rope:'🪢', home:'🏠',
  rose:'🌹', stone:'🪨', cone:'🍦', hole:'🕳️', note:'🎵', globe:'🌍', cube:'🧊', tube:'🧪', cute:'🥰',
  mule:'🫏', tune:'🎶', flute:'🪈', dune:'🏜️', rule:'📏', smile:'😊', slide:'🛝', ride:'🚲', hike:'🥾',
  // blends
  clap:'👏', clip:'📎', club:'♣️', plate:'🍽️', plane:'✈️', plug:'🔌', plant:'🌱', plum:'🍑', glad:'😄',
  glass:'🥛', glove:'🧤', frog:'🐸', frame:'🖼️', drip:'💧', dress:'👗', drop:'💧', grin:'😁', grass:'🌿',
  grape:'🍇', spin:'🌀', spot:'🔵', sled:'🛷', slime:'🟢', slip:'🍌', stop:'🛑', step:'👣', stem:'🌱', star:'⭐',
  // long vowels
  rain:'🌧️', mail:'📬', nail:'💅', snail:'🐌', train:'🚆', paint:'🎨', day:'🌞', play:'🎮', clay:'🏺',
  tray:'🍽️', eat:'😋', sea:'🌊', tea:'🍵', read:'📖', beam:'🔦', bee2:'🐝', feet:'🦶', green:'🟩',
  sleep:'😴', seed:'🌱', sheep:'🐑', tie:'👔', pie:'🥧', night:'🌃', light:'💡', right:'➡️', high:'🔝',
  fly:'🪰', cry:'😭', sky:'🌌', spy:'🕵️', baby:'👶', happy:'😃', candy:'🍬', puppy:'🐶', bunny:'🐰', pony:'🐴',
  boat:'⛵', coat:'🧥', road:'🛣️', soap:'🧼', toad:'🐸', bowl:'🥣', snow:'❄️', glow:'✨', blow:'🌬️', crow:'🐦',
  blue:'🔵', clue:'🔍', glue:'🧴', new:'🆕', stew:'🍲', flew:'🕊️', grew:'🌱', chew:'😬',
  // digraphs
  chip:'🍟', cheese:'🧀', chest:'🧰', chick:'🐤', lunch:'🍱', ship:'🚢', shell:'🐚', dish:'🍽️',
  shark:'🦈', brush:'🪥', phone:'📱', photo:'📷', dolphin:'🐬', graph:'📈', whale:'🐋', wheel:'🛞',
  white:'⬜', wheat:'🌾', quack:'🦆', quiz:'❓', quilt:'🛏️', clock:'🕰️', rock:'🪨', sock:'🧦', kick:'🦵',
  block:'🧱', truck:'🚚', bath:'🛁', math:'➗', thumb:'👍', three:'3️⃣', ring:'💍', wing:'🪽', sing:'🎤',
  pink:'🩷', sink:'🚰', drink:'🥤', skunk:'🦨', think:'🤔', king2:'🤴',
  // other vowels
  coin:'🪙', oil:'🛢️', point:'👉', boy:'👦', toy:'🧸', cloud:'☁️', mouth:'👄', cow:'🐮', owl:'🦉',
  crown:'👑', clown:'🤡', town:'🏘️', food:'🍔', pool:'🏊', tool:'🔧', boot:'👢', spoon:'🥄', broom:'🧹',
  zoo:'🦒', book:'📖', look:'👀', foot:'🦶', hook:'🪝', wood:'🪵', ball:'⚽', wall:'🧱', tall:'🦒',
  hawk:'🦅', saw:'🪚', paw:'🐾', draw:'✏️', straw:'🥤', car:'🚗', farm:'🚜', arm:'💪', corn:'🌽',
  fork:'🍴', horn:'📯', horse:'🐴', storm:'⛈️', torch:'🔦', girl:'👧', bird:'🐦', shirt:'👕', surf:'🏄',
  burn:'🔥', turtle:'🐢', purple:'🟣', write:'✍️', wrap:'🌯', wrench:'🔧', knit:'🧶', knock:'🚪',
  knee:'🦵', knife:'🔪', knot:'🪢', fern:'🌿', dark:'🌑', jar2:'🫙', sauce:'🥫', launch:'🚀',
};

// ---------- Phonemes ----------
// id → { ipa, ko (parent-friendly hint), say (how a parent might model it) }
export const PHONEMES = {
  a:{ipa:'æ',hint:'애 (apple의 a)'}, e:{ipa:'ɛ',hint:'에 (egg의 e)'}, i:{ipa:'ɪ',hint:'이 (짧게, it)'},
  o:{ipa:'ɑ',hint:'아 (ox의 o)'}, u:{ipa:'ʌ',hint:'어 (up의 u)'},
  b:{ipa:'b'}, c:{ipa:'k'}, d:{ipa:'d'}, f:{ipa:'f'}, g:{ipa:'g'}, h:{ipa:'h'}, j:{ipa:'dʒ'}, k:{ipa:'k'},
  l:{ipa:'l'}, m:{ipa:'m'}, n:{ipa:'n'}, p:{ipa:'p'}, kw:{ipa:'kw'}, r:{ipa:'r'}, s:{ipa:'s'}, t:{ipa:'t'},
  v:{ipa:'v'}, w:{ipa:'w'}, ks:{ipa:'ks'}, y:{ipa:'j'}, z:{ipa:'z'},
  A:{ipa:'eɪ',hint:'에이 (긴 a)'}, E:{ipa:'iː',hint:'이- (긴 e)'}, I:{ipa:'aɪ',hint:'아이 (긴 i)'},
  O:{ipa:'oʊ',hint:'오우 (긴 o)'}, U:{ipa:'juː',hint:'유- (긴 u)'}, oo:{ipa:'uː',hint:'우- (긴 oo)'},
  uu:{ipa:'ʊ',hint:'우 (짧은 oo, book)'}, oi:{ipa:'ɔɪ',hint:'오이'}, ow:{ipa:'aʊ',hint:'아우'},
  aw:{ipa:'ɔː',hint:'오- / 아-'}, ar:{ipa:'ɑr',hint:'아r'}, or:{ipa:'ɔr',hint:'오r'}, er:{ipa:'ɝ',hint:'어r'},
  ch:{ipa:'tʃ',hint:'취'}, sh:{ipa:'ʃ',hint:'쉬-'}, th:{ipa:'θ',hint:'혀를 살짝 물고 쓰-'},
  dh:{ipa:'ð',hint:'혀를 살짝 물고 드-'}, ng:{ipa:'ŋ',hint:'응 (콧소리)'}, nk:{ipa:'ŋk',hint:'응크'},
};

// default phoneme for a grapheme (context rules handled in segmenter)
export const GRAPHEME_SOUND = {
  a:'a', e:'e', i:'i', o:'o', u:'u', b:'b', c:'c', d:'d', f:'f', g:'g', h:'h', j:'j', k:'k', l:'l',
  m:'m', n:'n', p:'p', q:'kw', qu:'kw', r:'r', s:'s', t:'t', v:'v', w:'w', x:'ks', y:'y', z:'z',
  a_e:'A', i_e:'I', o_e:'O', u_e:'U', e_e:'E',
  ai:'A', ay:'A', ea:'E', ee:'E', ie:'I', igh:'I', oa:'O', ow:'O', ue:'oo', ew:'oo',
  ch:'ch', sh:'sh', th:'th', ph:'f', wh:'w', ck:'k', ng:'ng', nk:'nk', wr:'r', kn:'n',
  oi:'oi', oy:'oi', ou:'ow', oo:'oo', au:'aw', aw:'aw', ar:'ar', or:'or', er:'er', ir:'er', ur:'er',
  ll:'l', ss:'s', ff:'f', zz:'z', tch:'ch', dge:'j', le:'l', mb:'m', all:'aw',
};

// ---------- Letters (Book 1, Units 1–8) ----------
export const LETTERS = {
  a:{key:'apple', words:['apple','ant','ax']}, b:{key:'bat', words:['bat','bee','bus']},
  c:{key:'cat', words:['cat','cup','cake']}, d:{key:'dog', words:['dog','duck','drum']},
  e:{key:'egg', words:['egg','elf','elephant']}, f:{key:'fox', words:['fox','fish','fire']},
  g:{key:'goat', words:['goat','gift','ghost']}, h:{key:'hero', words:['hero','hat','house']},
  i:{key:'insect', words:['insect','inch']}, j:{key:'juice', words:['juice','jacket','jar']},
  k:{key:'key', words:['key','kite','king']}, l:{key:'lava', words:['lava','leaf','lion']},
  m:{key:'map', words:['map','moon','mouse']}, n:{key:'net', words:['net','nose','nest']},
  o:{key:'ox', words:['ox','octopus','otter']}, p:{key:'pig', words:['pig','pick','pizza']},
  q:{key:'queen', words:['queen','question']}, r:{key:'robot', words:['robot','rocket','rabbit']},
  s:{key:'sword', words:['sword','sun','snake']}, t:{key:'tent', words:['tent','tiger','tree']},
  u:{key:'umbrella', words:['umbrella','up']}, v:{key:'van', words:['van','violin','vest']},
  w:{key:'web', words:['web','wolf','watch']}, x:{key:'box', words:['box','fox','six'], final:true},
  y:{key:'yarn', words:['yarn','yoyo']}, z:{key:'zap', words:['zap','zebra','zombie']},
};

// Spoken form for words whose spelling differs from what we send to TTS
export const SAY = { yoyo:'yo-yo', ax:'ax', read:'reed', bee2:'bee', king2:'king', jar2:'jar' };
// Display form
export const SHOW = { yoyo:'yo-yo', pick:'pick', bee2:'bee', king2:'king', jar2:'jar' };

// ---------- Units ----------
// type: letters | short | magic | blend | team | digraph | sight
// focus: graphemes taught; families: rimes; words: decodable words; sentences: decodable sentences
export const UNITS = [
  // ===== Book 1: Alphabet =====
  {id:'b1u1', book:1, unit:1, type:'letters', title:'Aa Bb Cc', focus:['a','b','c']},
  {id:'b1u2', book:1, unit:2, type:'letters', title:'Dd Ee Ff', focus:['d','e','f']},
  {id:'b1u3', book:1, unit:3, type:'letters', title:'Gg Hh Ii', focus:['g','h','i']},
  {id:'b1u4', book:1, unit:4, type:'letters', title:'Jj Kk Ll', focus:['j','k','l']},
  {id:'b1u5', book:1, unit:5, type:'letters', title:'Mm Nn Oo', focus:['m','n','o']},
  {id:'b1u6', book:1, unit:6, type:'letters', title:'Pp Qq Rr', focus:['p','q','r']},
  {id:'b1u7', book:1, unit:7, type:'letters', title:'Ss Tt Uu Vv', focus:['s','t','u','v']},
  {id:'b1u8', book:1, unit:8, type:'letters', title:'Ww Xx Yy Zz', focus:['w','x','y','z']},
  // ===== Book 1: Short vowels =====
  {id:'b1u9', book:1, unit:9, type:'short', title:'Short a', focus:['a'], families:['at','ad','ap'],
    words:['cat','hat','bat','rat','sat','mat','dad','sad','mad','bad','had','map','cap','nap','tap','zap'],
    sentences:['A cat sat on a mat.','The bat can zap!','Dad has a map.','I tap the cap.','Sam had a nap.']},
  {id:'b1u10', book:1, unit:10, type:'short', title:'Short o', focus:['o'], families:['ot','og','op'],
    words:['pot','hot','dot','not','got','dog','log','fog','hog','jog','mop','top','hop','pop'],
    sentences:['The dog can hop.','A hot pot!','Hop on the log.','Bob got a mop.','The hog is not hot.']},
  {id:'b1u11', book:1, unit:11, type:'short', title:'Short e', focus:['e'], families:['et','en','ed'],
    words:['net','pet','wet','jet','vet','get','ten','hen','pen','men','red','bed','fed','led'],
    sentences:['The pet is wet.','Ten hens get fed.','A red jet!','Get in bed, Ted.','The vet has a net.']},
  {id:'b1u12', book:1, unit:12, type:'short', title:'Short i', focus:['i'], families:['ig','it','in'],
    words:['pig','big','dig','wig','sit','hit','kit','bit','pin','win','fin','bin','six'],
    sentences:['The pig can dig.','A big pig sits.','I win a pin!','Dig, dig, dig!','Sit in the bin.']},
  {id:'b1u13', book:1, unit:13, type:'short', title:'Short u', focus:['u'], families:['ug','ut','un'],
    words:['bug','hug','mug','rug','jug','dug','cut','hut','nut','but','sun','run','fun','bun','pup','tub'],
    sentences:['A bug is in the mug.','Run in the sun!','The pup can hug.','Cut the nut.','It is fun to dig.']},
  // ===== Book 2: Magic e =====
  {id:'b2u1', book:2, unit:1, type:'magic', title:'a_e', focus:['a_e'], pairs:[['cap','cape'],['tap','tape'],['can','cane'],['mad','made'],['hat','hate']],
    words:['cape','tape','cake','lake','game','gate','wave','name','cave','made'],
    sentences:['The hero has a cape.','Dig in the cave.','I bake a cake.','Wave at the gate!','We made a game.']},
  {id:'b2u2', book:2, unit:2, type:'magic', title:'i_e', focus:['i_e'], pairs:[['pin','pine'],['kit','kite'],['bit','bite'],['dim','dime'],['rid','ride']],
    words:['kite','bike','five','nine','dive','mine','pine','dime','ride','hike','bite','line'],
    sentences:['I ride a bike.','Five kites!','Dig in the mine.','The kite is in the pine.','Nine fish dive.']},
  {id:'b2u3', book:2, unit:3, type:'magic', title:'o_e', focus:['o_e'], pairs:[['hop','hope'],['not','note'],['rob','robe'],['cod','code'],['rod','rode']],
    words:['bone','rope','nose','home','rose','cone','hole','note','code','pole','robe','hope'],
    sentences:['The dog has a bone.','Go home!','A rope in a hole.','I hope it is a cone.','Get the code.']},
  {id:'b2u4', book:2, unit:4, type:'magic', title:'u_e', focus:['u_e'], pairs:[['cub','cube'],['tub','tube'],['cut','cute'],['us','use']],
    words:['cube','tube','cute','mule','tune','dune','rule','use','huge','June'],
    sentences:['A cute cube!','Use the tube.','The mule is huge.','Hum a tune.','Run up the dune.']},
  // ===== Book 2: Blends =====
  {id:'b2u5', book:2, unit:5, type:'blend', title:'cl pl gl', focus:['cl','pl','gl'],
    words:['clap','clip','club','plan','plum','plate','plane','plug','plant','glad','glass','glide'],
    sentences:['Clap, clap, clap!','The plane can glide.','I am glad.','Plug it in.','A plum on a plate.']},
  {id:'b2u6', book:2, unit:6, type:'blend', title:'fr dr gr', focus:['fr','dr','gr'],
    words:['frog','frame','drum','drip','dress','drop','grab','grin','grass','grape','grid','drive'],
    sentences:['A frog on a log.','Grab the grapes!','Drop the drum.','The grass is wet.','I grin at Fred.']},
  {id:'b2u7', book:2, unit:7, type:'blend', title:'sp sl st', focus:['sp','sl','st'],
    words:['spin','spot','spell','sled','slim','slip','slide','slime','stop','step','stem','stone'],
    sentences:['Spin, spin, spin!','The slime can slide.','Stop on the step.','A stone sled!','Spot the slime.']},
  // ===== Book 2: Long-vowel teams =====
  {id:'b2u8', book:2, unit:8, type:'team', title:'ai ay', focus:['ai','ay'],
    words:['rain','mail','nail','snail','train','paint','tail','day','play','clay','tray','stay','gray'],
    sentences:['Play in the rain.','The snail is gray.','Paint the train.','Stay and play!','A day on a train.']},
  {id:'b2u9', book:2, unit:9, type:'team', title:'ea ee', focus:['ea','ee'],
    words:['eat','sea','tea','leaf','read','beam','dream','bee2','feet','green','sleep','seed','tree'],
    sentences:['I see a green tree.','A bee on a leaf.','Eat and sleep.','Read by the sea.','Beam me up!']},
  {id:'b2u10', book:2, unit:10, type:'team', title:'ie igh', focus:['ie','igh'],
    words:['tie','pie','lie','tried','night','light','right','high','might','bright'],
    sentences:['Light up the night!','The pie is high.','A bright light.','Tie it tight.','Go right!']},
  {id:'b2u11', book:2, unit:11, type:'team', title:'y', focus:['y'], ySounds:true,
    words:['my','fly','cry','sky','dry','try','spy','baby','happy','candy','puppy','bunny','pony'],
    sentences:['Fly in the sky!','The baby is happy.','My puppy can try.','A spy in the sky!','The bunny has candy.']},
  {id:'b2u12', book:2, unit:12, type:'team', title:'oa ow', focus:['oa','ow'],
    words:['boat','coat','goat','road','soap','toad','bowl','snow','glow','slow','grow','blow','crow'],
    sentences:['A goat in a boat.','The snow can glow.','A toad on the road.','Grow, grow, grow!','Blow on the bowl.']},
  {id:'b2u13', book:2, unit:13, type:'team', title:'ue ew', focus:['ue','ew'],
    words:['blue','clue','glue','true','new','few','chew','stew','flew','grew','crew'],
    sentences:['A new clue!','The crew flew.','Glue the blue gem.','It is true!','The plant grew.']},
  // ===== Book 3: Digraphs =====
  {id:'b3u1', book:3, unit:1, type:'digraph', title:'ch sh', focus:['ch','sh'],
    words:['chip','chop','chin','chest','cheese','chick','lunch','ship','shop','fish','dish','shell','sheep','brush'],
    sentences:['Chop the tree.','A chest of gems!','The ship has fish.','A chick in a shell.','Shh! The sheep sleep.']},
  {id:'b3u2', book:3, unit:2, type:'digraph', title:'ph wh', focus:['ph','wh'],
    words:['phone','photo','graph','dolphin','whale','wheel','white','whip','wheat','when'],
    sentences:['Phil has a phone.','A white whale!','The wheel can spin.','Take a photo.','When can we go?']},
  {id:'b3u3', book:3, unit:3, type:'digraph', title:'qu ck', focus:['qu','ck'],
    words:['queen','quick','quiz','quilt','quack','duck','clock','rock','sock','kick','pick','block','truck','stack'],
    sentences:['The queen is quick.','Pick up the rock.','Stack the blocks!','Quack, quack, duck!','A quick kick!']},
  {id:'b3u4', book:3, unit:4, type:'digraph', title:'th', focus:['th'], thSounds:true,
    words:['bath','math','moth','thin','thick','three','thumb','this','that','then','them','with'],
    sentences:['Three thin moths.','This is math.','Thumbs up!','That bath is hot.','Then we got them.']},
  {id:'b3u5', book:3, unit:5, type:'digraph', title:'ng nk', focus:['ng','nk'],
    words:['king2','ring','sing','wing','swing','long','strong','pink','sink','wink','drink','think','skunk','bank'],
    sentences:['The king can sing.','Think pink!','A strong wing.','Drink at the sink.','Swing, swing, swing!']},
  // ===== Book 3: Other vowels & r-controlled =====
  {id:'b3u6', book:3, unit:6, type:'team', title:'oi oy', focus:['oi','oy'],
    words:['coin','oil','boil','soil','point','join','boy','toy','joy','enjoy'],
    sentences:['The boy has a coin.','Join the team!','A toy in the soil.','Point at the coin.','Oh, joy!']},
  {id:'b3u7', book:3, unit:7, type:'team', title:'ou ow', focus:['ou','ow'], owSound:'ow',
    words:['cloud','out','house','mouse','mouth','loud','shout','cow','owl','town','crown','brown','down','wow'],
    sentences:['A loud cloud!','The cow is brown.','Get out of the house.','An owl in town.','Wow, a crown!']},
  {id:'b3u8', book:3, unit:8, type:'team', title:'oo', focus:['oo'], ooSounds:true,
    words:['moon','zoo','food','pool','tool','boot','spoon','broom','book','look','cook','foot','hook','wood'],
    sentences:['Look at the moon.','Use the wood tool.','A book at the pool.','Cook the food.','A boot on my foot.']},
  {id:'b3u9', book:3, unit:9, type:'team', title:'a au aw', focus:['all','au','aw'],
    words:['ball','tall','wall','call','fall','sauce','haul','launch','hawk','saw','paw','draw','straw','jaw'],
    sentences:['A tall wall.','Draw a hawk.','The ball can fall.','Saw the log!','Launch the rocket!']},
  {id:'b3u10', book:3, unit:10, type:'team', title:'ar or', focus:['ar','or'],
    words:['car','star','jar','farm','arm','park','dark','shark','corn','fork','horn','horse','storm','torch'],
    sentences:['The car is far.','A star in the dark.','A storm in the north.','Light the torch!','The horse has corn.']},
  {id:'b3u11', book:3, unit:11, type:'team', title:'er ir ur', focus:['er','ir','ur'],
    words:['her','fern','herd','girl','bird','shirt','dirt','first','surf','burn','turn','hurt','purple','turtle'],
    sentences:['The girl can surf.','A bird in the dirt.','Turn left first.','Her shirt is purple.','The turtle is slow.']},
  {id:'b3u12', book:3, unit:12, type:'digraph', title:'wr kn', focus:['wr','kn'],
    words:['write','wrap','wrist','wrench','wreck','knit','knock','knee','knife','knot','know'],
    sentences:['Knock, knock!','Write on the wrap.','I know the knot.','Fix it with a wrench.','Knit a hat.']},
  // ===== Book 4: Sight words =====
  ...[
    ['What Is This?',['what','is','this','that'],['What is this?','This is a gem.','That is my pick.']],
    ['Jump In, Jump Out',['jump','in','out','the'],['Jump in the pool!','Jump out!','The pig is in.']],
    ['Can You See?',['I','see','of','no','yes'],['I see a block.','Yes, a bag of gems!','No, I see a pig.']],
    ['Who Can Help?',['who','help','me','he','she'],['Who can help me?','He can help.','She can help me.']],
    ['Look! Look!',['look','over','at','big','little'],['Look at the big cube.','Look over there!','A little pig!']],
    ['Can I Play?',['can','play','here','there'],['Can I play here?','You can play there.','Play here with me.']],
    ['Let\u2019s Eat!',['eat','some','too','good','give'],['Give me some cake.','It is good!','I want some too.']],
    ['Let\u2019s Go!',['let','go','our','fly','ride'],['Let us go!','Our team can fly.','Ride the rail.']],
    ['Where Are We Going?',['are','we','to','going','soon'],['We are going to the cave.','We go soon.','Are we there?']],
    ['Please and Thank You',['one','two','three','please','thank','may','have','you'],['May I have one, please?','Thank you!','You have two gems.']],
    ['Who Are They?',['they','do','my','know','them'],['They are my team.','Do you know them?','I know they can fly.']],
    ['I Want',['want','an','and','but','any'],['I want an apple.','I want a cape and a mask.','Do you have any?']],
    ['In, On!',['was','blue','on','black','now'],['It was on the block.','The blue gem is black now.','Now it is on!']],
    ['How Old Are You?',['how','old','am','say','again'],['How old are you?','I am nine.','Say it again!']],
    ['I Said Stop!',['stop','walk','not','red','said'],['I said stop!','Walk, not run.','Red means stop.']],
    ['Let\u2019s Make a Cake!',['make','take','for','him','her'],['Make a cake for him.','Take it to her.','It is for you!']],
    ['Where Are You From?',['from','when','four','come','came'],['Where are you from?','Four heroes came.','Come when I call.']],
    ['What Do You Think?',['his','think','so','pretty','funny'],['I think it is funny.','His cape is so pretty.','So cool!']],
    ['I Live with My Family',['live','with','by','all','round'],['I live with my dad and mom.','We all sit by the fire.','The ball is round.']],
    ['Where Did I Put It?',['where','did','put','up','down'],['Where did I put my ring?','Put it up there.','Did it fall down?']],
  ].map(([title,sight,sentences],i)=>({id:'b4u'+(i+1), book:4, unit:i+1, type:'sight', title, sight, sentences})),
];

export const WORLDS = [
  {id:'w1', name:'시작의 초원', en:'Starting Meadow', topic:'알파벳', biome:'grass', book:1, units:['b1u1','b1u2','b1u3','b1u4','b1u5','b1u6','b1u7','b1u8'], suit:'helmet'},
  {id:'w2', name:'얕은 동굴', en:'Shallow Caves', topic:'단모음', biome:'stone', book:1, units:['b1u9','b1u10','b1u11','b1u12','b1u13'], suit:'gloves'},
  {id:'w3', name:'깊은 광산', en:'Deep Mine', topic:'매직 e', biome:'mine', book:2, units:['b2u1','b2u2','b2u3','b2u4'], suit:'cape'},
  {id:'w4', name:'정글 신전', en:'Jungle Temple', topic:'자음 블렌드', biome:'jungle', book:2, units:['b2u5','b2u6','b2u7'], suit:'boots'},
  {id:'w5', name:'바다 유적', en:'Ocean Ruins', topic:'장모음 팀', biome:'ocean', book:2, units:['b2u8','b2u9','b2u10','b2u11','b2u12','b2u13'], suit:'jetpack'},
  {id:'w6', name:'고대 도시', en:'Ancient Deep City', topic:'이중자음', biome:'ancient', book:3, units:['b3u1','b3u2','b3u3','b3u4','b3u5'], suit:'shield'},
  {id:'w7', name:'불타는 지하세계', en:'Burning Underworld', topic:'파워 모음', biome:'nether', book:3, units:['b3u6','b3u7','b3u8','b3u9','b3u10','b3u11','b3u12'], suit:'core'},
  {id:'w8', name:'끝의 차원', en:'The Final Dimension', topic:'사이트워드', biome:'end', book:4, units:Array.from({length:20},(_,i)=>'b4u'+(i+1)), suit:'belt'},
];

// Letter-confusion trainer
export const CONFUSIONS = [
  {id:'bd', letters:['b','d'], title:'b ↔ d', tip:'bed 트릭: 두 주먹으로 엄지척! 주먹끼리 마주 보게 하면 왼손은 b(막대 → 동그라미), 오른손은 d(동그라미 → 막대). 왼쪽부터 읽으면 b-e-d, 침대 모양이에요!',
    rules:{b:'b는 막대 먼저, 그다음 배(볼록)가 오른쪽!', d:'d는 동그라미 먼저, 그다음 막대가 오른쪽!'},
    words:[['bad','dad'],['big','dig'],['bug','dug'],['bed','bed'],['bat','bat']]},
  {id:'pq', letters:['p','q'], title:'p ↔ q', tip:'p는 동그라미가 오른쪽, q는 동그라미가 왼쪽. q 옆에는 항상 u 친구가 따라와요 (qu)!',
    rules:{p:'p는 막대가 아래로, 동그라미는 오른쪽 위!', q:'q는 동그라미가 왼쪽, 꼬리는 아래로!'}, words:[]},
  {id:'bdpq', letters:['b','d','p','q'], title:'b d p q', tip:'네 글자는 모두 막대 + 동그라미예요. 막대가 위로 솟으면 b, d / 아래로 내려가면 p, q!',
    rules:{b:'위로 솟은 막대, 동그라미 오른쪽', d:'위로 솟은 막대, 동그라미 왼쪽', p:'아래로 내려간 막대, 동그라미 오른쪽', q:'아래로 내려간 막대, 동그라미 왼쪽'},
    words:[['bin','pin'],['bat','pat'],['dot','pot'],['big','pig']]},
  {id:'mn', letters:['m','n'], title:'m ↔ n', tip:'m은 산봉우리 2개(mountains), n은 산봉우리 1개!',
    rules:{m:'봉우리 두 개', n:'봉우리 한 개'}, words:[['map','nap'],['mat','nap']]},
  {id:'nu', letters:['n','u'], title:'n ↔ u', tip:'n은 아치(다리) 모양, u는 물을 담는 컵 모양!',
    rules:{n:'위가 둥근 아치', u:'아래가 둥근 컵'}, words:[]},
  {id:'il', letters:['i','l'], title:'i ↔ l', tip:'i는 머리에 점이 있어요. l은 점 없이 키가 큰 막대!',
    rules:{i:'짧은 막대 + 점', l:'키 큰 막대, 점 없음'}, words:[]},
  {id:'hn', letters:['h','n'], title:'h ↔ n', tip:'h는 등받이가 높은 의자, n은 낮은 의자!',
    rules:{h:'왼쪽 막대가 높이 솟아요', n:'키가 낮아요'}, words:[['hat','nap']]},
  {id:'ft', letters:['f','t'], title:'f ↔ t', tip:'f는 위가 지팡이처럼 휘어요. t는 십자가 모양, 아래가 살짝 휘어요.',
    rules:{f:'위가 휘어요', t:'아래가 휘어요'}, words:[]},
];

export const PRAISE = ['Great job!','You did it!','Awesome!','Super!','Nice work!','Way to go, hero!','You got it!','Amazing!','Power up!','Fantastic!'];
export const ENCOURAGE = ['Almost! Try again.','Listen again.','Good try!'];
export const EN_LINES = ['Mission complete!','Level up!','New block!','New treasure!','Let\u2019s go, hero!','Magic e!'];

// Korean voice prompts (key → text)
export const KO = {
  start:'미션 시작! 같이 해 보자.',
  intro:'글자를 눌러서 소리를 들어 봐. 그림도 눌러 봐!',
  pick_sound:'소리를 잘 듣고, 맞는 글자를 골라 봐.',
  pick_word:'단어를 잘 듣고, 맞는 단어를 골라 봐.',
  first_sound:'그림 이름은 어떤 소리로 시작할까?',
  case_match:'짝꿍 소문자를 찾아 봐.',
  blend:'블록을 하나씩 눌러서 소리를 이어 봐.',
  blend_go:'이제 단어 전체를 눌러 봐!',
  build:'소리를 듣고, 블록을 순서대로 놓아 봐.',
  pic_match:'단어를 읽고, 맞는 그림을 골라 봐.',
  sentence:'문장을 읽어 봐. 모르는 단어는 눌러서 들어 봐.',
  find_word:'이 단어를 문장에서 찾아 눌러 봐.',
  magic:'매직 e를 붙여 봐. 소리가 어떻게 바뀔까?',
  sight:'이 단어는 통째로 외우는 단어야. 잘 보고 들어 봐.',
  tap_all:'이 글자를 모두 찾아서 눌러 봐.',
  which_letter:'어떤 글자일까? 잘 보고 골라 봐.',
  hint:'괜찮아! 반짝이는 걸 눌러 봐.',
  done:'미션 완료! 정말 멋졌어.',
  reward:'새 블록을 얻었어!',
  rest:'오늘 정말 열심히 했어. 잠깐 쉬어 갈까?',
  welcome:'안녕, 히어로! 오늘도 블록을 모으러 가자.',
  trainer:'헷갈리는 글자 훈련소에 온 걸 환영해!',
};
