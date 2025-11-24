// src/ui/diagram.js
// Component to render simple SVG diagrams for each step

/**
 * Generate SVG diagram based on step ID
 * @param {string} stepId - The scene ID
 * @returns {string} SVG markup
 */
export function generateDiagram(stepId) {
  switch (stepId) {
    case 'S1_GALAXY_CONTEXT':
      return generateGalaxyDiagram();
    case 'S2_0_PLANETS_RAW':
      return generatePlanetSizesDiagram();
    case 'S2_1_ROCKY_SIZE':
      return generateRockySizeDiagram();
    case 'S2_2_GRAVITY':
      return generateGravityDiagram();
    case 'S2_3_G_GRAVITY_X_INSOL':
      return generateHabitableZoneDiagram();
    case 'S3_GALAXY_CANDIDATES':
      return generateCandidateSystemDiagram();
    case 'S4_TRANSITION_TO_SMALL_MULTIPLES':
      return generateTransitionDiagram();
    default:
      return '';
  }
}

/**
 * Step 1: Polar diagram showing near and far stars
 */
function generateGalaxyDiagram() {
  return `
    <svg viewBox="-5 -5 210 180" class="diagram-svg">
      <!-- Title -->
      <text x="100" y="18" text-anchor="middle" font-size="11" fill="#ccc" font-weight="500">Galaxy Structure</text>
      
      <defs>
        <radialGradient id="sun-glow">
          <stop offset="0%" stop-color="#ffd93d" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#ffd93d" stop-opacity="0"/>
        </radialGradient>
      </defs>
      
      <!-- Center (Solar System) -->
      <circle cx="100" cy="100" r="20" fill="url(#sun-glow)"/>
      <circle cx="100" cy="100" r="4" fill="#ffd93d"/>
      <text x="100" y="125" text-anchor="middle" font-size="9" fill="#ccc">Solar System</text>
      
      <!-- Distance circles -->
      <circle cx="100" cy="100" r="40" fill="none" stroke="#444" stroke-width="1" stroke-dasharray="2,2"/>
      <circle cx="100" cy="100" r="70" fill="none" stroke="#444" stroke-width="1" stroke-dasharray="2,2"/>
      
      <!-- Near star -->
      <circle cx="130" cy="80" r="3" fill="#ffd93d" opacity="0.8"/>
      <text x="130" y="72" text-anchor="middle" font-size="8" fill="#999">Near</text>
      
      <!-- Far star -->
      <circle cx="145" cy="145" r="2" fill="#ffd93d" opacity="0.5"/>
      <text x="145" y="137" text-anchor="middle" font-size="8" fill="#777">Far</text>
      
      <!-- Angle indicator -->
      <line x1="100" y1="100" x2="130" y2="80" stroke="#888" stroke-width="1" opacity="0.5"/>
      <path d="M 110,100 A 10,10 0 0,0 107,93" fill="none" stroke="#888" stroke-width="1"/>
      <text x="115" y="93" font-size="7" fill="#888">θ</text>
    </svg>
  `;
}

/**
 * Step 2: Planet size comparison (small to large)
 */
function generatePlanetSizesDiagram() {
  return `
    <svg viewBox="-5 -5 210 135" class="diagram-svg">
      <!-- Mars -->
      <circle cx="30" cy="80" r="8" fill="#bbbbbb" opacity="0.7"/>
      <text x="30" y="105" text-anchor="middle" font-size="9" fill="#aaa">Mars</text>
      <text x="30" y="115" text-anchor="middle" font-size="8" fill="#777">0.5 R⊕</text>
      
      <!-- Earth -->
      <circle cx="70" cy="80" r="12" fill="#bbbbbb" opacity="0.8"/>
      <text x="70" y="105" text-anchor="middle" font-size="9" fill="#ccc">Earth</text>
      <text x="70" y="115" text-anchor="middle" font-size="8" fill="#888">1.0 R⊕</text>
      
      <!-- Super-Earth -->
      <circle cx="120" cy="80" r="18" fill="#bbbbbb" opacity="0.8"/>
      <text x="120" y="110" text-anchor="middle" font-size="9" fill="#ccc">Super-Earth</text>
      <text x="120" y="120" text-anchor="middle" font-size="8" fill="#888">1.5 R⊕</text>
      
      <!-- Title -->
      <text x="100" y="18" text-anchor="middle" font-size="11" fill="#ccc" font-weight="500">Planet Size Range</text>
      
      <!-- Neptune -->
      <circle cx="175" cy="80" r="25" fill="#bbbbbb" opacity="0.6"/>
      <text x="175" y="115" text-anchor="middle" font-size="9" fill="#999">Neptune</text>
      <text x="175" y="125" text-anchor="middle" font-size="8" fill="#777">3.9 R⊕</text>
    </svg>
  `;
}

