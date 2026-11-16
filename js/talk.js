// 학교 영어 (talk missions): original mini-dialogues covering the communicative functions of the Korean
// 2022 national curriculum, grades 3–6 (3학년 here; 4–6학년 in talk_g4/5/6.js). Speakers: C = 큐비 (mascot), H = the child's hero.
// vocab: [english phrase spoken, picture (emoji or text card), korean meaning]
// g: grade · topic: 단어 도감 group · words: [word, picture, korean] collected into the 단어 도감 when the lesson is done
// read (5–6학년): short passage {t} + question {q, opts, a}
import { G4 } from './talk_g4.js';
import { G5 } from './talk_g5.js';
import { G6 } from './talk_g6.js';
const G3 = [
  {id:"t01", g:3, topic:"인사·소개", words:[["hello", "👋", "안녕"], ["morning", "🌅", "아침"], ["night", "🌙", "밤"], ["meet", "🤝", "만나다"], ["nice", "😊", "좋은, 멋진"]], ko:'만나서 반가워', fn:'인사하기', scene:'🌅',
    lines:[['C','Hello! I\u2019m Cubi.'],['H','Hi, Cubi! Nice to meet you.']],
    vocab:[['Good morning!','🌅','좋은 아침!'],['Good night!','🌙','잘 자!'],['Hello!','👋','안녕!'],['Nice to meet you.','🤝','만나서 반가워.']]},
  {id:"t02", g:3, topic:"인사·소개", words:[["name", "📛", "이름"], ["boy", "👦", "남자아이"], ["girl", "👧", "여자아이"], ["robot", "🤖", "로봇"], ["hero", "🦸", "영웅, 히어로"]], ko:'네 이름은 뭐야?', fn:'이름 말하기', scene:'📛',
    lines:[['C','What\u2019s your name?'],['H','My name is Max.']],
    vocab:[['I\u2019m a boy.','👦','나는 남자아이야.'],['I\u2019m a girl.','👧','나는 여자아이야.'],['I\u2019m a robot.','🤖','나는 로봇이야.'],['I\u2019m a hero.','🦸','나는 히어로야.']]},
  {id:"t03", g:3, topic:"학교·교실", words:[["pencil", "✏️", "연필"], ["book", "📖", "책"], ["bag", "🎒", "가방"], ["ruler", "📏", "자"], ["this", "👇", "이것"]], ko:'이건 뭐야?', fn:'물건 묻기', scene:'❓',
    lines:[['C','What\u2019s this?'],['H','It\u2019s a pencil.']],
    vocab:[['It\u2019s a pencil.','✏️','연필이야.'],['It\u2019s a book.','📖','책이야.'],['It\u2019s a bag.','🎒','가방이야.'],['It\u2019s a ruler.','📏','자야.']]},
  {id:"t04", g:3, topic:"학교·교실", words:[["stand", "🧍", "서다"], ["sit", "🪑", "앉다"], ["open", "📖", "열다"], ["quiet", "🤫", "조용한"], ["please", "🙏", "부탁해요"]], ko:'일어나세요, 앉으세요', fn:'교실 명령', scene:'🏫',
    lines:[['C','Stand up, please.'],['H','Okay! Sit down, Cubi.']],
    vocab:[['Stand up.','🧍','일어나.'],['Sit down.','🪑','앉아.'],['Open your book.','📖','책을 펴.'],['Be quiet.','🤫','조용히 해.']]},
  {id:"t05", g:3, topic:"동물", words:[["tiger", "🐯", "호랑이"], ["rabbit", "🐰", "토끼"], ["bear", "🐻", "곰"], ["monkey", "🐵", "원숭이"], ["lion", "🦁", "사자"], ["big", "🐘", "큰"],['fox','🦊','여우']], ko:'어떤 동물이야?', fn:'동물 말하기', scene:'🦁',
    lines:[['C','Look! It\u2019s a tiger.'],['H','Wow! It\u2019s big.']],
    vocab:[['It\u2019s a tiger.','🐯','호랑이야.'],['It\u2019s a rabbit.','🐰','토끼야.'],['It\u2019s a bear.','🐻','곰이야.'],['It\u2019s a monkey.','🐵','원숭이야.']]},
  {id:"t06", g:3, topic:"색깔", words:[["color", "🎨", "색깔"], ["red", "🟥", "빨간색"], ["blue", "🟦", "파란색"], ["yellow", "🟨", "노란색"], ["green", "🟩", "초록색"], ["purple", "🟪", "보라색"],['black','⬛','검은색'],['white','⬜','흰색'],['pink','🩷','분홍색'],['brown','🟫','갈색']], ko:'무슨 색이야?', fn:'색깔', scene:'🎨',
    lines:[['C','What color is it?'],['H','It\u2019s blue.']],
    vocab:[['red','🟥','빨강'],['blue','🟦','파랑'],['yellow','🟨','노랑'],['green','🟩','초록'],['purple','🟪','보라']]},
  {id:"t07", g:3, topic:"감정", words:[["happy", "😃", "기쁜"], ["sad", "😢", "슬픈"], ["hungry", "😋", "배고픈"], ["tired", "😴", "피곤한"], ["fine", "👍", "괜찮은"]], ko:'기분이 어때?', fn:'안부·기분', scene:'😃',
    lines:[['C','How are you?'],['H','I\u2019m happy!']],
    vocab:[['I\u2019m happy.','😃','나는 기뻐.'],['I\u2019m sad.','😢','나는 슬퍼.'],['I\u2019m hungry.','😋','나는 배고파.'],['I\u2019m tired.','😴','나는 피곤해.']]},
  {id:"t08", g:3, topic:"음식", words:[["like", "❤️", "좋아하다"], ["apple", "🍎", "사과"], ["banana", "🍌", "바나나"], ["pizza", "🍕", "피자"], ["milk", "🥛", "우유"]], ko:'나는 ~를 좋아해', fn:'좋아하는 것', scene:'🍎',
    lines:[['C','I like apples.'],['H','Me too! I like bananas, too.']],
    vocab:[['I like apples.','🍎','사과를 좋아해.'],['I like bananas.','🍌','바나나를 좋아해.'],['I like pizza.','🍕','피자를 좋아해.'],['I like milk.','🥛','우유를 좋아해.']]},
  {id:"t09", g:3, topic:"음식", words:[["carrot", "🥕", "당근"], ["grape", "🍇", "포도"], ["yes", "👍", "응, 네"], ["no", "👎", "아니"], ["too", "➕", "~도, 또한"],['tomato','🍅','토마토'],['potato','🥔','감자']], ko:'~를 좋아하니?', fn:'좋아하는지 묻기', scene:'🍕',
    lines:[['C','Do you like pizza?'],['H','Yes, I do!']],
    vocab:[['Yes, I do.','👍','응, 좋아해.'],['No, I don\u2019t.','👎','아니, 안 좋아해.'],['Do you like carrots?','🥕','당근 좋아해?'],['Do you like grapes?','🍇','포도 좋아해?']]},
  {id:"t10", g:3, topic:"숫자", words:[["one", "1️⃣", "1, 하나"], ["two", "2️⃣", "2, 둘"], ["three", "3️⃣", "3, 셋"], ["four", "4️⃣", "4, 넷"], ["five", "5️⃣", "5, 다섯"], ["six", "6️⃣", "6, 여섯"], ["seven", "7️⃣", "7, 일곱"], ["eight", "8️⃣", "8, 여덟"], ["nine", "9️⃣", "9, 아홉"], ["ten", "🔟", "10, 열"], ["many", "🔢", "많은"]], ko:'몇 개야? (1–10)', fn:'수 세기', scene:'🔢',
    lines:[['C','How many apples?'],['H','Five apples!']],
    vocab:[['two','2️⃣','2'],['five','5️⃣','5'],['seven','7️⃣','7'],['nine','9️⃣','9'],['ten','🔟','10']]},
  {id:"t11", g:3, topic:"운동·놀이", words:[["can", "💪", "~할 수 있다"], ["swim", "🏊", "수영하다"], ["dance", "💃", "춤추다"], ["ski", "⛷️", "스키 타다"], ["sing", "🎤", "노래하다"],['fly','🕊️','날다']], ko:'~할 수 있니?', fn:'할 수 있는 것', scene:'🏊',
    lines:[['C','Can you swim?'],['H','Yes, I can!']],
    vocab:[['I can swim.','🏊','나는 수영할 수 있어.'],['I can dance.','💃','나는 춤출 수 있어.'],['I can ski.','⛷️','나는 스키를 탈 수 있어.'],['I can sing.','🎤','나는 노래할 수 있어.']]},
  {id:"t12", g:3, topic:"학교·교실", words:[["run", "🏃", "달리다"], ["eat", "🍔", "먹다"], ["touch", "✋", "만지다"], ["sorry", "🙇", "미안한"], ["stop", "🛑", "멈추다"]], ko:'~하지 마', fn:'금지하기', scene:'🛑',
    lines:[['C','Don\u2019t run, please.'],['H','Oh, sorry!']],
    vocab:[['Don\u2019t run.','🏃','뛰지 마.'],['Don\u2019t eat.','🍔','먹지 마.'],['Don\u2019t touch.','✋','만지지 마.'],['Don\u2019t swim.','🏊','수영하지 마.']]},
  {id:"t13", g:3, topic:"숫자", words:[["old", "🎂", "~살의, 나이 든"], ["year", "📅", "해, 년"], ["eleven", "#11", "11, 열하나"], ["you", "👉", "너"]], ko:'몇 살이니?', fn:'나이 말하기', scene:'🎂',
    lines:[['C','How old are you?'],['H','I\u2019m nine years old.']],
    vocab:[['I\u2019m eight.','#8','나는 8살이야.'],['I\u2019m nine.','#9','나는 9살이야.'],['I\u2019m ten.','#10','나는 10살이야.'],['I\u2019m eleven.','#11','나는 11살이야.']]},
  {id:"t14", g:3, topic:"가족·사람", words:[["family", "👨\u200d👩\u200d👦", "가족"], ["mom", "👩", "엄마"], ["dad", "👨", "아빠"], ["grandma", "👵", "할머니"], ["grandpa", "👴", "할아버지"], ["brother", "👦", "형, 오빠, 남동생"], ["sister", "👧", "누나, 언니, 여동생"], ["who", "❓", "누구"],['baby','👶','아기']], ko:'우리 가족이야', fn:'가족 소개', scene:'👨‍👩‍👦',
    lines:[['C','Who is she?'],['H','She\u2019s my mom.']],
    vocab:[['my mom','👩','엄마'],['my dad','👨','아빠'],['my grandma','👵','할머니'],['my grandpa','👴','할아버지']]},
  {id:"t15", g:3, topic:"숫자", words:[["twelve", "#12", "12, 열둘"], ["thirteen", "#13", "13"], ["fifteen", "#15", "15"], ["eighteen", "#18", "18"], ["twenty", "#20", "20, 스물"], ["block", "🧱", "블록"]], ko:'숫자 11–20', fn:'큰 수 세기', scene:'🧱',
    lines:[['C','How many blocks?'],['H','Twelve blocks!']],
    vocab:[['twelve','#12','12'],['fifteen','#15','15'],['eighteen','#18','18'],['twenty','#20','20']]},
  {id:"t16", g:3, topic:"날씨·계절", words:[["weather", "🌤️", "날씨"], ["sunny", "☀️", "맑은"], ["rainy", "🌧️", "비 오는"], ["snowy", "❄️", "눈 오는"], ["windy", "🌬️", "바람 부는"], ["cloudy", "☁️", "흐린"],['sun','☀️','해, 태양'],['rain','🌧️','비']], ko:'날씨가 어때?', fn:'날씨', scene:'☀️',
    lines:[['C','How\u2019s the weather?'],['H','It\u2019s sunny!']],
    vocab:[['It\u2019s sunny.','☀️','맑아.'],['It\u2019s rainy.','🌧️','비가 와.'],['It\u2019s snowy.','❄️','눈이 와.'],['It\u2019s windy.','🌬️','바람이 불어.']]},
  {id:"t17", g:3, topic:"인사·소개", words:[["thank", "🙏", "고마워하다"], ["okay", "🙆", "괜찮은, 좋아"], ["here", "📍", "여기"], ["gift", "🎁", "선물"]], ko:'고마워!', fn:'감사하기', scene:'🎁',
    lines:[['C','Here you are.'],['H','Thank you, Cubi!']],
    vocab:[['Thank you.','🙏','고마워.'],['Here you are.','🎁','여기 있어.'],['Sorry.','🙇','미안해.'],['That\u2019s okay.','🙆','괜찮아.']]},
  {id:"t18", g:3, topic:"인사·소개", words:[["goodbye", "👋", "잘 가"], ["tomorrow", "📅", "내일"], ["play", "⚽", "놀다"], ["see", "👀", "보다"]], ko:'내일 또 만나', fn:'헤어질 때', scene:'👋',
    lines:[['C','Goodbye! See you tomorrow.'],['H','Bye, Cubi! See you.']],
    vocab:[['Goodbye!','👋','잘 가!'],['See you tomorrow.','📅','내일 봐.'],['Good night!','🌙','잘 자!'],['Let\u2019s play!','⚽','같이 놀자!']]},
  {id:'t19', g:3, topic:'학교·교실', ko:'나는 ~가 있어', fn:'가진 것 말하기', scene:'🎒',
    lines:[['C','Do you have a ball?'],['H','Yes, I do. I have a red ball.']],
    vocab:[['I have a cap.','🧢','나는 모자가 있어.'],['I have a ball.','⚽','나는 공이 있어.'],['I have a cat.','🐱','나는 고양이가 있어.'],['I have a robot.','🤖','나는 로봇이 있어.']],
    words:[['have','🫴','가지고 있다'],['ball','⚽','공'],['cap','🧢','모자'],['cat','🐱','고양이'],['toy','🧸','장난감'],['doll','🪆','인형']]},
  {id:'t20', g:3, topic:'동물', ko:'이건 ~니?', fn:'확인하기', scene:'🔍',
    lines:[['C','Is it a dog?'],['H','No, it isn\u2019t. It\u2019s a cat.']],
    vocab:[['Yes, it is.','⭕','응, 맞아.'],['No, it isn\u2019t.','❌','아니, 아니야.'],['Is it a fish?','🐟','물고기야?'],['Is it a bird?','🐦','새야?']],
    words:[['dog','🐶','개'],['fish','🐟','물고기'],['bird','🐦','새'],['duck','🦆','오리'],['pig','🐷','돼지'],['cow','🐮','소']]},
  {id:'t21', g:3, topic:'운동·놀이', ko:'같이 ~하자!', fn:'제안하기', scene:'⚽',
    lines:[['C','Let\u2019s play soccer!'],['H','Okay! Sounds good.']],
    vocab:[['Let\u2019s play soccer.','⚽','축구 하자.'],['Let\u2019s play baseball.','⚾','야구 하자.'],['Let\u2019s jump!','🦘','점프하자!'],['Sounds good!','👌','좋아!']],
    words:[['soccer','⚽','축구'],['baseball','⚾','야구'],['jump','🦘','뛰어오르다'],['good','👌','좋은'],['let','🙌','~하자 (let\u2019s)']]},
  {id:'t22', g:3, topic:'몸·건강', ko:'내 몸을 움직여!', fn:'동작 지시하기', scene:'🙆',
    lines:[['C','Touch your nose.'],['H','Okay! Clap your hands, Cubi.']],
    vocab:[['Touch your head.','🙆','머리를 만져.'],['Touch your nose.','👃','코를 만져.'],['Clap your hands.','👏','손뼉을 쳐.'],['Raise your arms.','🙌','팔을 들어.']],
    words:[['head','🙆','머리'],['nose','👃','코'],['eye','👁️','눈'],['ear','👂','귀'],['mouth','👄','입'],['hand','✋','손'],['foot','🦶','발'],['clap','👏','손뼉 치다'],['body','🧍','몸']]},
];
// all 학교 영어 lessons; TALK keeps its name (old saves refer to t01..t18 ids)
export const TALK = [...G3, ...G4, ...G5, ...G6];
export const GRADES = [3,4,5,6];
export const gradeLessons = g => TALK.filter(t=>t.g===g);
export const talkById = id => TALK.find(t=>t.id===id);
// every English sentence/phrase that needs audio (category 'tk')
export function talkAudio(){ const s = new Set(); for (const t of TALK){ t.lines.forEach(([,x])=>s.add(x)); t.vocab.forEach(([x])=>s.add(x)); if (t.read) s.add(t.read.q); } return [...s]; }
// reading passages (5–6학년) are read with word highlighting like story pages (category 'st')
export const talkPassages = () => TALK.filter(t=>t.read).map(t=>t.read.t);
