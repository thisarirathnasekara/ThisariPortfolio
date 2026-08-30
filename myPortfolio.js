// ========== LOADING SCREEN ==========
function hideLoader(){
  document.getElementById('loader').classList.add('hidden');
}
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(hideLoader, 1800);
});
setTimeout(hideLoader, 4000);

// ========== CLOCK ==========
function updateClock(){
  var now = new Date();
  var offsetMinutes = 5 * 60 + 30;
  var utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  var target = new Date(utc + offsetMinutes * 60000);
  var hh = String(target.getHours()).padStart(2, '0');
  var mm = String(target.getMinutes()).padStart(2, '0');
  document.getElementById('clock').textContent = hh + ':' + mm + ' SLST';
  var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('date').textContent =
    days[target.getDay()] + ' ' + target.getDate() + ' ' + months[target.getMonth()] + ' ' + target.getFullYear();
}
updateClock();
setInterval(updateClock, 1000 * 30);

// ========== THEME TOGGLE (with localStorage) ==========
var themeBtn = document.getElementById('themeToggle');
var savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme) {
  document.body.setAttribute('data-theme', savedTheme);
  themeBtn.textContent = savedTheme === 'dark' ? 'Dark' : 'Light';
}
themeBtn.addEventListener('click', function() {
  var isLight = document.body.getAttribute('data-theme') === 'light';
  var newTheme = isLight ? 'dark' : 'light';
  document.body.setAttribute('data-theme', newTheme);
  themeBtn.textContent = isLight ? 'Dark' : 'Light';
  themeBtn.setAttribute('aria-label', isLight ? 'Switch to light mode' : 'Switch to dark mode');
  localStorage.setItem('portfolio-theme', newTheme);
});



// ========== SMOOTH-SCROLL NAV (with page transition) ==========
var mainContent = document.getElementById('mainContent');
document.querySelectorAll('nav a').forEach(function(link) {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    var target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    mainContent.style.opacity = '0';
    setTimeout(function() {
      target.scrollIntoView({ behavior: 'auto', block: 'start' });
      requestAnimationFrame(function() {
        mainContent.style.opacity = '1';
      });
    }, 250);
    document.querySelectorAll('.panel.focused').forEach(function(p) { p.classList.remove('focused'); });
    target.classList.add('focused');
    setTimeout(function() { target.classList.remove('focused'); }, 1500);
  });
});

// ========== SCROLL REVEAL ==========
var revealEls = document.querySelectorAll('.reveal');
var observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(function(el) { observer.observe(el); });

// ========== CURSOR TRAIL ==========
var trailCount = 0;
var MAX_TRAIL = 18;
document.addEventListener('mousemove', function(e) {
  if (trailCount >= MAX_TRAIL) return;
  trailCount++;
  var dot = document.createElement('div');
  dot.className = 'trail-dot';
  dot.style.left = (e.clientX - 4) + 'px';
  dot.style.top = (e.clientY - 4) + 'px';
  document.body.appendChild(dot);
  setTimeout(function() {
    if (dot.parentNode) dot.parentNode.removeChild(dot);
    trailCount--;
  }, 600);
});

// ========== CURSOR GLOW ==========
var bgGlow = document.getElementById('bgGlow');
var glowTicking = false;
var lastMouseX = window.innerWidth / 2;
var lastMouseY = window.innerHeight / 2;
function applyGlowPosition() {
  bgGlow.style.setProperty('--mx', lastMouseX + 'px');
  bgGlow.style.setProperty('--my', lastMouseY + 'px');
  glowTicking = false;
}
window.addEventListener('mousemove', function(e) {
  lastMouseX = e.clientX; lastMouseY = e.clientY;
  if (!glowTicking) { requestAnimationFrame(applyGlowPosition); glowTicking = true; }
});

