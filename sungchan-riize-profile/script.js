// ...existing code...
document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
  const panels = Array.from(document.querySelectorAll('.tab-panel'));

  function activateTab(button) {
    const targetId = button.getAttribute('data-target');
    tabButtons.forEach(b => {
      const isActive = b === button;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    panels.forEach(p => p.classList.toggle('hidden', p.id !== targetId));
    button.focus();
  }

  // initialize
  const initial = tabButtons.find(b => b.classList.contains('active')) || tabButtons[0];
  if (initial) activateTab(initial);

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => activateTab(btn));
    btn.addEventListener('keydown', (e) => {
      const idx = tabButtons.indexOf(btn);
      if (e.key === 'ArrowRight') activateTab(tabButtons[(idx + 1) % tabButtons.length]);
      if (e.key === 'ArrowLeft') activateTab(tabButtons[(idx - 1 + tabButtons.length) % tabButtons.length]);
    });
  });

  // Modal & video
  const modal = document.getElementById('videoModal');
  const backdrop = document.getElementById('modalBackdrop');
  const closeBtn = document.getElementById('modalClose');
  const container = document.getElementById('videoContainer');

  function isYouTube(url){
    try{
      const u = new URL(url);
      return u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be');
    }catch(e){
      return false;
    }
  }

  function toYouTubeEmbed(url){
    try{
      const u = new URL(url);
      if(u.hostname.includes('youtube.com')){
        const id = u.searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null;
      }
      if(u.hostname.includes('youtu.be')){
        const id = u.pathname.slice(1);
        return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null;
      }
    }catch(e){
      return null;
    }
    return null;
  }

  function isMp4(url){
    return typeof url === 'string' && url.match(/\.(mp4|webm|ogg)(\?.*)?$/i);
  }

  function openVideo(src){
    if(!src) return;
    // YouTube embed
    if (isYouTube(src)){
      const embed = toYouTubeEmbed(src);
      if(!embed) {
        // fallback: open externally
        window.open(src, '_blank');
        return;
      }
      container.innerHTML = '';
      const iframe = document.createElement('iframe');
      iframe.src = embed;
      iframe.title = 'Video player';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      container.appendChild(iframe);
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn && closeBtn.focus();
      return;
    }

    // direct video file (mp4/webm/ogg)
    if (isMp4(src)){
      container.innerHTML = '';
      const video = document.createElement('video');
      video.src = src;
      video.controls = true;
      video.autoplay = true;
      video.style.width = '100%';
      video.style.height = '100%';
      video.playsInline = true;
      container.appendChild(video);
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn && closeBtn.focus();
      return;
    }

    // Other external pages (Weibo etc.) — open in new tab
    window.open(src, '_blank');
  }

  function closeVideo(){
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    // remove media to stop playback
    container.innerHTML = '';
    document.body.style.overflow = '';
  }

  // attach to work items
  document.querySelectorAll('.work-item').forEach(item => {
    // make keyboard accessible if not already
    if (!item.hasAttribute('tabindex')) item.setAttribute('tabindex','0');

    item.addEventListener('click', () => {
      const src = item.getAttribute('data-video');
      openVideo(src);
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });

  if (backdrop) backdrop.addEventListener('click', closeVideo);
  if (closeBtn) closeBtn.addEventListener('click', closeVideo);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeVideo();
  });
});
// ...existing code...