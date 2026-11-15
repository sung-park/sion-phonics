// Keeps option text (graphemes, rimes like "-at", words) on ONE line and inside its button.
// Root cause of the Galaxy Tab bug: .tile was display:grid, so "-" + <span>a</span> + "t" became
// three stacked grid items. Now every text tile gets a single inline .tx wrapper, a data-len
// attribute for CSS font steps, and a last-resort shrink-to-fit pass.
const SEL = '.tile:not(.pic), .glyph, .pairbtn .l';
function wrap(el){
  let tx = el.querySelector(':scope > .tx');
  if (!tx){
    tx = document.createElement('span'); tx.className = 'tx';
    [...el.childNodes].forEach(n => tx.appendChild(n));
    el.appendChild(tx);
  }
  const len = tx.textContent.replace(/\s+/g,'').length;
  el.dataset.len = len > 6 ? 'xl' : String(len);
  return tx;
}
function shrink(el, tx){
  tx.style.fontSize = '';
  const cs = getComputedStyle(el);
  const avail = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const w = tx.scrollWidth;
  if (avail > 0 && w > avail){
    const k = Math.max(0.5, (avail - 2) / w);
    tx.style.fontSize = (k * 100).toFixed(1) + '%';
  }
}
export function fitText(root = document){
  root.querySelectorAll(SEL).forEach(el => { if (!el.textContent.trim()) return; const tx = wrap(el); shrink(el, tx); });
}
let raf = 0;
const schedule = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; fitText(); }); };
export function initFit(){
  new MutationObserver(muts => { if (muts.some(m => m.addedNodes.length)) schedule(); })
    .observe(document.body, { childList: true, subtree: true });
  addEventListener('resize', schedule); addEventListener('orientationchange', schedule);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
  schedule();
}
