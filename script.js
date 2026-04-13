/* ================================================
   IIMBx — 3D Premium Motion Engine
   Inspired by Framer Motion spring physics
   Pure Vanilla JS — Zero dependencies
================================================ */

document.addEventListener("DOMContentLoaded", function () {

  /* ================================================
     MOBILE NAVIGATION DRAWER
  ================================================ */
  const navToggle = document.querySelector('.nav-toggle');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-cta');

  if (navToggle && mobileOverlay) {
    navToggle.addEventListener('click', () => {
      mobileOverlay.classList.toggle('active');
      const icon = navToggle.querySelector('i');
      if (mobileOverlay.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
      } else {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileOverlay.classList.remove('active');
        const icon = navToggle.querySelector('i');
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      });
    });
  }

  /* ================================================
     HERO 3D SCROLL-DRIVEN TIMELINE ENGINE
  ================================================ */
  const heroScrollEngine = document.getElementById('hero-scroll-engine');
  const scDeck = document.getElementById('scDeck');
  const scBase = document.getElementById('scBase');
  const scStats = document.getElementById('scStats');
  const scStatsNums = document.querySelectorAll('.sc-num');
  let statsTriggered = false;

  if (heroScrollEngine && scDeck) {
    const cards = [
      document.getElementById('scard-1'),
      document.getElementById('scard-2'),
      document.getElementById('scard-3'),
      document.getElementById('scard-4')
    ];

    // Lerp smoothing variables
    let currentProgress = 0;
    let targetProgress = 0;
    
    // Calculate raw progress on scroll
    window.addEventListener('scroll', () => {
      const rect = heroScrollEngine.getBoundingClientRect();
      const scrollY = window.scrollY;
      const offsetTop = heroScrollEngine.offsetTop;
      const totalScroll = heroScrollEngine.offsetHeight - window.innerHeight;

      // Restrict progress between 0 and 1
      let rawProgress = (scrollY - offsetTop) / totalScroll;
      rawProgress = Math.max(0, Math.min(1, rawProgress));
      targetProgress = rawProgress;
    }, { passive: true });

    // Render loop for smooth 3D motion
    const render3DScroll = () => {
      // Lerp
      currentProgress += (targetProgress - currentProgress) * 0.08;

      // 1. Animate Cards (Active phase: 0 to 0.7)
      // Total 4 cards. We'll map progress intervals to each card.
      const phaseMax = 0.7;
      const cardSegment = phaseMax / cards.length;

      cards.forEach((card, index) => {
        const start = index * cardSegment;
        const end = start + cardSegment;

        if (currentProgress < start) {
          // Card is deep in the background
          card.style.transform = `translate3d(0, 0, -400px) scale(0.8)`;
          card.style.opacity = '0';
          card.style.filter = `blur(10px)`;
        } 
        else if (currentProgress >= start && currentProgress <= end) {
          // Card is coming forward
          const localProgress = (currentProgress - start) / cardSegment;
          const zPos = -400 + (localProgress * 400); // -400 to 0
          const scale = 0.8 + (localProgress * 0.2); // 0.8 to 1.0
          const blur = 10 - (localProgress * 10); // 10 to 0
          const rotX = (1 - localProgress) * 10; // flips down slightly as it comes forward
          const rotY = (1 - localProgress) * -10;

          card.style.transform = `translate3d(0, 0, ${zPos}px) scale(${scale}) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
          card.style.opacity = localProgress;
          card.style.filter = `blur(${blur}px)`;
        } 
        else {
          // Card is pushed out of the way to the side / blurred backward
          const pastProgress = Math.min(1, (currentProgress - end) / 0.15); // How far past its prime is it?
          
          // Shift left, fade down slightly, blur out
          const xShift = pastProgress * -250; // pixels
          const scale = 1 - (pastProgress * 0.1); 
          const yShift = pastProgress * 30; // drop down slightly
          const zDepth = pastProgress * -150;

          card.style.transform = `translate3d(${xShift}px, ${yShift}px, ${zDepth}px) scale(${scale})`;
          card.style.opacity = 1 - pastProgress * 0.8; // partially visible
          card.style.filter = `blur(${pastProgress * 4}px)`;
        }
      });

      // 2. Base Layer Transition (Text fades out late)
      if (currentProgress > 0.65) {
        const baseFade = 1 - ((currentProgress - 0.65) / 0.15);
        scBase.style.opacity = Math.max(0, baseFade);
        scBase.style.transform = `scale(${1 - ((currentProgress - 0.65) * 0.2)})`;
      } else {
        scBase.style.opacity = 1;
        scBase.style.transform = `scale(1)`;
      }

      // 3. Stats Layer Entrance (0.75 to 1.0)
      if (currentProgress > 0.75) {
        const statsLocal = Math.min(1, (currentProgress - 0.75) / 0.25);
        const yOffset = 100 - (statsLocal * 100);
        scStats.style.transform = `translateY(${yOffset}px)`;
        scStats.style.opacity = statsLocal;

        // Trigger numbers
        if (statsLocal > 0.5 && !statsTriggered) {
          statsTriggered = true;
          startStatsCounter();
        }
      } else {
        scStats.style.transform = `translateY(100px)`;
        scStats.style.opacity = 0;
        statsTriggered = false; // Reset to allow re-trigger on scroll back up
      }

      requestAnimationFrame(render3DScroll);
    };

    /* Background parallax removed per user request */

    // Counter Function
    function startStatsCounter() {
      scStatsNums.forEach((el, idx) => {
        const target = parseFloat(el.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const startTime = performance.now();

        // Stagger
        setTimeout(() => {
          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(1, elapsed / duration);
            // Ease out expo
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            const currentVal = Math.floor(easeProgress * target);
            el.innerText = currentVal;
            if (progress < 1) requestAnimationFrame(updateCounter);
            else el.innerText = target; // Ensure exact finish
          }
          requestAnimationFrame(updateCounter);
        }, idx * 150); // Stagger by 150ms
      });
    }

    // Start render loop
    requestAnimationFrame(render3DScroll);
  }



  /* ================================================
     PLATFORMS 3D HORIZONTAL SCROLL TIMELINE
  ================================================ */
  const platEngine = document.getElementById('sc-platforms-engine');
  if (platEngine) {
    const pcards = [
      document.getElementById('pcard-1'),
      document.getElementById('pcard-2'),
      document.getElementById('pcard-3'),
      document.getElementById('pcard-4')
    ];
    let currPlatProg = 0, targetPlatProg = 0;
    
    window.addEventListener('scroll', () => {
      const offsetTop = platEngine.offsetTop;
      const totalScroll = platEngine.offsetHeight - window.innerHeight;
      let rawProg = (window.scrollY - offsetTop) / totalScroll;
      targetPlatProg = Math.max(0, Math.min(1, rawProg));
    }, { passive: true });

    const renderPlatforms = () => {
      currPlatProg += (targetPlatProg - currPlatProg) * 0.08;
      
      const step = 1 / (pcards.length - 1); // 0.33 per card
      pcards.forEach((card, idx) => {
        const centerPos = idx * step;
        const dist = currPlatProg - centerPos;
        
        // Active at dist 0
        const xShift = dist * -2500; // Wide horizontal sweep
        const zShift = Math.abs(dist) * -800; // Drop backward if not focused
        const rotY = dist * -30; // Slight looking towards center
        const opc = 1 - Math.abs(dist) * 2; // Fade out quickly
        const blurAmount = Math.abs(dist) * 10;
        
        card.style.transform = `translate3d(${xShift}px, 0, ${zShift}px) rotateY(${rotY}deg)`;
        card.style.opacity = Math.max(0, opc);
        card.style.filter = `blur(${blurAmount}px)`;
      });
      requestAnimationFrame(renderPlatforms);
    };
    requestAnimationFrame(renderPlatforms);
  }

  /* ================================================
     CATALOGUE 3D HORIZONTAL CAROUSEL
  ================================================ */
  const catEngine = document.getElementById('sc-catalogue-engine');
  if (catEngine) {
    const cards = document.querySelectorAll('#sc-catalogue-engine .cat-card');
    let currCatProg = 0, targetCatProg = 0;
    
    window.addEventListener('scroll', () => {
      const offsetTop = catEngine.offsetTop;
      const totalScroll = catEngine.offsetHeight - window.innerHeight;
      let rawProg = (window.scrollY - offsetTop) / totalScroll;
      targetCatProg = Math.max(0, Math.min(1, rawProg));
    }, { passive: true });

    const renderCatalogue = () => {
      currCatProg += (targetCatProg - currCatProg) * 0.08;

      cards.forEach((card, idx) => {
        // Focus points along the 0-1 timeline
        const focusPoint = idx * (1 / Math.max(1, cards.length - 1));
        // dist: negative -> card is to the right (future), positive -> card is to the left (past)
        const dist = currCatProg - focusPoint; 
        
        // Focus Carousel Calculations
        const xOffset = dist * -800; // Horizontal sweep
        const zDepth = Math.abs(dist) === 0 ? 50 : -Math.min(150, Math.abs(dist) * 200); // Push back unfocused, pop active
        const rotY = dist * 35; // Tilt cards towards center
        const scaleVal = 1 - Math.min(0.15, Math.abs(dist) * 0.4); // Scale down slightly at sides
        const blurAmount = Math.min(8, Math.abs(dist) * 12); // Soft blur on sides
        const opacityVal = 1 - Math.min(0.5, Math.abs(dist) * 1.5); // Reduce opacity at edges
        
        card.style.transform = `translate3d(${xOffset}px, 0px, ${zDepth}px) rotateY(${rotY}deg) scale(${scaleVal})`;
        card.style.filter = `blur(${blurAmount}px)`;
        card.style.opacity = Math.max(0, opacityVal);
        
        if (Math.abs(dist) < 0.05) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
        
        // Keep focus card on top structurally
        card.style.zIndex = Math.round(100 - Math.abs(dist) * 100);
      });
      requestAnimationFrame(renderCatalogue);
    };
    requestAnimationFrame(renderCatalogue);
  }

  /* ================================================
     TESTIMONIALS 3D CAROUSEL SCROLL
  ================================================ */
  const testiEngine = document.getElementById('sc-testimonials-engine');
  if (testiEngine) {
    const tcards = document.querySelectorAll('.testi-card');
    let currTProg = 0, targetTProg = 0;
    
    window.addEventListener('scroll', () => {
      const offsetTop = testiEngine.offsetTop;
      const totalScroll = testiEngine.offsetHeight - window.innerHeight;
      let rawProg = (window.scrollY - offsetTop) / totalScroll;
      targetTProg = Math.max(0, Math.min(1, rawProg));
    }, { passive: true });

    const renderTestimonials = () => {
      currTProg += (targetTProg - currTProg) * 0.08;
      
      const step = 1 / (tcards.length - 1);
      
      // Card Scatter Fade Effect on extreme exit (to prepare for CTA)
      const exitProgress = Math.max(0, (currTProg - 0.8) / 0.2); // 0 to 1 at the very end
      
      tcards.forEach((card, idx) => {
        const centerPos = idx * step;
        // Shift timeline bounds slightly inward so it doesn't wait till end of screen to show first
        const adjustedProg = currTProg * 1.2 - 0.1;
        const dist = adjustedProg - centerPos;
        
        let rotY = dist * -50;
        let zShift = Math.abs(dist) * -1000;
        let xShift = dist * -1500;
        let blur = Math.abs(dist) * 8;
        let opc = 1 - Math.abs(dist) * 1.5;
        
        // Explosive scatter fade when nearing CTA
        if (exitProgress > 0) {
           zShift -= exitProgress * 1500;
           xShift += (idx % 2 === 0 ? -1 : 1) * exitProgress * 500;
           rotY += (idx % 2 === 0 ? -1 : 1) * exitProgress * 60;
           blur += exitProgress * 20;
           opc -= exitProgress * 2;
        }

        card.style.transform = `translate3d(${xShift}px, 0, ${zShift}px) rotateY(${rotY}deg)`;
        card.style.opacity = Math.max(0, opc);
        card.style.filter = `blur(${blur}px)`;
      });
      requestAnimationFrame(renderTestimonials);
    };
    requestAnimationFrame(renderTestimonials);
  }

  /* ================================================
     FINAL CTA DISSOLVE (Removed — converted to standard block)
  ================================================ */
  // The CTA section is now a standard layout handled by wow.js
  // No scroll-hijacking timeline is needed here anymore.


  /* ================================================
     SCROLL PROGRESS BAR
  ================================================ */
  const scrollBar = document.getElementById('scroll-bar');
  if (scrollBar) {
    window.addEventListener('scroll', () => {
      const scrollPx = document.documentElement.scrollTop || document.body.scrollTop;
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (scrollPx / winHeightPx) * 100;
      scrollBar.style.width = scrolled + "%";
    }, { passive: true });
  }

  /* ================================================
     FLOATING NAVBAR SCROLL EFFECT
  ================================================ */
  const mainHeader = document.getElementById('main-header');
  if (mainHeader) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        mainHeader.classList.add('scrolled');
      } else {
        mainHeader.classList.remove('scrolled');
      }
    }, { passive: true });
  }
  /* ================================================
     THREE.JS GLOBAL BACKGROUND (The Digital Network)
  ================================================ */
  function initThreeJS() {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 25;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // The Digital Network (Particles & Lines)
    const particlesData = [];
    const particleCount = 200;
    const maxDistance = 14;
    
    const particles = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 80;
      const y = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 80;
      
      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;
      
      particlesData.push({
        velocity: new THREE.Vector3((Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.04),
        numConnections: 0
      });
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    // Glowing Ember Material (Brand colors: vivid coral #ff6a00)
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xff6a00,
      size: 0.35,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    // Lines linking close particles
    const linesMaterial = new THREE.LineBasicMaterial({
      color: 0x961902,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending
    });
    
    let linesMesh;

    // Mouse parallax & Scroll state
    let mouseX = 0;
    let mouseY = 0;
    let scrollY = 0;
    
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.02;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.02;
    });

    window.addEventListener('scroll', () => {
      scrollY = window.scrollY;
    }, {passive:true});

    // Resize handling
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);
      
      // Update particle positions
      const positions = particleSystem.geometry.attributes.position.array;
      const linesPositions = [];
      
      for (let i = 0; i < particleCount; i++) {
        const particleData = particlesData[i];
        
        positions[i * 3] += particleData.velocity.x;
        positions[i * 3 + 1] += particleData.velocity.y;
        positions[i * 3 + 2] += particleData.velocity.z;
        
        // Bounce off bounds
        if (positions[i * 3] < -40 || positions[i * 3] > 40) particleData.velocity.x = -particleData.velocity.x;
        if (positions[i * 3 + 1] < -40 || positions[i * 3 + 1] > 40) particleData.velocity.y = -particleData.velocity.y;
        if (positions[i * 3 + 2] < -40 || positions[i * 3 + 2] > 40) particleData.velocity.z = -particleData.velocity.z;
        
        // Build lines
        for(let j = i+1; j < particleCount; j++) {
          const dx = positions[i * 3] - positions[j * 3];
          const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
          const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          
          if(dist < maxDistance) {
            linesPositions.push(
              positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
              positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
            );
          }
        }
      }
      
      particleSystem.geometry.attributes.position.needsUpdate = true;
      
      if(linesMesh) scene.remove(linesMesh);
      
      if(linesPositions.length > 0) {
        const linesGeometry = new THREE.BufferGeometry();
        linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linesPositions, 3));
        linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
        scene.add(linesMesh);
      }
      
      // Camera parallax
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.05;
      
      // Subtle rotation around Y and X based on scroll
      particleSystem.rotation.y = scrollY * 0.0003;
      particleSystem.rotation.x = scrollY * 0.0001;
      
      if(linesMesh) {
        linesMesh.rotation.y = scrollY * 0.0003;
        linesMesh.rotation.x = scrollY * 0.0001;
      }

      renderer.render(scene, camera);
    }
    
    animate();
  }

  /* -------------------------------------------------------------
     CUSTOM MAGNETIC CURSOR
  ------------------------------------------------------------- */
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  
  if (cursorDot && cursorRing) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;
    let ringX = mouseX;
    let ringY = mouseY;
    
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateCursor() {
      // Dot follows aggressively
      dotX += (mouseX - dotX) * 0.4;
      dotY += (mouseY - dotY) * 0.4;
      
      // Ring follows loosely with easing
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      
      cursorDot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Attach expanded magnetic state on specific clickable domains
    const hoverElements = document.querySelectorAll('a, button, .sc-btn-primary, .sc-btn-ghost, .plat-card-inner, .cat-card-inner, .sc-card, .testi-card-inner');
    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hovered') || cursorDot.classList.add('hovered'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovered') || cursorDot.classList.remove('hovered'));
    });
  }

  // Trigger 3D Background
  initThreeJS();

}); // end DOMContentLoaded
