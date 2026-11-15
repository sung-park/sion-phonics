# 🧱 블록 히어로 파닉스 (Block Hero Phonics)

**블록 월드 × 히어로** 테마로 즐겁게 배우는 파닉스 웹앱이에요.
초등 저학년, 특히 **집중 시간이 짧은 아이(ADHD 성향)** 와 **천천히 배우는 아이**를 위해 설계했어요.

👉 **바로 하기: https://sung-park.github.io/sion-phonics/**
(아이패드·휴대폰·PC 브라우저에서 바로 돼요. 사파리에서 "홈 화면에 추가"하면 앱처럼 쓸 수 있어요.)

![홈 화면](assets/img/og.png)

## 어떤 앱인가요?

- **3분 미션** – 한 번에 한 가지 소리만. 단원마다 `배우기 → 연습하기 → 보스 도전` 3개의 짧은 미션.
- **원어민 음성** – 모든 단어·문장·소리를 ElevenLabs로 미리 녹음해 두었어요. (브라우저 기계음 TTS를 쓰지 않아요)
- **교재와 같은 순서** – 리틀팍스 *Phonics Works 1–4* 의 단원 순서를 그대로 따라가요. 보호자 화면에서 "지금 공부 중인 단원"을 고르면 거기서부터 시작해요.
- **헷갈리는 글자 훈련소** – b/d, p/q, m/n, n/u, i/l, h/n, f/t 를 bed 트릭 같은 그림 기억법과 짧은 게임으로 구별해요.
- **틀려도 괜찮아** – 무서운 오답 소리·시간 제한이 없어요. 한 번 틀리면 소리를 다시 들려주고, 두 번째엔 정답이 반짝이는 힌트가 나와요(오류 없는 학습).
- **복습은 자동으로** – 틀렸던 소리·단어는 간격 반복(라이트너 상자)으로 다음 미션에 슬쩍 다시 나와요.
- **보상 · 보물 도감 62종** – 미션마다 보물상자! 진도에 따라 땅속으로 내려가듯 보상이 올라가요: 초원(흙·잔디·통나무) → 동굴(조약돌·석탄) → 광산(구리·철) → 정글·바다 유적(금·청금석) → 고대 도시(붉은돌·다이아몬드) → 지하세계(흑요석) → 끝의 차원(에메랄드·보물 블록). 나무→돌→철→금→다이아 곡괭이·검, 횃불·나침반 같은 모험 장비, 월드 클리어 때만 만나는 펫 친구 8종, 학교 영어에서 모으는 💿 말하기 디스크 9종. 아직 못 찾은 보물은 실루엣으로 보여요. XP·레벨·연속 학습일, 월드마다 히어로 수트 파츠도 하나씩!
- **📚 이야기 책 (디코더블 북) 15권** – 단원 보스를 깨면 4–6쪽짜리 이야기 두루마리가 열려요. **그때까지 배운 파닉스 규칙 + 몇 개의 사이트워드로만** 써서 아이 혼자 읽을 수 있어요. 단어를 누르면 그 단어만, 🔊 "읽어 줘"를 누르면 문장을 읽어 주면서 읽는 단어에 불이 들어와요(ElevenLabs 글자 타이밍으로 맞춤). 읽은 책은 책장(인벤토리)에 모여요.
- **🗣️ 학교 영어 (초3 교과 표현) 18개 대화** – 큐비와 히어로의 짧은 대화로 인사·이름·기분·숫자·색깔·교실 명령 등 초등 3학년 의사소통 기능을 익혀요. 파닉스 진도와 상관없이 처음부터 열려 있고, 새 대화는 **하루 1개 또는 파닉스 미션을 1개 할 때마다** 열려서 두 트랙을 번갈아 하게 돼요.
- **히어로 꾸미기** – 홈에서 이름이나 히어로를 누르면 언제든 이름·색깔을 바꿀 수 있어요(진도는 그대로).
- **보호자 화면** (곱셈 문제로 잠금) – 교재별 진도·숙달도, 자주 틀리는 소리, 헷갈린 글자 짝(b→d 등), 최근 학습 기록, 설정.
- **차분 모드** – 애니메이션·반짝임을 줄여요. 한국어 음성 안내·효과음·미션 길이도 조절 가능.
- **설치·로그인 없음** – 진도는 (저장 키 `bhp.v1` 그대로, 새 필드는 기본값으로 추가되어 예전 진도도 그대로 이어져요) 이 기기 브라우저에만 저장돼요(내보내기/가져오기로 기기 이동 가능). 오프라인에서도 동작(PWA).