/**
 * Step 3: Rocky size range highlight
 */
function generateRockySizeDiagram() {
  return `
    <svg viewBox="-5 -5 210 130" class="diagram-svg">
      <!-- Title -->
      <text x="100" y="18" text-anchor="middle" font-size="11" fill="#ccc" font-weight="500">Rocky Size Zone</text>
      
      <!-- Background range -->
      <rect x="45" y="50" width="105" height="50" fill="#22d3ee" opacity="0.15" rx="4"/>
      
      <!-- Mars (too small) -->
      <circle cx="25" cy="75" r="8" fill="#9ca3af" opacity="0.5"/>
      <text x="25" y="95" text-anchor="middle" font-size="8" fill="#777">0.5 R⊕</text>
      
      <!-- Rocky range planets - spread horizontally -->
      <circle cx="65" cy="75" r="10" fill="#22d3ee" opacity="0.8"/>
      <text x="65" y="95" text-anchor="middle" font-size="8" fill="#22d3ee">0.7 R⊕</text>
      
      <circle cx="95" cy="75" r="12" fill="#22d3ee" opacity="0.9"/>
      <text x="95" y="95" text-anchor="middle" font-size="8" fill="#22d3ee">1.0 R⊕</text>
      
      <circle cx="125" cy="75" r="14" fill="#22d3ee" opacity="0.9"/>
      <text x="125" y="95" text-anchor="middle" font-size="8" fill="#22d3ee">1.3 R⊕</text>
      
      <!-- Neptune (too large) -->
      <circle cx="170" cy="75" r="20" fill="#9ca3af" opacity="0.4"/>
      <text x="170" y="105" text-anchor="middle" font-size="8" fill="#777">2.5 R⊕</text>
      
      <!-- Range label -->
      <text x="100" y="118" text-anchor="middle" font-size="8" fill="#999">Range: 0.5 – 1.6 R⊕</text>
    </svg>
  `;
}

/**
 * Step 4: Gravity levels with pulsing rings
 */
function generateGravityDiagram() {
  return `
    <svg viewBox="-5 -5 210 110" class="diagram-svg">
      <!-- Title -->
      <text x="100" y="18" text-anchor="middle" font-size="11" fill="#ccc" font-weight="500">Surface Gravity Levels</text>
      
      <!-- Low gravity -->
      <g transform="translate(40, 55)">
        <circle r="15" fill="#9ca3af" opacity="0.3"/>
        <circle r="18" fill="none" stroke="#9ca3af" stroke-width="1" opacity="0.2"/>
        <text y="35" text-anchor="middle" font-size="9" fill="#999">Low</text>
        <text y="43" text-anchor="middle" font-size="8" fill="#777">< 0.5 g</text>
      </g>
      
      <!-- Comfortable gravity -->
      <g transform="translate(100, 55)">
        <circle r="15" fill="#fb923c" opacity="0.7"/>
        <circle r="18" fill="none" stroke="#fb923c" stroke-width="1.5" opacity="0.5"/>
        <circle r="21" fill="none" stroke="#fb923c" stroke-width="1" opacity="0.3"/>
        <text y="35" text-anchor="middle" font-size="9" fill="#fb923c" font-weight="500">OK</text>
        <text y="43" text-anchor="middle" font-size="8" fill="#fb923c">0.5 – 1.5 g</text>
      </g>
      
      <!-- High gravity -->
      <g transform="translate(160, 55)">
        <circle r="15" fill="#9ca3af" opacity="0.3"/>
        <circle r="18" fill="none" stroke="#9ca3af" stroke-width="2" opacity="0.4"/>
        <circle r="21" fill="none" stroke="#9ca3af" stroke-width="2" opacity="0.4"/>
        <circle r="24" fill="none" stroke="#9ca3af" stroke-width="2" opacity="0.3"/>
        <text y="35" text-anchor="middle" font-size="9" fill="#999">High</text>
        <text y="43" text-anchor="middle" font-size="8" fill="#777">> 1.5 g</text>
      </g>
    </svg>
  `;
}

/**
 * Step 5: Habitable zone diagram with axes
 */
