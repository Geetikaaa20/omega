import { GameIdea } from '../types';

export const GAME_IDEAS: GameIdea[] = [
  {
    id: 'cakemaker',
    title: 'Comfy Cakes & Bakery Rush',
    category: 'Arcade',
    originalInspiration: 'Purble Place (Comfy Cakes, 2006) / Cake Mania (2006)',
    difficulty: 'Beginner',
    summary: 'Assemble, bake, frost, pipe, and garnish customized cakes on a bakery assembly line to match customer orders against a countdown timer.',
    coreMechanic: 'Multi-stage state machine matching (Pan Shape -> Batter Flavor -> Oven Baking -> Frosting Coat -> Decorative Piping -> Garnish Toppings) with quality audit comparison and tip multipliers.',
    modernTwists: [
      'Customer Mood Dynamics: Fast service yields tips that unlock golden spatulas, custom neon frostings, and turbo ovens.',
      'Creative Decorator Studio: Unlimited free-form cake staging with editable icing inscriptions, sparklers, and slice-cutting mechanics.',
      'Tower Stacker Mini Game: Physics-based crane dropping swinging cake tiers onto a rotating platter to build sky-high dessert towers.'
    ],
    mathAndLogic: [
      'Layer Attribute Matching: `score = basePoints + (shapeMatch ? 50 : 0) + (spongeMatch ? 50 : 0) + (frostingMatch ? 60 : 0) + (toppingsMatch ? 100 : 0)`',
      'Overhang Trim Calculation: `newWidth = topWidth - Math.abs(dropX - topX)` in stacker mode for precision slicing',
      'Timer Decay: `timeBonus = Math.max(0, remainingSeconds * 5)` rewarding rapid sensory pattern matching'
    ],
    browserAdvantage: 'High visual delight with pure CSS/SVG & Canvas 2D; immediate tactile feedback with Web Audio synthesizer squirts, oven dings, and celebration fanfares.',
    playableInApp: 'cakemaker',
    iconName: 'Cake'
  },
  {
    id: 'snake',
    title: 'Classic Snake (Nibbles)',
    category: 'Arcade',
    originalInspiration: 'Gremlin (1976) / Nokia 3310 (1997)',
    difficulty: 'Beginner',
    summary: 'A continuously moving snake grows longer with each eaten food item while avoiding self-intersection and wall boundaries.',
    coreMechanic: 'FIFO queue/deque of (x, y) coordinates representing body segments. On each tick, add next head position and pop tail unless food was consumed.',
    modernTwists: [
      'Portal Portals: Eating a rare wormhole food teleports snake segments between dual parallel boards.',
      'Elemental Foods: Ice food slows time; Fire food lets you burn through tail segments for score; Magnet food pulls items.',
      'Predator vs Prey: A roving rival AI snake competing for the same limited fruit on the board.'
    ],
    mathAndLogic: [
      'Discrete 2D Grid Array: `snake = [{x: 10, y: 10}, {x: 9, y: 10}, ...]`',
      'Opposite Direction Lockout: `if (newDir.x !== -currentDir.x) currentDir = newDir` to prevent self-collision instant kill on fast taps',
      'Modulo Wrapping: `newX = (x + dx + cols) % cols` for infinite wrap boundary modes'
    ],
    browserAdvantage: 'Minimal CPU footprint (~60fps on 20x20 grid with pure Canvas 2D or SVG), deterministic state makes instant undo & replay recording effortless.',
    playableInApp: 'snake',
    iconName: 'Footprints'
  },
  {
    id: 'tetris',
    title: 'Falling Blocks (Tetromino Matrix)',
    category: 'Puzzle',
    originalInspiration: 'Alexey Pajitnov (1984)',
    difficulty: 'Intermediate',
    summary: 'Geometric 4-block polyominoes descend a 10x20 well. Clearing full horizontal rows prevents the stack from overflowing the ceiling.',
    coreMechanic: 'Rotational 2D matrix transformation with Super Rotation System (SRS) wall-kicks, line detection, and progressive gravity acceleration.',
    modernTwists: [
      'Physics Gravity: Instead of rigid grid locking, blocks break into sandbox sand particles (Sandtrix effect) after falling.',
      'Deckbuilder Tetris: Each round lets you draft special action blocks (Bomb 1x1, Acid dropper, Row swapper).',
      'Dual Gravity: Bottom rows fall down while floating rows drift upward toward an anti-gravity vortex.'
    ],
    mathAndLogic: [
      'Matrix Rotation Math: `rotated[y][x] = piece[pieceSize - 1 - x][y]` (90° clockwise)',
      'Collision Check: `board[y + py]?.[x + px] !== 0` against boundary and static tile map',
      'Lock Delay: 500ms grace window before locking when touching ground to allow sliding into crevices'
    ],
    browserAdvantage: 'Pure integer array manipulation (`10x20` byte array); rendering needs only simple colored rectangles with rounded bevels.',
    playableInApp: 'tetris',
    iconName: 'Boxes'
  },
  {
    id: 'breakout',
    title: 'Breakout Bounce (Arkanoid)',
    category: 'Physics',
    originalInspiration: 'Atari / Steve Wozniak (1976)',
    difficulty: 'Beginner',
    summary: 'Deflect a bouncing ball using a movable paddle to destroy multi-tiered colored bricks and collect falling power-ups.',
    coreMechanic: 'Ball-to-AABB box collision with angular rebound calculations depending on where the ball strikes the paddle relative to its center.',
    modernTwists: [
      'Rogue-lite Power Cards: Unlock perks like Piercing Plasma Ball, Magnetic Curved Paddle, or Split-3 on level clear.',
      'Boss Bricks: Destructible boss core with rotating shield layers and projectile attacks aimed at your paddle.',
      'Gravity Wells: Moving black holes that bend ball trajectory curved vectors across the screen.'
    ],
    mathAndLogic: [
      'Offset Angle Reflection: `hitOffset = (ball.x - paddle.center) / (paddle.width / 2); angle = hitOffset * (Math.PI / 3); vx = speed * Math.sin(angle); vy = -speed * Math.cos(angle)`',
      'AABB Circle Penetration Resolution: check clamp closest point `(cx, cy)` on box and reflect axis with smallest penetration depth'
    ],
    browserAdvantage: 'High kinetic satisfaction with particle emitters on brick destruction; 60fps physics requires under 1% CPU on any mobile browser.',
    playableInApp: 'breakout',
    iconName: 'Shield'
  },
  {
    id: 'runner',
    title: 'Mini Mario (Pixel Jumper Platformer)',
    category: 'Platformer',
    originalInspiration: 'Nintendo Super Mario Bros (1985)',
    difficulty: 'Intermediate',
    summary: 'A precision side-scroller where a hero runs, jumps over hazards, stomps roving enemies, and collects coins across floating platforms.',
    coreMechanic: 'Kinematic 2D platformer physics with horizontal acceleration/friction, gravity, variable jump cut on key release, and tilemap collision.',
    modernTwists: [
      'Grappling Hook: One-button hook shot to swing underneath floating ledges and launch through gaps.',
      'Time Rewind: Die, then instantly rewind 3 seconds with your ghost assisting your next attempt (Braid-style).',
      'Rhythm Runner: Jump pads and spike traps synchronize directly to an energetic chiptune drum beat.'
    ],
    mathAndLogic: [
      'Verlet / Euler Integration: `vy += gravity; y += vy; vx *= friction; x += vx`',
      'Variable Jump: When jump key is released early, clamp `vy = Math.max(vy, minJumpVelocity)` for precise tap-jumps vs hold-jumps',
      'Coyote Time & Jump Buffering: 100ms window after walking off a ledge where jumping is still registered for silky feel'
    ],
    browserAdvantage: 'Canvas 2D scrolling camera with pixel-perfect integer snapping creates authentic retro 8-bit nostalgia with zero stutter.',
    playableInApp: 'runner',
    iconName: 'Gamepad2'
  },
  {
    id: 'pong',
    title: 'Pong / Table Tennis',
    category: 'Physics',
    originalInspiration: 'Allan Alcorn / Atari (1972)',
    difficulty: 'Beginner',
    summary: 'Two opposing paddles rally a ball back and forth across a centerline divider. Miss the ball, and your opponent scores.',
    coreMechanic: 'Continuous 1D paddle movement against a 2D bouncing projectile with velocity ramping on consecutive rallies.',
    modernTwists: [
      'Curve Ball Spin: Impart Magnus-effect curve spin based on paddle movement velocity at the instant of impact.',
      'Circular Arena: 360-degree radial Pong where you defend the perimeter of a circle against inward-firing gravity balls.',
      'Paddle Weaponry: Charge up an energy blast to shoot the opponent paddle and stun their movement.'
    ],
    mathAndLogic: [
      'AI Paddle Tracking with Smoothing: `ai.y += (ball.y - (ai.y + ai.height / 2)) * reactionSpeed`',
      'Ball Speed Escalation: `speed = Math.min(maxSpeed, speed * 1.05)` on every paddle deflection'
    ],
    browserAdvantage: 'Can be coded in under 100 lines of pure JavaScript. Outstanding starting project to learn game loop & audio synthesizer.',
    iconName: 'Split'
  },
  {
    id: 'space_invaders',
    title: 'Space Invaders / Galaxian',
    category: 'Action',
    originalInspiration: 'Tomohiro Nishikado / Taito (1978)',
    difficulty: 'Intermediate',
    summary: 'A defender ship slides horizontally along the bottom, firing upward at marching alien flotillas that descend step-by-step.',
    coreMechanic: 'Grid swarm locomotion marching left and right, shifting down one row upon touching screen boundaries, speeding up as fewer invaders remain.',
    modernTwists: [
      'Bullet-Hell Geometry: Boss waves with intricate kaleidoscopic bullet patterns inspired by Touhou.',
      'Magnetic Tractor Beam: Absorb enemy lasers to charge a screen-clearing EMP blast.',
      'Custom Ship Modular Upgrades: Collect alien wreckage parts to attach side blasters and drone companions.'
    ],
    mathAndLogic: [
      'Fleet March Step Vector: Synchronized group velocity where step interval `interval = baseInterval * (aliveCount / totalCount)`',
      'Bunker Destructible Masks: Pixel-level erasure of defensive barriers using `ctx.globalCompositeOperation = "destination-out"`'
    ],
    browserAdvantage: 'Easy to create dramatic screen shake, neon particle explosions, and dynamic tempo that speeds up naturally.',
    iconName: 'Rocket'
  },
  {
    id: 'flappy_bird',
    title: 'Flappy Bird / Gravity Hopper',
    category: 'Physics',
    originalInspiration: 'Dong Nguyen (2013)',
    difficulty: 'Beginner',
    summary: 'Tap to apply upward impulse against continuous gravity while navigating between narrow vertical gap obstacles.',
    coreMechanic: 'Single-button physics: instantaneous upward `vy = -jumpForce` overcoming constant downwards acceleration `gravity`.',
    modernTwists: [
      'Flappy Jetpack: Hold to burn limited thrust fuel that recharges on ground or by collecting energy orbs.',
      'Dynamic Obstacles: Pipes that expand, rotate, or shoot water jets.',
      'Two-Bird Co-op: Control two birds at once with left and right screen taps.'
    ],
    mathAndLogic: [
      'Instantaneous Impulse: `vy = JUMP_IMPULSE; rotation = -25°` transitioning to dive tilt as `vy` increases',
      'Circle vs Dual Rect (Pipe Gap) intersection detection'
    ],
    browserAdvantage: 'Ultra-addictive, minimal assets required, ideal for mobile touchscreen with 1-tap instant feedback.',
    iconName: 'Flame'
  },
  {
    id: 'pacman',
    title: 'Maze Runner / Pac-Chaser',
    category: 'Arcade',
    originalInspiration: 'Toru Iwatani / Namco (1980)',
    difficulty: 'Advanced',
    summary: 'Navigate a symmetric tile maze eating pellets while evading four colored ghosts, each with unique personality algorithms.',
    coreMechanic: 'Tile-based navigation with corner pre-buffering, path intersection decision trees, and power pellet vulnerable state timer.',
    modernTwists: [
      'Procedural Dungeon Mazes: Roguelike dungeon generator replacing the static arcade board on every level.',
      'Trap Placement: Lay down sticky traps or speed boost conveyor strips on the floor tiles.',
      'Ghost Hunter Mode: Reverse roles where you play as the ghost coordinating with AI minions to trap the runner.'
    ],
    mathAndLogic: [
      'Target Tile AI: Blinky targets player tile directly; Pinky targets 4 tiles ahead; Inky targets vector calculation; Clyde wanders if player within 8 tiles',
      'Manhattan Distance Pathing: evaluate non-reversing tile options at each 4-way intersection'
    ],
    browserAdvantage: 'Timeless visual charm, deep strategic depth from ghost behavioral state machines.',
    iconName: 'Ghost'
  },
  {
    id: 'asteroids',
    title: 'Asteroids / Vector Thrust',
    category: 'Physics',
    originalInspiration: 'Lyle Rains & Ed Logg / Atari (1979)',
    difficulty: 'Intermediate',
    summary: 'Pilot a triangular ship in zero-gravity space with rotational steering, inertia thrusters, and screen-wrapping bullets destroying tumbling asteroids.',
    coreMechanic: 'Newtonian inertia physics (`vx, vy` friction near zero), rotational angles, screen wrapping on all 4 borders, and splitting rock hierarchies.',
    modernTwists: [
      'Orbital Gravity Fields: Asteroids and planets exert gravitational attraction pulling your ship into slingshot orbits.',
      'Mining & Crafting: Destroyed asteroids drop ores to purchase shields, tractor beams, and heat-seeking torpedoes.',
      'Neon Synthwave Aesthetics: Glowing vector lines and chromatic aberration effects.'
    ],
    mathAndLogic: [
      'Thrust Vector Math: `vx += Math.cos(angle) * thrust; vy += Math.sin(angle) * thrust`',
      'Asteroid Splitting: when large asteroid radius $R$ is destroyed, spawn two smaller ones with $R/2$ and randomized divergence vectors'
    ],
    browserAdvantage: 'Vector line rendering via HTML5 Canvas `stroke()` produces an authentic retro CRT vector display look with zero asset downloads.',
    iconName: 'Orbit'
  },
  {
    id: 'frogger',
    title: 'Road Crossing / Frog Hopper (Crossy Road)',
    category: 'Action',
    originalInspiration: 'Konami (1981)',
    difficulty: 'Beginner',
    summary: 'Guide characters across lanes of speeding multi-lane traffic, followed by floating logs and alligators across a treacherous river.',
    coreMechanic: 'Grid-based hopped locomotion across distinct horizontal moving velocity belts, with carry-along physics when perched on logs.',
    modernTwists: [
      'Endless Isometric 3D (Crossy Road): Continuous procedural generation with coins and unlockable characters.',
      'Traffic Controller: Tap cars to speed them up or brake them to safely pave a path for the pedestrian.',
      'Night Mode & Fog of War: A dynamic flashlight beam illuminates only the next 3 lanes ahead.'
    ],
    mathAndLogic: [
      'Relative Velocity Attachment: When frog is on log, `frog.x += log.vx * dt`',
      'Lane Interval Spawners: Timer queue for each lane with distinct vehicle speeds and spacing gaps'
    ],
    browserAdvantage: 'Intuitive 4-directional swipe / arrow inputs; instant restart loop is universally appealing.',
    iconName: 'ArrowUpCircle'
  },
  {
    id: 'minesweeper',
    title: 'Minesweeper / Logic Grid',
    category: 'Puzzle',
    originalInspiration: 'Curt Johnson / Microsoft (1990)',
    difficulty: 'Beginner',
    summary: 'Deduce hidden bomb locations on a rectangular grid using numeric clues indicating adjacent mines in a 3x3 surrounding zone.',
    coreMechanic: 'Flood-fill reveal algorithm on zero-count tiles, right-click flag marking, and safe first-click mine redistribution.',
    modernTwists: [
      'Hexagonal or Isometric Grid: 6 or 8 adjacent neighbor clues providing fresh logic puzzles.',
      'Dungeon Crawler Sweep (Dungreed): Numbers indicate monster strength; collect weapons and potions hidden in tiles.',
      'Timed Cascade Blitz: Chaining reveals within 2 seconds builds a score combo multiplier.'
    ],
    mathAndLogic: [
      'Neighbor Count Matrix: iterate offsets `[-1, 0, 1]` for `(dx, dy)` excluding `(0, 0)`',
      'Recursive BFS Flood-fill: When tile has 0 neighbors, queue all 8 unrevealed neighbors for automatic safe reveal'
    ],
    browserAdvantage: 'Extremely easy to build with either DOM buttons or Canvas, zero latency, and perfect for fast desktop or mobile play.',
    iconName: 'Bomb'
  },
  {
    id: 'doodle_jump',
    title: 'Endless Vertical Bouncer (Doodle Jump)',
    category: 'Platformer',
    originalInspiration: 'Lima Sky (2009)',
    difficulty: 'Intermediate',
    summary: 'A character automatically bounces off platforms, aiming higher and higher as the camera scrolls upward infinitely.',
    coreMechanic: 'Vertical camera tracking the player\'s apex height, procedural generation of moving/fragile platforms, and left-right screen wrap.',
    modernTwists: [
      'Vertical Lava Wave: A rising tide of acid/fire pushes the player to jump without hesitation.',
      'Propeller & Spring Upgrades: High-speed temporary flight gadgets and jetpacks.',
      'Shooting Flying Enemies: Tap screen to shoot pellets upward while balancing bounce trajectory.'
    ],
    mathAndLogic: [
      'One-Way Platform Collision: Only trigger bounce if `player.vy > 0` (falling down) and `player.bottom` crosses `platform.top`',
      'Scroll Threshold: When `player.y < screenHeight * 0.4`, shift entire world downward by `(screenHeight * 0.4 - player.y)`'
    ],
    browserAdvantage: 'Can use device tilt sensors (`DeviceOrientationEvent`) or simple Arrow/A-D keys for fluid, responsive guidance.',
    iconName: 'ChevronsUp'
  },
  {
    id: 'sokoban',
    title: 'Sokoban / Crate Pusher',
    category: 'Puzzle',
    originalInspiration: 'Hiroyuki Imabayashi (1982)',
    difficulty: 'Beginner',
    summary: 'Push storage boxes onto designated target storage squares in a constrained warehouse maze without getting crates stuck in corners.',
    coreMechanic: 'Grid-based displacement: character can push one crate forward if the tile beyond the crate is empty; cannot pull or push two crates.',
    modernTwists: [
      'Elemental Crates: Ice crates slide until hitting a wall; Magnet crates attract or repel other boxes.',
      'Laser & Mirror Boxes: Reflect colored laser beams onto light sensors.',
      'Cooperative Dual Robots: Switch between two robots that activate floor switches for each other.'
    ],
    mathAndLogic: [
      'Push Validation: `nextTile = grid[y+dy][x+dx]; beyondTile = grid[y+2*dy][x+2*dx]; if (nextTile.isBox && beyondTile.isEmpty) moveBoth()`',
      'State History Stack: Push state snapshots onto an array to allow unlimited single-tap `undo()`'
    ],
    browserAdvantage: 'Deterministic turn-based puzzle: no real-time ticking required, battery friendly, infinite puzzle level storage in JSON.',
    iconName: 'Package'
  },
  {
    id: 'lunar_lander',
    title: 'Lunar Lander / Thrust Lander',
    category: 'Physics',
    originalInspiration: 'Jim Storer (1969) / Atari (1979)',
    difficulty: 'Intermediate',
    summary: 'Carefully throttle vertical and lateral rocket thrusters to touch down softly on rugged terrain platforms with limited fuel.',
    coreMechanic: 'Continuous gravity acceleration countered by directional rocket thrust vectors, velocity meters, and touchdown speed/angle tolerances.',
    modernTwists: [
      'Cargo Sling Physics: Transport fragile dangling payloads connected by elastic physics ropes.',
      'Wind & Atmospheric Turbulence: Sudden thermal gusts and volcanic steam plumes.',
      'Planetary Gravity Shifts: Low-gravity Moon vs heavy Jupiter moons requiring different engine throttle profiles.'
    ],
    mathAndLogic: [
      'Velocity Tolerances: Touchdown succeeds only if `abs(vy) < maxLandingVy && abs(vx) < maxLandingVx && abs(angle) < 10°`',
      'Terrain Segment Raycast: Line-line intersection between terrain polygon vectors and landing gear pads'
    ],
    browserAdvantage: 'Spectacular tension from subtle physics adjustments; visual retro telemetry dials provide immense retro sci-fi style.',
    iconName: 'Compass'
  },
  {
    id: 'tron',
    title: 'Light Cycles / Tron Arena (Curve Fever)',
    category: 'Arcade',
    originalInspiration: 'Bally Midway (1982)',
    difficulty: 'Beginner',
    summary: 'Two or more light bikes race forward leaving persistent solid neon light walls in their wake; the first to collide with any trail loses.',
    coreMechanic: 'Constant forward motion with 90° turning or continuous steering leaving a permanent death trail in the collision grid.',
    modernTwists: [
      'Trail Jump: A limited jump mechanic allowing you to hop over an opponent\'s beam wall once per round.',
      'Trail Gaps: Random periodic openings in trails to weave through previously closed zones.',
      'Power Pellets: Speed boosts, laser cutters that slice holes in walls, or temporary phase shields.'
    ],
    mathAndLogic: [
      'Grid Occupancy Buffer: `trailGrid[currX][currY] = playerId` for O(1) instant collision lookup',
      'Bot AI: Flood-fill Voronoi diagram to choose the turn direction that maximizes accessible territory'
    ],
    browserAdvantage: 'High-speed adrenaline with minimal code; fantastic for local 2-player on one keyboard (WASD vs Arrow Keys).',
    iconName: 'Zap'
  },
  {
    id: 'bubble_bobble',
    title: 'Bubble Pop / Trap Platformer',
    category: 'Platformer',
    originalInspiration: 'Taito (1986)',
    difficulty: 'Advanced',
    summary: 'Blow buoyant bubbles that trap monsters and float upward along wind currents. Jump onto bubbles or pop them to eliminate enemies.',
    coreMechanic: 'Projectiles that capture enemies, become solid trampolines for the player, drift upward toward ceilings, and burst when jumped on.',
    modernTwists: [
      'Chain Reaction Pops: Popping one bubble triggers an explosive shockwave that pops adjacent bubbles in a combo.',
      'Elemental Bubbles: Water bubbles that create flooding rivers on burst; Lightning bubbles that fire horizontal bolts.',
      'Puzzle Trap Rooms: Capture fruit or keys inside bubbles to float them up to inaccessible ledges.'
    ],
    mathAndLogic: [
      'Buoyancy Vector: `bubble.vy -= buoyancy; bubble.vx += windField.get(x, y)`',
      'Trap State Machine: `EnemyState = Normal -> TrappedInBubble -> AngryFlashing -> Popped`'
    ],
    browserAdvantage: 'Playful, vibrant aesthetics, unique platforming mechanic where player creates their own temporary stepping stones.',
    iconName: 'Sparkles'
  }
];
