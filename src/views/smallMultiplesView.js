// src/views/smallMultiplesView.js

/**
 * Small Multiples View
 * Shows a grid of system cards, each with:
 * - Star morphing animation (system star ↔ Sun)
 * - Orbital animations (Earth + candidate planet)
 * - Gravity pulse animations
 * - System info labels
 */

const PARSECS_TO_LY = 3.26156;
const EARTH_ORBIT_PERIOD = 120; // seconds for one Earth revolution

// Star color mapping based on temperature (Kelvin)
function getStarColor(temp) {
  if (!temp) return '#ffd93d'; // Default: G-type yellow
  if (temp < 3700) return '#ff6b6b'; // M-type: red
  if (temp < 5200) return '#ff9f4a'; // K-type: orange
  if (temp < 6000) return '#ffd93d'; // G-type: yellow
  return '#a5d8ff'; // F-type: pale blue
}

// Map gravity to pulse animation speed with outlier handling
function getGravityPulseSpeed(gRel) {
  if (!gRel) return 2; // Default to Earth-like if missing
  
  // Clamp gravity to reasonable range (0.3g to 2.0g) to handle outliers
  const clampedG = Math.max(0.3, Math.min(2.0, gRel));
  
  // Exponential scaling: lower gravity = slower animation, higher gravity = faster
  // Using power of 3 for strong but not excessive differentiation
  const speed = 2 / (clampedG ** 3);
  
  // Clamp final speed to reasonable range (0.3s to 8s)
  return Math.max(0.3, Math.min(8, speed));
}

// Calculate planet orbital period with logarithmic scaling for better visual differentiation
function getOrbitalPeriod(plOrbper) {
  if (!plOrbper || plOrbper <= 0) return EARTH_ORBIT_PERIOD;
  
  // Clamp to reasonable range (10 days to 1000 days)
  const clampedPeriod = Math.max(10, Math.min(1000, plOrbper));
  
  // Logarithmic scaling for better differentiation across wide range
  // Maps 10-1000 days to roughly 30-240 second animation range
  const ratio = Math.log(clampedPeriod / 365) / Math.log(10);
  const speed = EARTH_ORBIT_PERIOD * Math.pow(2, ratio);
  
  // Clamp final speed to reasonable animation range (30s to 240s)
  return Math.max(30, Math.min(240, speed));
}