function generateHabitableZoneDiagram() {
  return `
    <svg viewBox="-10 -5 220 150" class="diagram-svg">
      <!-- Title -->
      <text x="105" y="18" text-anchor="middle" font-size="11" fill="#ccc" font-weight="500">Habitable Zone</text>
      
      <!-- Axes -->
      <line x1="30" y1="110" x2="180" y2="110" stroke="#555" stroke-width="1"/>
      <line x1="30" y1="110" x2="30" y2="30" stroke="#555" stroke-width="1"/>
      
      <!-- Optimistic habitable zone (pink - full width) -->
      <rect x="60" y="30" width="90" height="80" fill="#ec4899" opacity="0.12"/>
      
      <!-- Conservative habitable zone (green - middle) -->
      <rect x="80" y="30" width="50" height="80" fill="#4ade80" opacity="0.2"/>
      
      <!-- Gravity band (orange horizontal band) -->
      <rect x="30" y="60" width="150" height="30" fill="#fb923c" opacity="0.15"/>
      
      <!-- Optimistic sweet spots (pink overlap) -->
      <rect x="60" y="60" width="20" height="30" fill="#ec4899" opacity="0.25"/>
      <rect x="130" y="60" width="20" height="30" fill="#ec4899" opacity="0.25"/>
      
      <!-- Conservative sweet spot (green overlap) -->
      <rect x="80" y="60" width="50" height="30" fill="#4ade80" opacity="0.3"/>
      
      <!-- Zone labels -->
      <text x="45" y="70" text-anchor="middle" font-size="9" fill="#60a5fa">Too Cold</text>
      <text x="105" y="50" text-anchor="middle" font-size="9" fill="#4ade80" font-weight="500">Habitable</text>
      <text x="165" y="70" text-anchor="middle" font-size="9" fill="#fb923c">Too Hot</text>
      
      <!-- Gravity labels -->
      <text x="185" y="50" font-size="8" fill="#888">High g</text>
      <text x="185" y="75" font-size="8" fill="#fb923c">OK g</text>
      <text x="185" y="100" font-size="8" fill="#888">Low g</text>
      
      <!-- Axis labels -->
      <text x="105" y="130" text-anchor="middle" font-size="9" fill="#999">Stellar Flux</text>
      <text x="15" y="70" text-anchor="middle" font-size="9" fill="#999" transform="rotate(-90, 15, 70)">Gravity</text>
      
      <!-- Dots: green in conservative zone, pink in optimistic-only zones -->
      <circle cx="105" cy="75" r="3" fill="#4ade80"/>
      <circle cx="70" cy="75" r="2.5" fill="#ec4899"/>
      <circle cx="140" cy="75" r="2.5" fill="#ec4899"/>
    </svg>
  `;
}

/**
 * Step 6: One candidate star system with orbiting planets
 */
function generateCandidateSystemDiagram() {
  return `
    <svg viewBox="-5 -5 210 160" class="diagram-svg">
      <!-- Central K-type star -->
      <defs>
        <radialGradient id="k-star-glow">
          <stop offset="0%" stop-color="#ff9f4a" stop-opacity="0.9"/>
          <stop offset="70%" stop-color="#ff9f4a" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#ff9f4a" stop-opacity="0"/>
        </radialGradient>
      </defs>
      
      <circle cx="100" cy="70" r="25" fill="url(#k-star-glow)"/>
      <circle cx="100" cy="70" r="10" fill="#ff9f4a"/>
      <text x="100" y="58" text-anchor="middle" font-size="9" fill="#ff9f4a" font-weight="500">K-type Star</text>
      
      <!-- Orbit paths -->
      <ellipse cx="100" cy="70" rx="60" ry="42" fill="none" stroke="#444" stroke-width="1" stroke-dasharray="2,2"/>
      
      <!-- Conservative candidate (green) -->
      <circle cx="130" cy="100" r="6" fill="none" stroke="#4ade80" stroke-width="1.5"/>
      <circle cx="130" cy="100" r="4" fill="#4ade80" opacity="0.6"/>
      <text x="130" y="92" text-anchor="middle" font-size="8" fill="#4ade80">P</text>
      
      <!-- Optimistic candidate (pink) -->
      <circle cx="155" cy="85" r="5" fill="none" stroke="#ec4899" stroke-width="1.5"/>
      <circle cx="155" cy="85" r="3" fill="#ec4899" opacity="0.5"/>
      <text x="155" y="77" text-anchor="middle" font-size="8" fill="#ec4899">P</text>
      
      <!-- Title -->
      <text x="100" y="18" text-anchor="middle" font-size="11" fill="#ccc" font-weight="500">Candidate Star System</text>
      
      <!-- Legend -->
      <g transform="translate(25, 130)">
        <circle cx="0" cy="0" r="3" fill="#ff9f4a"/>
        <text x="8" y="3" font-size="8" fill="#999">K-type star</text>
        
        <circle cx="60" cy="0" r="3" fill="#ec4899"/>
        <text x="68" y="3" font-size="8" fill="#999">Optimistic</text>
        
        <circle cx="115" cy="0" r="3" fill="#4ade80"/>
        <text x="123" y="3" font-size="8" fill="#999">Conservative</text>
      </g>
    </svg>
  `;
}