## 활동 종류

| 활동 | 설명 |
|---|---|
| 소리 배우기 | 글자를 누르면 이름과 소리, 그림을 누르면 키워드 단어 |
| 소리 듣고 고르기 | 들리는 소리의 글자(또는 글자 팀)를 골라요 |
| 첫소리 찾기 | 그림 단어가 어떤 소리로 시작하는지 |
| 대·소문자 짝 | 대문자에 맞는 소문자 찾기 |
| 블렌딩 | 블록을 하나씩 눌러 소리를 잇고 → 단어 전체로 "스르륵" |
| 단어 만들기 | 소리를 듣고 글자 블록을 순서대로 놓기 (blends는 낱글자, sh/ai 같은 팀은 한 블록) |
| 매직 e | cap 에 e 블록을 붙이면 → cape! 모음 소리가 바뀌는 걸 직접 체험 |
| 그림 고르기 | 단어를 읽고 맞는 그림 고르기 |
| 문장 읽기 | 해독 가능한 짧은 문장. 모르는 단어는 눌러서 듣고, 들린 단어를 문장에서 찾기 |
| 사이트워드 | 통째로 외우는 단어(4권 100개). 철자 듣기 → 따라 말하기 |
| 글자 찾기 | 화면 속 b 를 모두 찾아 누르기 (시간 제한 없음) |

### 학교 영어 활동 (레슨당 약 3분)

| 단계 | 설명 |
|---|---|
| 대화 듣기 | 큐비와 히어로의 2줄 대화. 말풍선을 누르면 다시 듣고, 큰 소리로 따라 말하기 |
| 표현 익히기 | 그림 카드 4–5장을 눌러 표현 듣기 (한국어 뜻 함께) |
| 듣고 고르기 | 들은 문장을 3개 중에서 고르기 |
| 그림 퀴즈 | 표현을 듣고 알맞은 그림 고르기 (2–3문제) |
| 대답 고르기 | 큐비의 질문에 알맞은 대답 고르기 |

## 📚 이야기 책 목록 (모두 오리지널)

| 월드 | 열리는 때 | 이야기 |
|---|---|---|
| 🌱 시작의 초원 | 1권 8단원 보스 | *A to Z Walk* (알파벳 산책) – 그림 키워드 단어 |
| 🪨 얕은 동굴 | 1권 9–13단원 보스 (단원마다 1권) | *Max and the Cat* (short a) · *The Hot Pot* (o) · *Ten Red Hens* (e) · *The Big Dig* (i) · *Bug Fun* (u) |
| ⛏️ 깊은 광산 | 2권 1–4단원 보스 (단원마다 1권) | *The Cave Game* (a_e) · *Five Kites* (i_e) · *Bob and the Bone* (o_e) · *The Huge Cube* (u_e) |
| 🌿 정글 신전 | 2권 7단원 보스 | *The Slime Stop* (blends) |
| 🌊 바다 유적 | 2권 13단원 보스 | *A Boat on the Sea* (vowel teams) |
| 🏛️ 고대 도시 | 3권 5단원 보스 | *The Deep Chest* (digraphs) |
| 🔥 불타는 지하세계 | 3권 12단원 보스 | *The Fire Storm* (r-controlled · oi · ou · oo) |
| 🌌 끝의 차원 | 4권 5단원 보스 | *Who Can Help?* (sight words) |

