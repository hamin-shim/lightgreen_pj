// Lightweight script for Plantagotchi demo
document.addEventListener('DOMContentLoaded', ()=>{
  // Loading overlay: hide after 2s with smooth fade
  const loading = document.getElementById('loading');
  setTimeout(()=>{
    loading.style.transition = 'opacity 500ms ease';
    loading.style.opacity = 0;
    setTimeout(()=>{ loading.remove(); }, 600);
  }, 2000);

  // Custom cursor element follows mouse; uses assets/ref5.jpg if present
  const cursor = document.getElementById('customCursor');
  window.addEventListener('mousemove', (e)=>{
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
  // hide cursor on touch devices
  window.addEventListener('touchstart', ()=>{ cursor.style.display = 'none'; document.body.style.cursor = 'auto'; });

  // If reference image for pet isn't present, use a lightweight fallback (colored sprite)
  const petImg = document.getElementById('petImage');
  petImg.addEventListener('error', ()=>{
    petImg.src = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="280"><rect width="100%" height="100%" fill="#072a2a"/><text x="50%" y="50%" font-size="20" fill="#9ff" font-family="sans-serif" dominant-baseline="middle" text-anchor="middle">ref6.jpg not found</text></svg>');
    petImg.style.imageRendering = 'auto';
  });

  // Add CRT flicker overlay
  const deviceScreen = document.querySelector('.device-screen');
  if(deviceScreen){
    const flick = document.createElement('div');
    flick.className = 'crt-flicker';
    deviceScreen.appendChild(flick);
  }

  // Glitch effect: toggle class on .glitch wrapper intermittently
  const glitchWrap = document.getElementById('glitchWrap');
  if(glitchWrap){
    function triggerGlitch(){
      glitchWrap.classList.add('glitch--active');
      setTimeout(()=>glitchWrap.classList.remove('glitch--active'), 420);
      // schedule next glitch randomly between 2s and 8s
      setTimeout(triggerGlitch, 2000 + Math.random()*6000);
    }
    // start after a short delay
    setTimeout(triggerGlitch, 1200 + Math.random()*1600);
  }

});