/**
 * Step 7: Small multiples card animations explained
 */
function generateTransitionDiagram() {
  return `
    <svg viewBox="-5 -5 210 180" class="diagram-svg">
      <!-- Title -->
      <text x="100" y="15" text-anchor="middle" font-size="11" fill="#ccc" font-weight="500">Card Animations</text>
      
      <!-- Row 1: Star morph animation -->
      <g transform="translate(0, 35)">
        <text x="20" y="22" font-size="9" fill="#bbb">1. Star morph:</text>
        
        <circle cx="90" cy="20" r="10" fill="#ff9f4a" opacity="0.7"/>
        <text x="90" y="8" text-anchor="middle" font-size="8" fill="#ff9f4a">K-star</text>
        
        <text x="110" y="23" font-size="12" fill="#888">↔</text>
        
        <circle cx="135" cy="20" r="10" fill="#ffd93d" opacity="0.7"/>
        <text x="135" y="8" text-anchor="middle" font-size="8" fill="#ffd93d">Sun</text>
        
        <text x="160" y="22" font-size="7" fill="#777">(size & color)</text>
      </g>
      
      <!-- Row 2: Orbital motion -->
      <g transform="translate(0, 80)">
        <text x="20" y="22" font-size="9" fill="#bbb">2. Orbits:</text>
        
        <g transform="translate(100, 20)">
          <ellipse rx="30" ry="20" fill="none" stroke="#444" stroke-width="1" stroke-dasharray="2,2"/>
          <circle cx="0" cy="0" r="5" fill="#ff9f4a" opacity="0.7"/>
          
          <!-- Earth orbit -->
          <circle cx="25" cy="-12" r="3" fill="#a855f7"/>
          <text x="25" y="-18" text-anchor="middle" font-size="7" fill="#a855f7">⊕</text>
          
          <!-- Candidate orbit -->
          <circle cx="-20" cy="15" r="4" fill="#4ade80"/>
          <text x="-20" y="25" text-anchor="middle" font-size="7" fill="#4ade80">P</text>
        </g>
        
        <text x="150" y="22" font-size="7" fill="#777">(orbital speed)</text>
      </g>
      
      <!-- Row 3: Gravity rings -->
      <g transform="translate(0, 130)">
        <text x="20" y="22" font-size="9" fill="#bbb">3. Gravity:</text>
        
        <g transform="translate(85, 20)">
          <circle r="8" fill="#a855f7" opacity="0.5"/>
          <circle r="10" fill="none" stroke="#a855f7" stroke-width="1" opacity="0.6"/>
          <circle r="12" fill="none" stroke="#a855f7" stroke-width="1" opacity="0.3"/>
          <text x="0" y="22" text-anchor="middle" font-size="7" fill="#a855f7">⊕ 1.0g</text>
        </g>
        
        <g transform="translate(130, 20)">
          <circle r="8" fill="#4ade80" opacity="0.5"/>
          <circle r="11" fill="none" stroke="#4ade80" stroke-width="1.5" opacity="0.6"/>
          <circle r="14" fill="none" stroke="#4ade80" stroke-width="1" opacity="0.3"/>
          <text x="0" y="22" text-anchor="middle" font-size="7" fill="#4ade80">P 0.8g</text>
        </g>
        
        <text x="170" y="22" font-size="7" fill="#777">(pulsing)</text>
      </g>
    </svg>
  `;
}

/**
 * Render diagram into a container element
 * @param {HTMLElement} container - The container element
 * @param {string} stepId - The scene ID
 */
export function renderDiagram(container, stepId) {
  if (!container) return;
  
  const svgMarkup = generateDiagram(stepId);
  if (svgMarkup) {
    container.innerHTML = svgMarkup;
    container.classList.add('diagram-container');
  } else {
    container.innerHTML = '';
    container.classList.remove('diagram-container');
  }
}
