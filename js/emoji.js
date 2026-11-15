// Twemoji file name for an emoji string
export function emojiCode(e){
  const cps = [...e].map(c=>c.codePointAt(0).toString(16));
  const hasZwj = cps.includes('200d');
  return (hasZwj ? cps : cps.filter(c=>c!=='fe0f')).join('-');
}
export const emojiSrc = e => `assets/emoji/${emojiCode(e)}.svg`;