허용 사이트워드(하트 워드): a, the, I, is, to, and, of, you, he, she, we, was, said, go, no, so, my, do, are, his, has, as, look, see, they, what, this, that, with, help, out, into, thank, good, over, open, where, here, there, come, have, for, one, two, little, all, be, me, by, put, your, oh, in, on, it, at, an, not, can, up + 4권에서 이미 배운 사이트워드. (보호자 확인: 문장이 자연스럽도록 아주 기초적인 고빈도 단어 몇 개는 해당 파닉스 단원 전이라도 통째로 읽는 단어로 허용해요.) 등장인물 이름: Max(히어로), Cubi(큐비), Bob, Ted, June 등.
`node tools/validate_stories.mjs` 가 모든 단어를 검사해요: 열리는 단원까지 배운 그래핌(단모음 → 매직 e → 블렌드 → 모음 팀 → 이중글자 → r 모음 …)으로만 해독되는지, 아니면 이미 배운 단어/허용 사이트워드/이름인지. 하나라도 어긋나면 실패해요.

## 🗣️ 학교 영어 레슨 목록 (모두 오리지널 대화)

| # | 주제 | 대화 |
|---|---|---|
| 1 | 만나서 반가워 (인사하기) | Hello! I’m Cubi. / Hi, Cubi! Nice to meet you. |
| 2 | 네 이름은 뭐야? (이름 말하기) | What’s your name? / My name is Max. |
| 3 | 이건 뭐야? (물건 묻기) | What’s this? / It’s a pencil. |
| 4 | 일어나세요, 앉으세요 (교실 명령) | Stand up, please. / Okay! Sit down, Cubi. |
| 5 | 어떤 동물이야? (동물 말하기) | Look! It’s a tiger. / Wow! It’s big. |
| 6 | 무슨 색이야? (색깔) | What color is it? / It’s blue. |
| 7 | 기분이 어때? (안부·기분) | How are you? / I’m happy! |
| 8 | 나는 ~를 좋아해 (좋아하는 것) | I like apples. / Me too! I like bananas, too. |
| 9 | ~를 좋아하니? (좋아하는지 묻기) | Do you like pizza? / Yes, I do! |
| 10 | 몇 개야? (1–10) (수 세기) | How many apples? / Five apples! |
| 11 | ~할 수 있니? (할 수 있는 것) | Can you swim? / Yes, I can! |
| 12 | ~하지 마 (금지하기) | Don’t run, please. / Oh, sorry! |
| 13 | 몇 살이니? (나이 말하기) | How old are you? / I’m nine years old. |
| 14 | 우리 가족이야 (가족 소개) | Who is she? / She’s my mom. |
| 15 | 숫자 11–20 (큰 수 세기) | How many blocks? / Twelve blocks! |
| 16 | 날씨가 어때? (날씨) | How’s the weather? / It’s sunny! |
| 17 | 고마워! (감사하기) | Here you are. / Thank you, Cubi! |
| 18 | 내일 또 만나 (헤어질 때) | Goodbye! See you tomorrow. / Bye, Cubi! See you. |

짝수 레슨(2, 4, … 18)을 처음 끝내면 💿 말하기 디스크를 받아요 (초원 → 동굴 → … → 황금 디스크, 갈수록 희귀).

## 커리큘럼 (Phonics Works 1–4 순서)

| 월드 (점점 더 깊고 위험한 곳으로!) | 교재 | 단원 |
|---|---|---|
| 🌱 시작의 초원 | 1권 1–8 | Aa Bb Cc · Dd Ee Ff · Gg Hh Ii · Jj Kk Ll · Mm Nn Oo · Pp Qq Rr · Ss Tt Uu Vv · Ww Xx Yy Zz |
| 🪨 얕은 동굴 | 1권 9–13 | short a (at ad ap) · o (ot og op) · e (et en ed) · i (ig it in) · u (ug ut un) |
| ⛏️ 깊은 광산 | 2권 1–4 | magic e: a_e · i_e · o_e · u_e |
| 🌿 정글 신전 | 2권 5–7 | blends: cl pl gl · fr dr gr · sp sl st |
| 🌊 바다 유적 | 2권 8–13 | long-vowel teams: ai ay · ea ee · ie igh · y · oa ow · ue ew |
| 🏛️ 고대 도시 (심층 어둠) | 3권 1–5 | digraphs: ch sh · ph wh · qu ck · th · ng nk |
| 🔥 불타는 지하세계 | 3권 6–12 | oi oy · ou ow · oo · a au aw · ar or · er ir ur · wr kn |
| 🌌 끝의 차원 (마지막 보스) | 4권 1–20 | 100 sight words (단원별 4–8개) |