// ========== GRID CANVAS WITH WAVE ==========
var canvas = document.getElementById('gridCanvas');
var ctx = canvas.getContext('2d');
var GRID_SIZE = 40;
var WAVE_RADIUS = 220;
var WAVE_AMPLITUDE = 10;
var WAVE_FREQ = 0.04;
var WAVE_SPEED = 4;
var WAVE_STEP = 5;
var targetGX = -500, targetGY = -500;
var currentGX = -500, currentGY = -500;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var gridColor = getComputedStyle(document.documentElement).getPropertyValue('--grid-line').trim();
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  var time = performance.now() / 1000;
  var active = currentGX > -400;
  var w = canvas.width, h = canvas.height;
  var gx, gy, dx, dy, dist, ox, oy, f, wave, a, near, x, y;

  for (gx = 0; gx <= w; gx += GRID_SIZE) {
    near = active && Math.abs(gx - currentGX) < WAVE_RADIUS + WAVE_AMPLITUDE;
    ctx.beginPath();
    if (!near) {
      ctx.moveTo(gx, 0); ctx.lineTo(gx, h);
    } else {
      for (y = 0; y <= h; y += WAVE_STEP) {
        dx = gx - currentGX; dy = y - currentGY;
        dist = Math.sqrt(dx * dx + dy * dy);
        ox = 0; oy = 0;
        if (dist < WAVE_RADIUS) {
          f = Math.pow(1 - dist / WAVE_RADIUS, 1.5);
          wave = Math.sin(dist * WAVE_FREQ - time * WAVE_SPEED) * WAVE_AMPLITUDE * f;
          a = Math.atan2(dy, dx);
          ox = Math.cos(a) * wave; oy = Math.sin(a) * wave;
        }
        if (y === 0) ctx.moveTo(gx + ox, y + oy);
        else ctx.lineTo(gx + ox, y + oy);
      }
    }
    ctx.stroke();
  }

  for (gy = 0; gy <= h; gy += GRID_SIZE) {
    near = active && Math.abs(gy - currentGY) < WAVE_RADIUS + WAVE_AMPLITUDE;
    ctx.beginPath();
    if (!near) {
      ctx.moveTo(0, gy); ctx.lineTo(w, gy);
    } else {
      for (x = 0; x <= w; x += WAVE_STEP) {
        dx = x - currentGX; dy = gy - currentGY;
        dist = Math.sqrt(dx * dx + dy * dy);
        ox = 0; oy = 0;
        if (dist < WAVE_RADIUS) {
          f = Math.pow(1 - dist / WAVE_RADIUS, 1.5);
          wave = Math.sin(dist * WAVE_FREQ - time * WAVE_SPEED) * WAVE_AMPLITUDE * f;
          a = Math.atan2(dy, dx);
          ox = Math.cos(a) * wave; oy = Math.sin(a) * wave;
        }
        if (x === 0) ctx.moveTo(x + ox, gy + oy);
        else ctx.lineTo(x + ox, gy + oy);
      }
    }
    ctx.stroke();
  }
}

function gridLoop() {
  var dx = targetGX - currentGX;
  var dy = targetGY - currentGY;
  if (Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3) {
    currentGX += dx * 0.12;
    currentGY += dy * 0.12;
  }
  drawGrid();
  requestAnimationFrame(gridLoop);
}
gridLoop();

window.addEventListener('mousemove', function(e) {
  targetGX = e.clientX;
  targetGY = e.clientY;
});

// ========== HERO FADE ON SCROLL ==========
var hero = document.getElementById('hero');
var fadeTicking = false;
function applyHeroFade() {
  var heroHeight = hero.offsetHeight || window.innerHeight;
  var fadeDistance = heroHeight * 0.8;
  var opacity = Math.max(1 - window.scrollY / fadeDistance, 0);
  hero.style.opacity = opacity;
  hero.style.pointerEvents = opacity < 0.05 ? 'none' : 'auto';
  fadeTicking = false;
}
window.addEventListener('scroll', function() {
  if (!fadeTicking) { requestAnimationFrame(applyHeroFade); fadeTicking = true; }
}, { passive: true });
applyHeroFade();

