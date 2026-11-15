// Decodable story scrolls (original). Each story unlocks when the boss mission of `unlock` is cleared
// and uses only phonics patterns taught up to that unit + the allowed sight words / names below.
// Checked by tools/validate_stories.mjs.
// pic: emoji shown on the page ('cubi' = mascot block, 'hero' = the child's hero sprite)

// High-frequency "heart words" a story may use from the short-vowel world on (taught as whole words).
// Parent-approved: a handful of very basic, very common words may appear before their phonics unit so the
// sentences sound natural (Dolch / Fry first-100 words only, never arbitrary vocabulary).
export const STORY_SIGHT = ['a','the','i','is','to','and','of','you','he','she','we','was','said','go','no','so','my','do','are','his','has','as',
  'look','see','they','what','this','that','with','help','out','into','thank','good','over','open','where','here','there','come','have','for',
  'one','two','little','all','be','me','by','put','your','oh','in','on','it','at','an','not','can','up'];
// Character names (always allowed). Cubi = 큐비, Max = generic block hero.
export const STORY_NAMES = ['max','cubi','bob','ted','june','sam','pam','ben'];

export const STORIES = [
  // ---------- w1 Starting Meadow (alphabet: picture key words) ----------
  {id:'st_abc', unlock:'b1u8', world:'w1', title:'A to Z Walk', ko:'알파벳 산책', cover:'🌳', pages:[
    {t:'Max and Cubi.', pic:['hero','cubi']},
    {t:'A cat and a hat.', pic:['🐱','🎩']},
    {t:'A fox and a box.', pic:['🦊','📦']},
    {t:'A bee and a tree.', pic:['🐝','🌳']},
    {t:'A robot and a rocket!', pic:['🤖','🚀']},
    {t:'A zebra and a yo-yo. Zap!', pic:['🦓','🪀','⚡']},
  ]},
  // ---------- w2 Shallow Caves (short vowels: one story per unit) ----------
  {id:'st_a', unlock:'b1u9', world:'w2', title:'Max and the Cat', ko:'맥스와 고양이', cover:'🐱', pages:[
    {t:'Max has a map and a cap.', pic:['hero','🗺️','🧢']},
    {t:'A fat cat ran at Max.', pic:['🐱','💨']},
    {t:'The cat sat and had a nap.', pic:['🐱','😴']},
    {t:'Max is sad. Where is the map?', pic:['😢','❓']},
    {t:'Look! The cat is on the map.', pic:['🐱','🗺️']},
    {t:'Max and Cubi pat the cat. The cat is a pal!', pic:['cubi','🐱','❤️']},
  ]},
  {id:'st_o', unlock:'b1u10', world:'w2', title:'The Hot Pot', ko:'뜨거운 냄비', cover:'🍲', pages:[
    {t:'Bob the dog has a pot.', pic:['🐶','🍲']},
    {t:'The pot is hot, hot, hot!', pic:['🍲','🔥']},
    {t:'Bob can hop on a log.', pic:['🐶','🪵']},
    {t:'Max got a mop. Mop, mop, mop!', pic:['hero','🧹']},
    {t:'Cubi sat on top of the box.', pic:['cubi','📦']},
    {t:'Bob and Max nap on a cot.', pic:['🐶','😴']},
  ]},
  {id:'st_e', unlock:'b1u11', world:'w2', title:'Ten Red Hens', ko:'빨간 암탉 열 마리', cover:'🐔', pages:[
    {t:'Ted has ten red hens.', pic:['🔟','🐔']},
    {t:'Oh no! The hens are wet.', pic:['🐔','💦']},
    {t:'Max and Cubi help the hens.', pic:['hero','cubi']},
    {t:'They get the hens a bed.', pic:['🛏️']},
    {t:'Ten red hens nap in the bed.', pic:['🐔','😴']},
    {t:'Ted said, "Thank you!"', pic:['😊','❤️']},
  ]},
  {id:'st_i', unlock:'b1u12', world:'w2', title:'The Big Dig', ko:'커다란 구덩이', cover:'⛏️', pages:[
    {t:'Max and Cubi dig a big pit.', pic:['hero','⛏️']},
    {t:'Dig, dig, dig! The pit is big.', pic:['⛏️','🕳️']},
    {t:'Look! A pig is in the pit.', pic:['🐷','🕳️']},
    {t:'The pig can not get out.', pic:['🐷','😢']},
    {t:'Max and Cubi help the pig.', pic:['hero','cubi']},
    {t:'The pig did a big hop. Thank you!', pic:['🐷','⬆️']},
  ]},
  {id:'st_u', unlock:'b1u13', world:'w2', title:'Bug Fun', ko:'벌레의 즐거운 하루', cover:'🐛', pages:[
    {t:'A bug is in the sun.', pic:['🐛','☀️']},
    {t:'The bug can run and hum.', pic:['🐛','🎵']},
    {t:'Cubi has a cup of nuts.', pic:['cubi','🥜']},
    {t:'The bug got the nuts! Yum!', pic:['🐛','😋']},
    {t:'Max hugs the bug.', pic:['hero','🤗']},
    {t:'The bug had fun in the sun.', pic:['🐛','☀️','🎉']},
  ]},
  // ---------- w3 Deep Mine (magic e: one story per unit) ----------
  {id:'st_ae', unlock:'b2u1', world:'w3', title:'The Cave Game', ko:'동굴 게임', cover:'🦸', pages:[
    {t:'Max has a red cape.', pic:['hero','🦸']},
    {t:'Max and Cubi go into a cave.', pic:['cubi','🕳️']},
    {t:'They see a big gate.', pic:['🚧']},
    {t:'"What is this game?" said Max.', pic:['hero','🎮']},
    {t:'Max and Cubi wave at the gate. It can open!', pic:['👋','🚧']},
    {t:'In the cave is a big cake. Yum!', pic:['🎂','😋']},
  ]},
  {id:'st_ie', unlock:'b2u2', world:'w3', title:'Five Kites', ko:'연 다섯 개', cover:'🪁', pages:[
    {t:'Max can ride a bike.', pic:['hero','🚲']},
    {t:'Cubi has five kites.', pic:['cubi','🪁']},
    {t:'The kites go up, up, up!', pic:['🪁','⬆️']},
    {t:'A kite is in the pine.', pic:['🪁','🌲']},
    {t:'Max can hike up the pine tree.', pic:['🥾','🌲']},
    {t:'Max got the kite. Five kites! Yes!', pic:['🪁','🎉']},
  ]},
  {id:'st_oe', unlock:'b2u3', world:'w3', title:'Bob and the Bone', ko:'밥과 뼈다귀', cover:'🦴', pages:[
    {t:'Bob the dog has a bone.', pic:['🐶','🦴']},
    {t:'The bone is in a hole!', pic:['🦴','🕳️']},
    {t:'Max gets a rope.', pic:['hero','🪢']},
    {t:'Max pokes the rope in the hole.', pic:['🪢','🕳️']},
    {t:'Bob gets the bone and runs home.', pic:['🐶','🏠']},
    {t:'Bob is home with the bone. Good dog!', pic:['🏠','🐶']},
  ]},
  {id:'st_ue', unlock:'b2u4', world:'w3', title:'The Huge Cube', ko:'엄청 큰 큐브', cover:'🧊', pages:[
    {t:'June has a cute mule.', pic:['🫏','🥰']},
    {t:'The mule can hum a tune.', pic:['🫏','🎶']},
    {t:'Max has a huge cube.', pic:['hero','🧊']},
    {t:'Use the cube! June and Max sit on it.', pic:['🧊']},
    {t:'The mule did not like the cube.', pic:['🫏','😠']},
    {t:'The mule ate the cube. It was a cake cube!', pic:['🫏','🎂']},
  ]},
  // ---------- w4 Jungle Temple (blends) ----------
  {id:'st_blend', unlock:'b2u7', world:'w4', title:'The Slime Stop', ko:'슬라임을 멈춰라', cover:'🟢', pages:[
    {t:'Max and Cubi spot a slime.', pic:['cubi','🟢']},
    {t:'The slime can slip and slide.', pic:['🟢','🛝']},
    {t:'Stop, slime! Max can grab it.', pic:['🛑','✋']},
    {t:'Plop! The slime is on the sled.', pic:['🟢','🛷']},
    {t:'Max claps. Cubi spins.', pic:['👏','🌀']},
    {t:'The slime is a pal. It can glide!', pic:['🟢','❤️']},
  ]},
  // ---------- w5 Ocean Ruins (vowel teams) ----------
  {id:'st_team', unlock:'b2u13', world:'w5', title:'A Boat on the Sea', ko:'바다 위의 배', cover:'⛵', pages:[
    {t:'Max and Cubi sail a boat on the sea.', pic:['⛵','🌊']},
    {t:'It is a gray day. Rain!', pic:['🌧️']},
    {t:'A snail is on the boat. It is so slow.', pic:['🐌','⛵']},
    {t:'At night, Max and Cubi see a light.', pic:['🌃','💡']},
    {t:'Cubi can glow! The sky is bright.', pic:['cubi','✨']},
    {t:'Max had tea and a pie. A happy day!', pic:['🍵','🥧','😃']},
  ]},
  // ---------- w6 Ancient Deep City (digraphs) ----------
  {id:'st_digraph', unlock:'b3u5', world:'w6', title:'The Deep Chest', ko:'깊은 곳의 보물 상자', cover:'🧰', pages:[
    {t:'Max and Cubi dig a deep shaft.', pic:['hero','⛏️']},
    {t:'Shh! A big chest is at the end.', pic:['🤫','🧰']},
    {t:'Max picks the lock with a stick.', pic:['🔒','🪵']},
    {t:'Thump! The chest pops up.', pic:['🧰','💥']},
    {t:'In the chest: a ring, a shell, and a fish!', pic:['💍','🐚','🐟']},
    {t:'Then Max sings and Cubi winks. What a fun trip!', pic:['🎤','😉']},
  ]},
  // ---------- w7 Burning Underworld (other vowels, r-controlled) ----------
  {id:'st_rvowel', unlock:'b3u12', world:'w7', title:'The Fire Storm', ko:'불꽃 폭풍', cover:'🌋', pages:[
    {t:'It is dark in the burning land.', pic:['🌑','🔥']},
    {t:'A storm! Max and Cubi run to a fort.', pic:['⛈️','🏰']},
    {t:'A loud owl sits on a torch.', pic:['🦉','🔦']},
    {t:'A girl in a purple shirt joins Max.', pic:['👧','🟣']},
    {t:'Look! A big red bird is in the lava!', pic:['🐦','🌋']},
    {t:'Yay! The storm is over. Good work, crew!', pic:['🎉','🏆']},
  ]},
  // ---------- w8 The Final Dimension (sight words) ----------
  {id:'st_sight', unlock:'b4u5', world:'w8', title:'Who Can Help?', ko:'누가 도와줄까?', cover:'🐉', pages:[
    {t:'Look! What is that?', pic:['👀','❓']},
    {t:'It is a big, big dragon!', pic:['🐉']},
    {t:'"Who can help me?" said Cubi.', pic:['cubi','❓']},
    {t:'"I can help!" said Max.', pic:['hero','💪']},
    {t:'Max and Cubi jump over the dragon.', pic:['🐉','⬆️']},
    {t:'Now the dragon is a little pet. Yes!', pic:['🐉','❤️']},
  ]},
];
export const storyById = id => STORIES.find(s=>s.id===id);
