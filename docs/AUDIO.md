# 오디오 생성 · 검수 메모

- 엔진: ElevenLabs `eleven_multilingual_v2`
- 영어 목소리: **Jessica** (premade, "Playful, Bright, Warm", American) – 속도 0.9 (문장 0.85)
- 한국어 안내 목소리: **Annie KR** (Seoul, young)
- 후처리: ffmpeg 무음 제거 + 라우드니스 정규화(-16 LUFS) → mono 64 kbps mp3
- 파일 수: 단어 548 · 문장 210 · 음소 45 · 글자 이름 26 · 칭찬/효과 문구 18 · 한국어 안내 22 = **869개 (약 7.9 MB)**
- 브라우저 TTS(speechSynthesis)는 사용하지 않아요. `manifest.json` 에 없는 소리는 재생하지 않아요.

## 검수 방법

1. Whisper(base.en) 로 전 파일 받아쓰기 → 불일치 118개 추출 (대부분 동음이의어·숫자 표기·짧은 단어 오인식)
2. 불일치 단어와 모든 음소를 wav2vec2 음소 인식기(`facebook/wav2vec2-lv-60-espeak-cv-ft`)로 IPA 확인
3. 실제 문제였던 것 재생성: `sea`(say처럼 들림), `cane`(can처럼 들림), `boot`(boat처럼 들림), `hog`, `hop`, `I`
4. 단일 글자 TTS("E.")가 불안정해서 → 글자 이름은 알파벳 낭독("A. B. C. …")을 녹음해 쉼 구간으로 분리

## 음소(낱소리) 만드는 법

TTS에 "buh"처럼 쓰면 모음이 붙어서, 대신 **실제 단어를 녹음한 뒤 그 안에서 소리만 잘라냈어요**.

| 종류 | 방법 | 소리 |
|---|---|---|
| 무성 파열음 | 단어 첫머리, 모음 시작 직전까지 (pin, top, cat, kit, chip, hat) | p t c k ch h |
| 유성 파열음 | 첫머리 + 모음 35ms 이내 | b d g j |
| 마찰음 | 첫머리 마찰 구간을 잘라 0.3–0.45초로 늘림 (sun, zoo, fan, van, ship, thin, this) | s z f v sh th dh |
| 비음·유음 | 단어 끝 구간을 잘라 늘림 (hum, sun, bell, sing) | m n l ng |
| 단모음 | 단어 첫 모음, 자음 닫힘 직전까지 (at, egg, it, ox, up) | a e i o u |
| 장모음 | 글자 이름 사용 (A E I O U) | ā ē ī ō ū |
| 기타 모음 | out, zoo, book, boy, saw, are, or, her 에서 분리 | ow oo uu oi aw ar or er |

## 🔎 사람 귀로 한 번 확인해 주세요 (자신 없는 소리)

`assets/audio/p/` 안의 파일들이에요. 이상하면 알려주세요 – 그 소리만 다시 만들 수 있어요.

- **b, d, g** – 유성 파열음은 모음 없이 내기가 원래 어려워서, 아주 짧은 모음 꼬리가 남아 있을 수 있어요.
- **dh** (this의 th) – 0.19초로 짧고 약해요.
- **uu** (book의 짧은 oo) – 단어 중간에서 잘라내서 0.15초로 짧아요.
- **w, y, r** – 활음이라 뒤 모음이 살짝 섞여 있어요(we/ye/re 느낌).
- **kw** (qu) – k + w 가 아주 짧게.
- **ng, nk** – 콧소리 구간 경계가 애매할 수 있어요.
- **aw** – 미국식이라 '아-'에 가깝게 들릴 수 있어요 (saw).
- **e, i** – 단모음 e/i는 서로 비슷하게 들리지 않는지 확인 부탁해요.
- 글자 이름 **k, q, j** – 인식기에서 약간 애매하게 나왔어요.