// ========== SCROLL INDICATOR (clickable + draggable) ==========
var scrollIndicator = document.getElementById('scrollIndicator');
var scrollTrack = document.getElementById('scrollTrack');
var scrollDot = document.getElementById('scrollDot');
var scrollHint = document.getElementById('scrollHint');
var TRACK_HEIGHT = 190;
var DOT_SIZE = 15;

function scrollToPosition(fraction) {
  var docHeight = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: fraction * docHeight, behavior: 'smooth' });
}

scrollTrack.addEventListener('click', function(e) {
  var rect = scrollTrack.getBoundingClientRect();
  var fraction = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
  scrollToPosition(fraction);
});

var draggingDot = false;
scrollDot.addEventListener('mousedown', function(e) { draggingDot = true; e.preventDefault(); });
scrollDot.addEventListener('touchstart', function() { draggingDot = true; }, { passive: true });

function onDotMove(clientY) {
  if (!draggingDot) return;
  var rect = scrollTrack.getBoundingClientRect();
  var fraction = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
  var docHeight = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: fraction * docHeight });
}
document.addEventListener('mousemove', function(e) { onDotMove(e.clientY); });
document.addEventListener('touchmove', function(e) { onDotMove(e.touches[0].clientY); });
document.addEventListener('mouseup', function() { draggingDot = false; });
document.addEventListener('touchend', function() { draggingDot = false; });

scrollDot.addEventListener('dblclick', function() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

function updateScrollUI() {
  var scrollTop = window.scrollY;
  var docHeight = document.documentElement.scrollHeight - window.innerHeight;
  var progress = docHeight > 0 ? scrollTop / docHeight : 0;
  var dotMax = TRACK_HEIGHT - DOT_SIZE;
  scrollDot.style.top = (progress * dotMax) + 'px';
  if (scrollTop > 100) {
    scrollIndicator.classList.add('visible');
    scrollHint.classList.add('hidden');
  } else {
    scrollIndicator.classList.remove('visible');
    scrollHint.classList.remove('hidden');
  }
}
window.addEventListener('scroll', function() {
  requestAnimationFrame(updateScrollUI);
}, { passive: true });
updateScrollUI();

// ========== MESSAGE MODAL ==========
var openMsgBtn = document.getElementById('openMsg');
var modalOverlay = document.getElementById('modalOverlay');
var closeModalBtn = document.getElementById('closeModal');
var msgForm = document.getElementById('msgForm');
var formStatus = document.getElementById('formStatus');

function openModal() {
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  var firstInput = msgForm.querySelector('input');
  if (firstInput) firstInput.focus();
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

openMsgBtn.addEventListener('click', openModal);
openMsgBtn.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openModal();
  }
});

closeModalBtn.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', function(e) {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
    closeModal();
  }
});

// ========== MESSAGE FORM SUBMIT (async, no page navigation) ==========
msgForm.addEventListener('submit', function(e) {
  e.preventDefault();
  var submitBtn = msgForm.querySelector('.submit');
  var formData = new FormData(msgForm);

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';
  formStatus.textContent = '';
  formStatus.className = 'form-status';

  fetch(msgForm.action, {
    method: 'POST',
    body: formData,
    headers: { 'Accept': 'application/json' }
  })
    .then(function(response) {
      if (response.ok) {
        formStatus.textContent = 'Thanks! Your message has been sent.';
        formStatus.className = 'form-status success';
        msgForm.reset();
        setTimeout(closeModal, 1800);
      } else {
        return response.json().then(function(data) {
          var msg = (data && data.errors && data.errors.length)
            ? data.errors.map(function(er) { return er.message; }).join(', ')
            : 'Something went wrong. Please try again.';
          throw new Error(msg);
        });
      }
    })
    .catch(function(err) {
      formStatus.textContent = err.message || 'Something went wrong. Please try again.';
      formStatus.className = 'form-status error';
    })
    .finally(function() {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send';
    });
});

