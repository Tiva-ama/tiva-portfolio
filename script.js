(function(){
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------- loading screen -------- */
  var loadingEl = document.getElementById('loading');
  var pctEl = document.getElementById('loadPct');
  var barEl = loadingEl.querySelector('.bar-fill');
  if (reduceMotion){
    loadingEl.classList.add('hide');
  } else {
    var pct = 0;
    var timer = setInterval(function(){
      pct = Math.min(100, pct + 5 + Math.ceil(Math.random() * 13));
      // เครื่องหมาย % อยู่นอก span ใน HTML อยู่แล้ว ตรงนี้จึงใส่แค่ตัวเลข
      pctEl.textContent = pct;
      barEl.style.width = pct + '%';
      if (pct >= 100){
        clearInterval(timer);
        setTimeout(function(){ loadingEl.classList.add('hide'); }, 160);
      }
    }, 70);
  }

  /* -------- nav scrollspy -------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.pill-nav a'));
  function setActive(id){
    links.forEach(function(l){ l.classList.toggle('active', l.getAttribute('data-sec') === id); });
  }
  var sections = ['home','about','work','portfolio','contact']
    .map(function(id){ return document.getElementById(id); })
    .filter(Boolean);

  /* เดิมใช้ IntersectionObserver แล้วเทียบว่า section ไหน intersectionRatio สูงสุด
     ซึ่งผิด เพราะค่านั้นคิดเป็นสัดส่วนของความสูงตัวเอง ไม่ใช่ของจอ
     home สูง 666px จึงขึ้นถึง 1.00 ได้ ส่วน about สูง 1014px ทำได้สูงสุด 0.89
     home เลยชนะตลอดแม้โผล่แค่นิดเดียว เมนูจึงค้างที่ Home ทั้งที่เลื่อนมา About แล้ว

     เปลี่ยนมาวัดจากตำแหน่งการเลื่อนแทน: ลากเส้นอ้างอิงไว้ใต้แถบเมนู
     section ที่ active คืออันสุดท้ายที่ขอบบนเลยเส้นนี้ไปแล้ว
     วิธีนี้ไม่สนใจว่า section สูงเท่าไร ผลจึงตรงกับที่ตาเห็นเสมอ */
  var navStage = document.querySelector('.nav-stage');

  /* ตอนกดปุ่มเมนู หน้าจะไถลลงไปทีละนิด ระบบจึงไล่ไฮไลต์ทุกหัวข้อที่ผ่านระหว่างทาง
     กด Contacts ทีเดียวเมนูวิ่ง contact > home > about > work > portfolio > contact
     เห็นเป็นอาการกระพริบ จึงล็อกไว้ที่ปุ่มที่กด แล้วปลดเมื่อไถลถึงที่หมายจริง */
  var lockTo = null, lockTimer = null;
  function lockSpy(id){
    lockTo = id;
    setActive(id);
    clearTimeout(lockTimer);
    // กันเหนียว เผื่อไถลไปไม่ถึงที่หมายด้วยเหตุใดก็ตาม จะได้ไม่ล็อกค้าง
    lockTimer = setTimeout(function(){ lockTo = null; updateSpy(); }, 1500);
  }
  function unlockSpy(){ lockTo = null; clearTimeout(lockTimer); }

  function updateSpy(){
    if (!sections.length) return;
    var line = (navStage ? navStage.getBoundingClientRect().height : 0) + 40;
    var current = sections[0];
    sections.forEach(function(s){
      if (s.getBoundingClientRect().top <= line) current = s;
    });
    // เลื่อนสุดหน้าแล้วให้เป็นหัวข้อสุดท้ายเสมอ ไม่งั้น section ท้าย ๆ ที่สั้น
    // จะไม่มีทางดันขอบบนขึ้นมาถึงเส้น แล้วจะไม่เคยถูกไฮไลต์เลย
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2){
      current = sections[sections.length - 1];
    }
    if (lockTo){
      if (current.id === lockTo) unlockSpy();   // ถึงที่หมายแล้ว คืนการทำงานปกติ
      else { setActive(lockTo); return; }       // ยังไถลอยู่ คงปุ่มที่กดไว้
    }
    setActive(current.id);
  }

  /* เรียกตรง ๆ ไม่หน่วงด้วย requestAnimationFrame
     เพราะถ้า rAF ไม่ถูกเรียกด้วยเหตุใดก็ตาม ธงกันซ้ำจะค้างเป็น true
     แล้ว scroll ครั้งถัด ๆ ไปจะถูกกลืนหมด เมนูค้างตลอดกาล
     งานในนี้คืออ่านตำแหน่ง 5 ก้อน เบาพอที่จะทำทุกครั้งได้ */
  window.addEventListener('scroll', updateSpy, { passive: true });
  window.addEventListener('resize', updateSpy);
  updateSpy();

  links.forEach(function(l){
    l.addEventListener('click', function(){ lockSpy(l.getAttribute('data-sec')); });
  });
  // ถ้าผู้ใช้ปัดหรือหมุนล้อเองระหว่างที่ยังไถลอยู่ ให้ถือว่าเปลี่ยนใจ ปลดล็อกทันที
  window.addEventListener('wheel', unlockSpy, { passive: true });
  window.addEventListener('touchstart', unlockSpy, { passive: true });

  /* -------- ชื่อใหญ่เลื่อนขึ้นจากใต้เส้น -------- */
  var heroTitle = document.getElementById('heroTitle');
  if (heroTitle){
    if (reduceMotion){ heroTitle.classList.add('in'); }
    else { setTimeout(function(){ heroTitle.classList.add('in'); }, 120); }
  }

  /* -------- scroll reveal -------- */
  function delayFor(el){
    if (el.hasAttribute('data-delay')) return parseInt(el.getAttribute('data-delay'), 10) || 0;
    var parent = el.parentElement;
    if (parent && /grid-3|grid-6/.test(parent.className)){
      return Math.min(Array.prototype.indexOf.call(parent.children, el), 8) * 70;
    }
    return 0;
  }
  function revealNow(el){
    if (el.classList.contains('in')) return;
    el.style.transitionDelay = delayFor(el) + 'ms';
    el.classList.add('in');
  }
  function revealAllIn(container){
    container.querySelectorAll('[data-reveal]').forEach(function(el){
      revealNow(el);
    });
  }

  var revealEls = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)){
    revealEls.forEach(function(el){ el.classList.add('in'); });
  } else {
    var revealIO = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (!e.isIntersecting) return;
        revealNow(e.target);
        revealIO.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function(el){ revealIO.observe(el); });
  }

  /* -------- typing effect (ตำแหน่งงาน) -------- */
  var typedEl = document.getElementById('typedRole');
  if (typedEl){
    // ตัดช่องว่างหัวท้ายของแต่ละรายการ ไม่งั้นบรรทัดจะเริ่มด้วยเว้นวรรคและเสียเวลาพิมพ์ช่องว่างเปล่า
    var roles = (typedEl.getAttribute('data-roles') || '').split('|')
      .map(function(s){ return s.trim(); }).filter(Boolean);
    if (reduceMotion || roles.length === 0){
      typedEl.textContent = roles[0] || '';
    } else {
      var ri = 0, ci = 0, deleting = false;
      var tick = function(){
        var word = roles[ri];
        ci += deleting ? -1 : 1;
        typedEl.textContent = word.slice(0, ci);
        var wait = deleting ? 45 : 90;
        if (!deleting && ci === word.length){
          // มีรายการเดียว พิมพ์จบแล้วปล่อยค้างไว้ ไม่ต้องลบแล้วพิมพ์ซ้ำวนไปเรื่อย ๆ
          if (roles.length === 1) return;
          deleting = true; wait = 1600;
        }
        else if (deleting && ci === 0){ deleting = false; ri = (ri + 1) % roles.length; wait = 350; }
        setTimeout(tick, wait);
      };
      tick();
    }
  }


  /* -------- lightbox ใบเซอร์ -------- */
  var lb = document.getElementById('certLightbox');
  var lbStage = document.getElementById('lbStage');
  var lbTitle = document.getElementById('lbTitle');
  var lbClose = document.getElementById('lbClose');
  var lastFocused = null;

  function openLightbox(card){
    var src = card.getAttribute('data-cert-src');
    var title = card.getAttribute('data-cert-title') || '';
    lbStage.innerHTML = '';
    if (src){
      var img = document.createElement('img');
      img.src = src;
      img.alt = title;
      lbStage.appendChild(img);
    } else {
      lbStage.innerHTML = '<div class="lb-empty"><svg viewBox="0 0 24 24"><use href="#ic-medal"/></svg>' +
        '<strong></strong><small>ยังไม่ได้ใส่รูป — เพิ่ม path รูปใน data-cert-src ของการ์ดใบนี้</small></div>';
      lbStage.querySelector('strong').textContent = title;
    }
    lbTitle.textContent = title;
    lastFocused = document.activeElement;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }
  function closeLightbox(){
    lb.hidden = true;
    lbStage.innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  // ปิดได้สามทาง: ปุ่มกากบาท คลิกพื้นหลังนอกกรอบ และปุ่ม Esc
  lbClose.addEventListener('click', closeLightbox);
  lb.addEventListener('click', function(e){
    // นับเฉพาะตอนคลิกโดนพื้นหลังจริง ๆ ไม่ใช่คลิกโดนรูปแล้ว event ลอยขึ้นมา
    if (e.target === lb) closeLightbox();
  });
  document.addEventListener('keydown', function(e){
    if (lb.hidden) return;
    if (e.key === 'Escape' || e.key === 'Esc'){ closeLightbox(); return; }

    // aria-modal บอกว่านี่คือหน้าต่างซ้อน แต่ไม่ได้กันโฟกัสให้จริง
    // ถ้าไม่ดักไว้ กด Tab แล้วโฟกัสจะไหลไปโดนลิงก์ข้างหลังที่ถูกฉากทึบบังอยู่
    if (e.key !== 'Tab') return;
    var focusable = lb.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    var first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });

  document.querySelectorAll('.cert-card').forEach(function(card){
    // ถ้ามี data-cert-src ให้โชว์รูปในการ์ดเลย
    var src = card.getAttribute('data-cert-src');
    if (src){
      var thumb = document.createElement('img');
      // แท็บนี้ไม่ได้เปิดเป็นค่าตั้งต้น รูปใบเซอร์จึงไม่ควรโหลดพร้อมหน้าแรก
      thumb.loading = 'lazy';
      thumb.decoding = 'async';
      thumb.src = src;
      thumb.alt = card.getAttribute('data-cert-title') || '';
      card.insertBefore(thumb, card.firstChild);
    }
    card.addEventListener('click', function(){ openLightbox(card); });
  });

  // การ์ดผลงาน: คลิกที่ไหนก็ได้เพื่อเข้าหน้ารายละเอียด ยกเว้นตอนกดลิงก์ข้างใน
  document.querySelectorAll('.proj-card[data-href]').forEach(function(card){
    var url = card.getAttribute('data-href');
    card.classList.add('is-clickable');
    card.addEventListener('click', function(e){
      if (e.target.closest('a')) return;   // ปล่อยให้ลิงก์จริงทำงานของมัน
      location.href = url;
    });
  });

  /* -------- Daily Rotation: มีลิงก์เมื่อไหร่ ค่อยกลายเป็นตัวเล่นจริง -------- */
  var rot = document.getElementById('rotation');
  if (rot){
    var raw = (rot.getAttribute('data-playlist') || '').trim();
    var m = raw.match(/(playlist|album|track|artist|episode|show)\/([A-Za-z0-9]+)/);
    if (m){
      var frame = document.createElement('iframe');
      frame.src = 'https://open.spotify.com/embed/' + m[1] + '/' + m[2] + '?utm_source=generator&theme=0';
      // ความสูงตั้งเองได้ที่ data-height ใน HTML จะได้ไม่ต้องมาแก้ไฟล์นี้
      var h = parseInt(rot.getAttribute('data-height'), 10);
      frame.height = (h > 0) ? h : ((m[1] === 'track' || m[1] === 'episode') ? 152 : 352);
      frame.loading = 'lazy';
      frame.title = 'เพลย์ลิสต์บน Spotify';
      frame.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      rot.querySelector('.rot-body').replaceChildren(frame);
    } else {
      // ยังไม่มีลิงก์เพลย์ลิสต์ ซ่อนการ์ดไปก่อน
      // ของเดิมโชว์ข้อความ "วางลิงก์เพลย์ลิสต์ใน data-playlist" ให้คนเข้าเว็บอ่าน
      // ซึ่งเป็นโน้ตสำหรับคนทำเว็บ ไม่ใช่ข้อความสำหรับผู้เข้าชม
      // พอใส่ลิงก์ใน data-playlist การ์ดจะกลับมาเองโดยไม่ต้องแก้อะไรอีก
      rot.hidden = true;
    }
  }

  /* -------- badge: บัตรห้อยสายคล้อง --------
     บัตรถูกจำลองเป็นลูกตุ้มแขวนจากห่วงด้านบน มีสองสปริงทำงานพร้อมกัน
       drop  = ระยะที่บัตรยังลอยอยู่เหนือจุดแขวน (1 = ยังไม่หล่น, 0 = ห้อยนิ่ง)
       theta = มุมแกว่งซ้ายขวา หน่วยเรเดียน
     การเลื่อนหน้าจอไม่ได้ผลักบัตรด้วย "ความเร็ว" แต่ด้วย "ความเร็วที่เปลี่ยนไป"
     เพราะของที่ห้อยอยู่จะเหวี่ยงตอนออกตัวและตอนเบรก ไม่ใช่ตอนเลื่อนนิ่ง ๆ */
  var rig = document.getElementById('badgeRig');
  var swing = document.getElementById('badgeSwing');
  if (rig && swing && !reduceMotion){
    var DROP_PX = 150;
    var K_DROP = 150, C_DROP = 12.5;   // สปริงแนวดิ่ง เด้งเบา ๆ ครั้งเดียวแล้วนิ่ง
    /* สายยาวขึ้น = ลูกตุ้มยาวขึ้น คาบจึงต้องช้าลงตามสูตร T ∝ √L
       และมุมต้องแคบลงด้วย เพราะปลายสายที่อยู่ไกลจากจุดหมุนกวาดเป็นระยะทางมากกว่าเดิม */
    var K_SW = 22,  C_SW = 1.5;        // คาบราว 1.35 วินาที นิ่งสนิทใน ~6 วินาที
    var MAX_TH = 0.34;
    var drop = 1, dropV = 0, theta = 0, omega = 0;
    var released = false, running = false, dragging = false;
    var lastV = 0, lastY = window.pageYOffset, lastT = performance.now();
    var frameT = lastT;

    function clamp(v, lo, hi){ return v < lo ? lo : (v > hi ? hi : v); }
    function paint(){
      swing.style.transform = 'translateY(' + (-drop * DROP_PX).toFixed(2) + 'px) rotate(' + theta.toFixed(5) + 'rad)';
      swing.style.opacity = clamp(1 - drop * 1.6, 0, 1);
    }
    paint();

    function step(now){
      var dt = clamp((now - frameT) / 1000, 0, 0.05);
      frameT = now;
      dropV += (-K_DROP * drop - C_DROP * dropV) * dt;
      drop  += dropV * dt;
      if (!dragging){
        omega += (-K_SW * theta - C_SW * omega) * dt;
        omega = clamp(omega, -3.2, 3.2);
        theta = clamp(theta + omega * dt, -MAX_TH, MAX_TH);
      }
      paint();
      var settled = !dragging && Math.abs(theta) < 0.0007 && Math.abs(omega) < 0.0015
                    && Math.abs(drop) < 0.0007 && Math.abs(dropV) < 0.002;
      if (settled){ theta = omega = drop = dropV = 0; paint(); running = false; return; }
      raf = requestAnimationFrame(step);
    }
    var raf = 0;
    function start(){
      if (running || !released) return;
      running = true; frameT = performance.now();
      raf = requestAnimationFrame(step);
    }

    // ปล่อยบัตรลงมาเมื่อเลื่อนมาถึง แล้วให้มันแกว่งค้างไว้นิดหน่อย
    if ('IntersectionObserver' in window){
      var dropIO = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if (!e.isIntersecting || released) return;
          released = true; omega = -0.62;
          dropIO.unobserve(e.target);
          start();
        });
      }, { threshold: 0.3 });
      dropIO.observe(rig);
    } else {
      released = true; drop = 0; paint();
    }

    window.addEventListener('scroll', function(){
      var now = performance.now(), y = window.pageYOffset;
      var dt = Math.max(now - lastT, 8) / 1000;
      var v = (y - lastY) / dt;
      lastY = y; lastT = now;
      if (!dragging){
        omega += clamp(v - lastV, -2600, 2600) * 0.00024;
        start();
      }
      lastV = v;
    }, { passive: true });

    /* ลากบัตรเล่นได้ด้วย — จับแล้วเหวี่ยง ปล่อยแล้วค่อยแกว่งกลับเข้าที่ */
    var dragT = 0, dragPrev = 0, dragPrevT = 0;
    swing.addEventListener('pointerdown', function(e){
      if (!released) return;
      var box = rig.getBoundingClientRect();
      dragT = box.top - 24; dragPrev = theta; dragPrevT = performance.now();
      dragging = true; omega = 0;
      swing.setPointerCapture(e.pointerId);
      swing.style.cursor = 'grabbing';
      var pivotX = box.left + box.width / 2;
      swing._move = function(ev){
        var dy = Math.max(ev.clientY - dragT, 40);
        var next = clamp(Math.atan2(ev.clientX - pivotX, dy), -MAX_TH, MAX_TH);
        var t = performance.now(), dt = Math.max(t - dragPrevT, 12) / 1000;
        omega = clamp((next - dragPrev) / dt, -3.2, 3.2);
        dragPrev = next; dragPrevT = t; theta = next;
        paint();
      };
      swing.addEventListener('pointermove', swing._move);
      start();
    });
    function endDrag(e){
      if (!dragging) return;
      dragging = false;
      swing.style.cursor = '';
      swing.removeEventListener('pointermove', swing._move);
      if (e && e.pointerId != null && swing.hasPointerCapture(e.pointerId)) swing.releasePointerCapture(e.pointerId);
      start();
    }
    swing.addEventListener('pointerup', endDrag);
    swing.addEventListener('pointercancel', endDrag);
    swing.style.cursor = 'grab';
  }

  /* -------- portfolio tabs -------- */
  var tabBtns = document.querySelectorAll('.tabbtn');
  tabBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      // aria-selected ต้องขยับตามคลาส active ด้วย ไม่งั้นโปรแกรมอ่านหน้าจอ
      // จะยังรายงานว่าแท็บแรกถูกเลือกอยู่ ทั้งที่ภาพบนจอเปลี่ยนไปแล้ว
      tabBtns.forEach(function(b){ b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      document.querySelectorAll('.tabpanel').forEach(function(p){ p.classList.remove('active'); });
      var panel = document.getElementById('tab-' + btn.getAttribute('data-tab'));
      panel.classList.add('active');
      // แท็บที่เพิ่งเปิดยังไม่เคยผ่าน observer (เพราะ display:none) จึงสั่ง reveal เอง
      requestAnimationFrame(function(){ revealAllIn(panel); });
    });
  });
})();