단어·문장·그림은 모두 이 앱을 위해 새로 만든 것이고, 교재 내용(본문·그림)은 사용하지 않았어요. 교재의 *단원 순서와 목표 소리*만 맞췄어요.

## 보호자 팁

- 하루 **1–2개 미션(3–5분)** 이면 충분해요. "오늘의 목표" 2칸이 채워지면 끝!
- 블렌딩에서는 아이가 **소리를 입으로 따라 하게** 해 주세요 (c‑a‑t → cat).
- b/d가 헷갈리면 두 손 엄지척, 주먹끼리 마주 보게 해서 **왼손 = b, 오른손 = d** (왼쪽부터 b‑e‑d, 침대 모양!)를 함께 만들어 보세요.
- 보호자 화면은 🔒 버튼 → 곱셈 문제로 들어가요.

## 만든 방법 (개발자용)

- 순수 정적 사이트 (Vanilla JS ES modules, 빌드 없음) – GitHub Pages 하위 경로에서 동작하도록 모두 상대 경로.
- `js/data.js` 커리큘럼 · `js/phonics.js` 그래핌 분절(매직 e, 이중글자, y/th/oo/ow 예외) · `js/missions.js` 미션 생성·간격 반복 · `js/activities.js` 활동 · `js/sprites.js` 직접 그린 픽셀/복셀 SVG.
- `js/stories.js` 이야기 책 · `tools/validate_stories.mjs` 해독 가능성 검사 · `js/talk.js` 학교 영어 대화.
- 음성: `tools/gen_audio.py` (단어·문장·칭찬·한국어 안내, 이야기 쪽 음성은 단어별 타이밍 `assets/audio/st/timings.json` 포함, 학교 영어 `tk/`), `tools/gen_letters.py` (알파벳 낭독에서 글자 이름 분리), `tools/gen_phonemes.py` (단어 속에서 음소를 잘라내 'buh' 없는 짧은 자음, 늘인 연속음 생성). API 키는 환경 변수 `ELEVENLABS_API_KEY` 로만 읽고 저장하지 않아요. 결과는 `assets/audio/` + `manifest.json`.
- 오디오 검수 메모: [`docs/AUDIO.md`](docs/AUDIO.md)
- 로컬 실행: `python3 -m http.server` 후 `http://localhost:8000/`

## 저작권·크레딧

- 블록·히어로·마스코트(큐비) 그래픽: 이 프로젝트에서 직접 그린 오리지널 SVG.
- 그림 아이콘: [Twemoji](https://github.com/jdecked/twemoji) © Twitter/X & contributors, **CC‑BY 4.0**.
- 글꼴: Andika (SIL OFL), Jua, Silkscreen (Google Fonts, OFL).
- 음성: ElevenLabs 로 생성 (영어: Jessica, 한국어: Annie KR).
- 낱소리(파닉스 음소) 26개: [Open Letter Sounds](https://github.com/purplecomputerorg/openlettersounds) © Purple Computer, **CC0 1.0** (사람이 검수한 a–z 소리). 나머지 이중자음·모음팀 소리는 ElevenLabs로 직접 만들었어요. 자세한 출처: `assets/audio/p/CREDITS.md`
- 이 앱은 특정 게임·영화·출판사(리틀팍스 포함)와 관련이 없는 비영리 가족 학습용 프로젝트예요.