// ========== KONAMI CODE SURPRISE ==========
var konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
var konamiCodePosition = 0;

document.addEventListener('keydown', function(e) {
  var key = e.key.toLowerCase() === 'b' ? 'b' : e.key.toLowerCase() === 'a' ? 'a' : e.key;
  
  if (key === konamiCode[konamiCodePosition]) {
    konamiCodePosition++;
    
    if (konamiCodePosition === konamiCode.length) {
      activateSecret();
      konamiCodePosition = 0;
    }
  } else {
    konamiCodePosition = 0;
  }
});

function activateSecret() {
  createConfetti();
  
  setTimeout(function() {
    document.getElementById('hiddenMessage').classList.add('active');
  }, 1000);
}

document.getElementById('closeSecret').addEventListener('click', function() {
  document.getElementById('hiddenMessage').classList.remove('active');
});

function createConfetti() {
  var container = document.getElementById('confettiContainer');
  var colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'];
  
  for (var i = 0; i < 100; i++) {
    var confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.width = Math.random() * 12 + 6 + 'px';
    confetti.style.height = Math.random() * 12 + 6 + 'px';
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    confetti.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
    
    confetti.style.animationDuration = Math.random() * 2 + 2 + 's';
    confetti.style.animationDelay = Math.random() * 0.5 + 's';
    
    container.appendChild(confetti);
    
    setTimeout(function() {
      if (confetti.parentNode) {
        confetti.parentNode.removeChild(confetti);
      }
    }, 4000);
  }
}

// ========== CURSOR-CONTROLLED STAR ORBITING ==========
var stars = [];
var scrollIdleTimer;
var isScrollIdle = false;
var starOrbitingActive = false;

for (var i = 1; i <= 30; i++) {
  var star = document.getElementById('star' + i);
  if (star) {
    stars.push({
      element: star,
      origLeft: parseFloat(getComputedStyle(star).left),
      origTop: parseFloat(getComputedStyle(star).top),
      currentX: 0,
      currentY: 0
    });
  }
}

window.addEventListener('scroll', function() {
  isScrollIdle = false;
  starOrbitingActive = false;
  
  resetStarPositions();
  
  if (scrollIdleTimer) {
    clearTimeout(scrollIdleTimer);
  }
  
  scrollIdleTimer = setTimeout(function() {
    isScrollIdle = true;
    starOrbitingActive = true;
  }, 2000);
}, { passive: true });

function resetStarPositions() {
  stars.forEach(function(star) {
    star.element.style.transform = '';
    star.currentX = 0;
    star.currentY = 0;
  });
}

function animateStars() {
  if (starOrbitingActive) {
    stars.forEach(function(star) {
      var starRect = star.element.getBoundingClientRect();
      var starCenterX = starRect.left + starRect.width / 2;
      var starCenterY = starRect.top + starRect.height / 2;
      
      var dx = lastMouseX - starCenterX;
      var dy = lastMouseY - starCenterY;
      var distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 300) {
        var moveAmount = (300 - distance) / 300 * 15;
        
        var normalizedX = dx / distance;
        var normalizedY = dy / distance;
        
        var newX = star.currentX + normalizedX * moveAmount * 0.1;
        var newY = star.currentY + normalizedY * moveAmount * 0.1;
        
        var maxMovement = 30;
        newX = Math.max(-maxMovement, Math.min(maxMovement, newX));
        newY = Math.max(-maxMovement, Math.min(maxMovement, newY));
        
        star.currentX = newX;
        star.currentY = newY;
        
        star.element.style.transform = 'translate(' + newX + 'px, ' + newY + 'px)';
      }
    });
  }
  
  requestAnimationFrame(animateStars);
}

animateStars();