export function initSmallMultiplesView(containerEl) {
  if (!containerEl) {
    throw new Error('SmallMultiplesView: container element is required');
  }

  let currentData = [];

  /**
   * Create SVG for a single system card
   */
  function createCardSVG(system) {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('class', 'sm-animation');

    const centerX = 100;
    const centerY = 100;
    
    // Sanitize hostname for use in IDs (remove special characters)
    const safeHostname = (system.hostname || 'system').replace(/[^a-zA-Z0-9-]/g, '-');

    // Get star properties
    const starTemp = system.st_teff || 5778; // Default to Sun temp
    const starColor = getStarColor(starTemp);
    
    // Star radius scaling with outlier handling
    // Clamp star radius to 0.3-3.0 solar radii range for consistent visualization
    const clampedStarRad = Math.max(0.3, Math.min(3.0, system.st_rad || 1));
    const starRadius = Math.max(8, clampedStarRad * 15); // Scale: 8-45px range
    const sunRadius = 15; // Sun reference size (1 solar radius)

    // Get conservative candidate planet (first one)
    const candidate = system.candidatePlanets?.find(p => p.pl_is_conservative_candidate);
    if (!candidate) return svg; // Shouldn't happen with filtered data

    // Orbital parameters - single shared orbit for both planets
    const orbitRadius = 65;

    // Create defs for animations and filters
    const defs = document.createElementNS(NS, 'defs');
    
    // Glow filter
    const filter = document.createElementNS(NS, 'filter');
    filter.setAttribute('id', `glow-${safeHostname}`);
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');
    const blur = document.createElementNS(NS, 'feGaussianBlur');
    blur.setAttribute('stdDeviation', '3');
    blur.setAttribute('result', 'coloredBlur');
    filter.appendChild(blur);
    const merge = document.createElementNS(NS, 'feMerge');
    ['coloredBlur', 'SourceGraphic'].forEach(inp => {
      const node = document.createElementNS(NS, 'feMergeNode');
      node.setAttribute('in', inp);
      merge.appendChild(node);
    });
    filter.appendChild(merge);
    defs.appendChild(filter);

    // Single shared orbital path for both planets
    const orbitPath = document.createElementNS(NS, 'path');
    orbitPath.setAttribute('id', `shared-orbit-${safeHostname}`);
    orbitPath.setAttribute('d', `M ${centerX + orbitRadius},${centerY} A ${orbitRadius},${orbitRadius} 0 1,1 ${centerX - orbitRadius},${centerY} A ${orbitRadius},${orbitRadius} 0 1,1 ${centerX + orbitRadius},${centerY}`);
    defs.appendChild(orbitPath);

    svg.appendChild(defs);

    // Draw single shared orbital path (visible guide)
    const orbitVis = document.createElementNS(NS, 'ellipse');
    orbitVis.setAttribute('cx', centerX);
    orbitVis.setAttribute('cy', centerY);
    orbitVis.setAttribute('rx', orbitRadius);
    orbitVis.setAttribute('ry', orbitRadius);
    orbitVis.setAttribute('fill', 'none');
    orbitVis.setAttribute('stroke', '#7dd3fc');
    orbitVis.setAttribute('stroke-width', '0.8');
    orbitVis.setAttribute('opacity', '0.4');
    svg.appendChild(orbitVis);

    // Multi-star system support
    const starCount = system.sy_snum || 1;
    const stars = [];
    
    if (starCount === 1) {
      // Single star at center
      const star = document.createElementNS(NS, 'circle');
      star.setAttribute('class', 'sm-star');
      star.setAttribute('cx', centerX);
      star.setAttribute('cy', centerY);
      star.setAttribute('r', starRadius);
      star.setAttribute('fill', starColor);
      star.setAttribute('filter', `url(#glow-${safeHostname})`);
      star.setAttribute('data-star-r', starRadius);
      star.setAttribute('data-star-color', starColor);
      star.setAttribute('data-sun-r', sunRadius);
      star.setAttribute('data-sun-color', '#ffd93d');
      svg.appendChild(star);
      stars.push(star);
    } else if (starCount === 2) {
      // Binary system - two stars side by side
      const separation = starRadius * 1.5;
      for (let i = 0; i < 2; i++) {
        const star = document.createElementNS(NS, 'circle');
        star.setAttribute('class', 'sm-star');
        star.setAttribute('cx', centerX + (i === 0 ? -separation : separation));
        star.setAttribute('cy', centerY);
        star.setAttribute('r', starRadius * 0.85); // Slightly smaller for binaries
        star.setAttribute('fill', starColor);
        star.setAttribute('filter', `url(#glow-${safeHostname})`);
        star.setAttribute('data-star-r', starRadius * 0.85);
        star.setAttribute('data-star-color', starColor);
        star.setAttribute('data-sun-r', sunRadius);
        star.setAttribute('data-sun-color', '#ffd93d');
        svg.appendChild(star);
        stars.push(star);
      }
    } else if (starCount >= 3) {
      // Triple or more - arrange in triangle/circle pattern
      const separation = starRadius * 1.2;
      for (let i = 0; i < Math.min(starCount, 4); i++) {
        const angle = (i * 2 * Math.PI) / Math.min(starCount, 4);
        const star = document.createElementNS(NS, 'circle');
        star.setAttribute('class', 'sm-star');
        star.setAttribute('cx', centerX + Math.cos(angle) * separation);
        star.setAttribute('cy', centerY + Math.sin(angle) * separation);
        star.setAttribute('r', starRadius * 0.7); // Smaller for multiple stars
        star.setAttribute('fill', starColor);
        star.setAttribute('filter', `url(#glow-${safeHostname})`);
        star.setAttribute('data-star-r', starRadius * 0.7);
        star.setAttribute('data-star-color', starColor);
        star.setAttribute('data-sun-r', sunRadius);
        star.setAttribute('data-sun-color', '#ffd93d');
        svg.appendChild(star);
        stars.push(star);
      }
    }

    // Earth planet - sized proportionally to Sun reference
    // Earth radius = 0.009155 Sun radii (real astronomical ratio)
    const earthRadius = Math.max(6, sunRadius * 0.009155 * 50); // Scale 50x for visibility, min 6px
    const earthGravitySpeed = getGravityPulseSpeed(1.0); // Earth reference: 1g
    
    // Create radial gradient pattern for Earth gravity animation
    const earthGradient = document.createElementNS(NS, 'radialGradient');
    earthGradient.setAttribute('id', `earth-gravity-${safeHostname}`);
    earthGradient.setAttribute('cx', '50%');
    earthGradient.setAttribute('cy', '50%');
    earthGradient.setAttribute('r', '50%');
    
    const earthStop1 = document.createElementNS(NS, 'stop');
    earthStop1.setAttribute('offset', '0%');
    earthStop1.setAttribute('stop-color', '#4ade80');
    earthStop1.setAttribute('stop-opacity', '0.8');
    
    const earthStop2 = document.createElementNS(NS, 'stop');
    earthStop2.setAttribute('offset', '50%');
    earthStop2.setAttribute('stop-color', '#4ade80');
    earthStop2.setAttribute('stop-opacity', '0.4');
    
    const earthStop3 = document.createElementNS(NS, 'stop');
    earthStop3.setAttribute('offset', '100%');
    earthStop3.setAttribute('stop-color', '#4ade80');
    earthStop3.setAttribute('stop-opacity', '0');
    
    earthGradient.appendChild(earthStop1);
    earthGradient.appendChild(earthStop2);
    earthGradient.appendChild(earthStop3);
    defs.appendChild(earthGradient);
    
    // Earth container group
    const earthGroup = document.createElementNS(NS, 'g');
    earthGroup.setAttribute('class', 'sm-planet-earth-group');
    
    // Earth outline
    const earthOutline = document.createElementNS(NS, 'circle');
    earthOutline.setAttribute('r', earthRadius);
    earthOutline.setAttribute('fill', 'none');
    earthOutline.setAttribute('stroke', '#a855f7');
    earthOutline.setAttribute('stroke-width', '1');
    earthGroup.appendChild(earthOutline);
    
    // Gravity pattern circles moving inward
    for (let i = 0; i < 4; i++) {
      const gravityCircle = document.createElementNS(NS, 'circle');
      gravityCircle.setAttribute('class', 'gravity-pattern');
      gravityCircle.setAttribute('r', '0');
      gravityCircle.setAttribute('fill', 'none');
      gravityCircle.setAttribute('stroke', '#a855f7');
      gravityCircle.setAttribute('stroke-width', '0.75');
      
      // Animate radius from planet edge to center
      const animateR = document.createElementNS(NS, 'animate');
      animateR.setAttribute('attributeName', 'r');
      animateR.setAttribute('from', earthRadius);
      animateR.setAttribute('to', '0');
      animateR.setAttribute('dur', `${earthGravitySpeed}s`);
      animateR.setAttribute('repeatCount', 'indefinite');
      animateR.setAttribute('begin', `${i * earthGravitySpeed / 4}s`);
      gravityCircle.appendChild(animateR);
      
      // Animate opacity for fade in/out effect
      const animateOpacity = document.createElementNS(NS, 'animate');
      animateOpacity.setAttribute('attributeName', 'opacity');
      animateOpacity.setAttribute('values', '0;0.6;0.6;0');
      animateOpacity.setAttribute('keyTimes', '0;0.1;0.9;1');
      animateOpacity.setAttribute('dur', `${earthGravitySpeed}s`);
      animateOpacity.setAttribute('repeatCount', 'indefinite');
      animateOpacity.setAttribute('begin', `${i * earthGravitySpeed / 4}s`);
      gravityCircle.appendChild(animateOpacity);
      
      earthGroup.appendChild(gravityCircle);
    }
    
    // Add Earth label
    const earthLabel = document.createElementNS(NS, 'text');
    earthLabel.setAttribute('x', earthRadius + 4);
    earthLabel.setAttribute('y', '0');
    earthLabel.setAttribute('fill', '#a855f7');
    earthLabel.setAttribute('font-size', '8');
    earthLabel.setAttribute('font-family', 'system-ui, sans-serif');
    earthLabel.setAttribute('dominant-baseline', 'middle');
    earthLabel.textContent = '⊕';
    earthGroup.appendChild(earthLabel);
    
    const earth = earthGroup;
    
    // Animate Earth along shared orbit
    const earthMotion = document.createElementNS(NS, 'animateMotion');
    earthMotion.setAttribute('dur', `${EARTH_ORBIT_PERIOD}s`);
    earthMotion.setAttribute('repeatCount', 'indefinite');
    const earthMpath = document.createElementNS(NS, 'mpath');
    earthMpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#shared-orbit-${safeHostname}`);
    earthMotion.appendChild(earthMpath);
    earth.appendChild(earthMotion);
    
    svg.appendChild(earth);

    // Candidate planet - sized proportionally to its star
    // Clamp planet radius to reasonable range (0.3 to 3.0 Earth radii)
    const candidateRadiusInEarthRadii = Math.max(0.3, Math.min(3.0, candidate.pl_rade || 1));
    const candidateRadiusInStarRadii = candidateRadiusInEarthRadii * 0.009155; // Convert to star radii
    const candidateRadius = Math.max(6, starRadius * candidateRadiusInStarRadii * 50); // Scale 50x, min 6px
    const candidateGravitySpeed = getGravityPulseSpeed(candidate.pl_g_rel);
    
    // Create radial gradient pattern for candidate gravity animation
    const candidateGradient = document.createElementNS(NS, 'radialGradient');
    candidateGradient.setAttribute('id', `candidate-gravity-${safeHostname}`);
    candidateGradient.setAttribute('cx', '50%');
    candidateGradient.setAttribute('cy', '50%');
    candidateGradient.setAttribute('r', '50%');
    
    const candidateStop1 = document.createElementNS(NS, 'stop');
    candidateStop1.setAttribute('offset', '0%');
    candidateStop1.setAttribute('stop-color', '#4ade80');
    candidateStop1.setAttribute('stop-opacity', '0.8');
    
    const candidateStop2 = document.createElementNS(NS, 'stop');
    candidateStop2.setAttribute('offset', '50%');
    candidateStop2.setAttribute('stop-color', '#4ade80');
    candidateStop2.setAttribute('stop-opacity', '0.4');
    
    const candidateStop3 = document.createElementNS(NS, 'stop');
    candidateStop3.setAttribute('offset', '100%');
    candidateStop3.setAttribute('stop-color', '#4ade80');
    candidateStop3.setAttribute('stop-opacity', '0');
    
    candidateGradient.appendChild(candidateStop1);
    candidateGradient.appendChild(candidateStop2);
    candidateGradient.appendChild(candidateStop3);
    defs.appendChild(candidateGradient);
    
    // Candidate container group
    const candidateGroup = document.createElementNS(NS, 'g');
    candidateGroup.setAttribute('class', 'sm-planet-candidate-group');
    
    // Candidate outline
    const candidateOutline = document.createElementNS(NS, 'circle');
    candidateOutline.setAttribute('r', candidateRadius);
    candidateOutline.setAttribute('fill', 'none');
    candidateOutline.setAttribute('stroke', '#4ade80');
    candidateOutline.setAttribute('stroke-width', '1');
    candidateGroup.appendChild(candidateOutline);
    
    // Gravity pattern circles moving inward
    for (let i = 0; i < 4; i++) {
      const gravityCircle = document.createElementNS(NS, 'circle');
      gravityCircle.setAttribute('class', 'gravity-pattern');
      gravityCircle.setAttribute('r', '0');
      gravityCircle.setAttribute('fill', 'none');
      gravityCircle.setAttribute('stroke', '#4ade80');
      gravityCircle.setAttribute('stroke-width', '0.75');
      
      // Animate radius from planet edge to center
      const animateR = document.createElementNS(NS, 'animate');
      animateR.setAttribute('attributeName', 'r');
      animateR.setAttribute('from', candidateRadius);
      animateR.setAttribute('to', '0');
      animateR.setAttribute('dur', `${candidateGravitySpeed}s`);
      animateR.setAttribute('repeatCount', 'indefinite');
      animateR.setAttribute('begin', `${i * candidateGravitySpeed / 4}s`);
      gravityCircle.appendChild(animateR);
      
      // Animate opacity for fade in/out effect
      const animateOpacity = document.createElementNS(NS, 'animate');
      animateOpacity.setAttribute('attributeName', 'opacity');
      animateOpacity.setAttribute('values', '0;0.6;0.6;0');
      animateOpacity.setAttribute('keyTimes', '0;0.1;0.9;1');
      animateOpacity.setAttribute('dur', `${candidateGravitySpeed}s`);
      animateOpacity.setAttribute('repeatCount', 'indefinite');
      animateOpacity.setAttribute('begin', `${i * candidateGravitySpeed / 4}s`);
      gravityCircle.appendChild(animateOpacity);
      
      candidateGroup.appendChild(gravityCircle);
    }
    
    // Add candidate planet label
    const candidateLabel = document.createElementNS(NS, 'text');
    candidateLabel.setAttribute('x', candidateRadius + 4);
    candidateLabel.setAttribute('y', '0');
    candidateLabel.setAttribute('fill', '#4ade80');
    candidateLabel.setAttribute('font-size', '8');
    candidateLabel.setAttribute('font-family', 'system-ui, sans-serif');
    candidateLabel.setAttribute('dominant-baseline', 'middle');
    candidateLabel.textContent = 'P';
    candidateGroup.appendChild(candidateLabel);
    
    const candidatePlanet = candidateGroup;
    
    // Animate candidate along shared orbit (opposite side from Earth)
    const candidateMotion = document.createElementNS(NS, 'animateMotion');
    candidateMotion.setAttribute('dur', `${getOrbitalPeriod(candidate.pl_orbper)}s`);
    candidateMotion.setAttribute('repeatCount', 'indefinite');
    candidateMotion.setAttribute('begin', '0.5s'); // Offset by half second to separate from Earth initially
    const candidateMpath = document.createElementNS(NS, 'mpath');
    candidateMpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#shared-orbit-${safeHostname}`);
    candidateMotion.appendChild(candidateMpath);
    candidatePlanet.appendChild(candidateMotion);
    
    svg.appendChild(candidatePlanet);

    return svg;
  }

  /**
   * Show detailed modal for a system
   */
  function showSystemModal(system) {
    const candidate = system.candidatePlanets?.find(p => p.pl_is_conservative_candidate);
    if (!candidate) return;

    const modal = document.createElement('div');
    modal.className = 'sm-modal';
    modal.innerHTML = `
      <div class="sm-modal-content">
        <button class="sm-modal-close" title="Close">&times;</button>
        <h2>${system.hostname}</h2>
        <div class="sm-modal-grid">
          <div class="sm-modal-section">
            <h3>Star Properties</h3>
            <p><strong>Temperature:</strong> ${system.st_teff ? system.st_teff.toLocaleString() + ' K' : 'Unknown'}</p>
            <p><strong>Radius:</strong> ${system.st_rad ? system.st_rad.toFixed(2) + ' R☉' : 'Unknown'}</p>
            <p><strong>Mass:</strong> ${system.st_mass ? system.st_mass.toFixed(2) + ' M☉' : 'Unknown'}</p>
            <p><strong>Spectral Type:</strong> ${system.st_spectype || 'Unknown'}</p>
          </div>
          <div class="sm-modal-section">
            <h3>System Information</h3>
            <p><strong>Distance:</strong> ${system.sy_dist ? Math.round(system.sy_dist * PARSECS_TO_LY).toLocaleString() + ' light years' : 'Unknown'}</p>
            <p><strong>Total Planets:</strong> ${system.sy_pnum || system.planetCount || 0}</p>
            <p><strong>Conservative Candidates:</strong> ${system.candidateCountConservative || 0}</p>
            <p><strong>Optimistic Candidates:</strong> ${system.candidateCountOptimistic || 0}</p>
          </div>
          <div class="sm-modal-section">
            <h3>Candidate Planet: ${candidate.pl_name}</h3>
            <p><strong>Orbital Period:</strong> ${candidate.pl_orbper ? candidate.pl_orbper.toFixed(1) + ' days' : 'Unknown'}</p>
            <p><strong>Semi-Major Axis:</strong> ${candidate.pl_orbsmax ? candidate.pl_orbsmax.toFixed(3) + ' AU' : 'Unknown'}</p>
            <p><strong>Radius:</strong> ${candidate.pl_rade ? candidate.pl_rade.toFixed(2) + ' R⊕' : 'Unknown'}</p>
            <p><strong>Surface Gravity:</strong> ${candidate.pl_g_rel ? candidate.pl_g_rel.toFixed(2) + ' g' : 'Unknown'}</p>
            <p><strong>Equilibrium Temp:</strong> ${candidate.pl_eqt ? candidate.pl_eqt.toFixed(0) + ' K' : 'Unknown'}</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close handlers
    const closeBtn = modal.querySelector('.sm-modal-close');
    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', escHandler);
      }
    });
  }

  /**
   * Create a system card element
   */
  function createCard(system) {
    const card = document.createElement('div');
    card.className = 'sm-card';
    card.dataset.system = system.hostname;

    // Make card clickable
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => showSystemModal(system));

    // SVG animation
    const svg = createCardSVG(system);
    card.appendChild(svg);

    // Text label
    const label = document.createElement('div');
    label.className = 'sm-label';

    const name = document.createElement('div');
    name.className = 'sm-name';
    name.textContent = system.hostname || 'Unknown';

    const distance = document.createElement('div');
    distance.className = 'sm-distance';
    const ly = system.sy_dist ? Math.round(system.sy_dist * PARSECS_TO_LY) : '?';
    distance.textContent = `${ly.toLocaleString()} ly`;

    label.appendChild(name);
    label.appendChild(distance);
    card.appendChild(label);

    return card;
  }

  /**
   * Render the grid
   */
  function render(systems) {
    // Clear existing
    containerEl.innerHTML = '';

    // Filter to only systems with conservative candidates
    const filteredSystems = systems.filter(s => 
      s.candidateCountConservative >= 1 && 
      s.candidatePlanets?.some(p => p.pl_is_conservative_candidate)
    );

    if (filteredSystems.length === 0) {
      containerEl.innerHTML = '<p class="sm-empty">No conservative candidate systems found</p>';
      return;
    }

    // Sort by distance (nearest first)
    filteredSystems.sort((a, b) => {
      const distA = a.sy_dist || Infinity;
      const distB = b.sy_dist || Infinity;
      return distA - distB;
    });

    // Create grid
    const grid = document.createElement('div');
    grid.className = 'sm-grid';

    filteredSystems.forEach(system => {
      const card = createCard(system);
      grid.appendChild(card);
    });

    containerEl.appendChild(grid);

    // Start star morphing animations
    startStarMorphing();
  }

  /**
   * Star morphing animation (system star(s) ↔ Sun)
   * For multi-star systems: stars merge into single Sun at center
   */
  function startStarMorphing() {
    const cards = containerEl.querySelectorAll('.sm-card');
    
    cards.forEach(card => {
      const stars = card.querySelectorAll('.sm-star');
      if (stars.length === 0) return;

      // Store original positions and properties
      const originalData = Array.from(stars).map(star => ({
        star,
        cx: parseFloat(star.getAttribute('cx')),
        cy: parseFloat(star.getAttribute('cy')),
        r: parseFloat(star.dataset.starR),
        color: star.dataset.starColor
      }));

      const sunR = parseFloat(stars[0].dataset.sunR);
      const sunColor = stars[0].dataset.sunColor;
      
      // Get center position (assume viewBox is 0 0 200 200)
      const centerX = 100;
      const centerY = 100;

      let isSun = false;
      
      function morph() {
        stars.forEach((star, index) => {
          const original = originalData[index];
          
          if (isSun) {
            // Morph back to original system star(s)
            star.style.transition = 'cx 1s ease-in-out, cy 1s ease-in-out, r 1s ease-in-out, fill 1s ease-in-out, opacity 1s ease-in-out';
            star.setAttribute('cx', original.cx);
            star.setAttribute('cy', original.cy);
            star.setAttribute('r', original.r);
            star.setAttribute('fill', original.color);
            star.style.opacity = '1';
          } else {
            // Merge into single Sun at center
            star.style.transition = 'cx 1s ease-in-out, cy 1s ease-in-out, r 1s ease-in-out, fill 1s ease-in-out, opacity 1s ease-in-out';
            star.setAttribute('cx', centerX);
            star.setAttribute('cy', centerY);
            star.setAttribute('r', sunR);
            star.setAttribute('fill', sunColor);
            
            // For multi-star systems, hide all but first star when merged
            if (stars.length > 1 && index > 0) {
              star.style.opacity = '0';
            }
          }
        });
        
        isSun = !isSun;
        
        // Next morph after hold period
        setTimeout(morph, 4000); // 3s hold + 1s transition
      }
      
      // Start morphing
      setTimeout(morph, 3000); // Initial 3s showing system star(s)
    });
  }

  return {
    show() {
      containerEl.style.display = 'block';
    },
    hide() {
      containerEl.style.display = 'none';
    },
    update(data) {
      currentData = data || [];
      render(currentData);
    }
  };
}
