# Stationary RPG Character System

## Overview

Display pixel art RPG characters in fixed positions with idle animations. Based on Tiny RPG Character Asset Pack (100x100 tiles).

---

## Components

### AnimatedSprite
Plays sprite sheet animations (idle, walk, attack, block, hurt, death).

```tsx
<AnimatedSprite
  config={{
    src: '/sprites/character.png',
    frameWidth: 100,
    frameHeight: 100,
    frames: 6,
    rows: 6,
    currentRow: 0,
    frameRate: 150,
  }}
  size={100}
  state="idle"
/>
```

### StationaryCharacter
Fixed-position character with name badge and class badge. Perfect for UI elements and avatars.

```tsx
<StationaryCharacter
  config={RPG_CHARACTERS.soldier}
  size={100}
  position="bottom-right"
  name="John"
  badge="⚔️"
  state="idle"
  onClick={() => console.log('Clicked')}
/>
```

---

## Sprite Configuration

### Required Properties

```typescript
{
  src: string;        // Path to sprite sheet
  frameWidth: number;   // Width of each frame (e.g., 100)
  frameHeight: number;  // Height of each frame (e.g., 100)
  frames: number;       // Number of frames per animation
  rows: number;         // Number of animation rows
  currentRow: number;   // Which row to play (0 = idle)
  frameRate?: number;   // Milliseconds per frame (default: 150)
}
```

### Animation States

| State | Row | Description |
|--------|------|-------------|
| `idle` | 0 | Standing still, breathing |
| `walk` | 1 | Walking cycle |
| `attack` | 2 | Attack animation |
| `block` | 3 | Blocking/shield animation |
| `hurt` | 4 | Taking damage |
| `death` | 5 | Death animation |

---

## Available Characters

### Hunter Classes
- `soldier` - Basic recruit unit
- `archer` - Ranged unit
- `lancer` - Mounted lancer

### Closer Classes
- `knight` - Armored knight
- `knight-templar` - Elite knight
- `swordsman` - Dual-wielder
- `armored-axeman` - Heavy infantry

### Cultivator Classes
- `priest` - Healer/support

### Champion Classes
- `armored` - Heavy armor tank

### Enemy Classes
- `orc`, `armored-orc`, `elite-orc` - Orc variants
- `skeleton`, `armored-skeleton`, `greatsword-skeleton` - Skeleton variants
- `skeleton-archer` - Ranged skeleton
- `slime` - Basic enemy

### Special Classes
- `wizard` - Magic user
- `werewolf` - Beast form
- `werebear` - Bear form
- `orc-rider` - Mounted unit

---

## Position Options

Stationary characters can be placed in fixed positions:

```tsx
position="top-left"      // Fixed: top-4 left-4
position="top-right"     // Fixed: top-4 right-4
position="bottom-left"   // Fixed: bottom-4 left-4
position="bottom-right"  // Fixed: bottom-4 right-4
position="center"        // Fixed: centered on screen
```

---

## Usage Examples

### Dashboard Avatar

```tsx
<StationaryCharacter
  config={RPG_CHARACTERS.priest}
  size={80}
  position="bottom-right"
  name="Sarah"
  badge="✨"
  state="idle"
/>
```

### Profile Display

```tsx
<div className="flex gap-4">
  <StationaryCharacter
    config={RPG_CHARACTERS.knight}
    size={120}
    position="top-left"
    name="Marcus"
    badge="🛡️"
  />
  <div className="profile-info">
    {/* User stats, badges, etc. */}
  </div>
</div>
```

### Battle Scene

```tsx
<div className="battle-scene">
  {/* Player */}
  <StationaryCharacter
    config={RPG_CHARACTERS.soldier}
    size={100}
    position="bottom-left"
    name="Hero"
    state="idle"
  />

  {/* Enemy */}
  <StationaryCharacter
    config={RPG_CHARACTERS.orc}
    size={100}
    position="bottom-right"
    name="Enemy"
    state="idle"
  />
</div>
```

---

## Asset Setup

### Directory Structure
```
public/
  sprites/
    rpg-characters.png    // Full sprite sheet with all characters
```

### Sprite Sheet Format
- Tile size: 100x100 pixels
- 6 frames per animation row
- 6 animation rows (idle, walk, attack, block, hurt, death)
- Image rendering: Pixelated (crisp edges)

### Adding New Characters
1. Add sprite sheet to `public/sprites/`
2. Create config in `rpgSprites.ts`:
```typescript
'my-character': {
  src: '/sprites/my-character.png',
  frameWidth: 100,
  frameHeight: 100,
  frames: 6,
  rows: 6,
  currentRow: 0,
  frameRate: 150,
},
```
3. Add to character selector UI

---

## Demo Page

View the demo at `/stationary-demo` to see:
- All 20 character types
- Animation state switching
- Click interactions
- Display options

---

## Notes

- Characters are **stationary** - they don't wander or move
- Idle animation plays by default
- Click to trigger alternate animations
- Pixel-perfect rendering with `image-rendering: pixelated`
- Name badge appears above character
- Class badge appears in top-right corner

---

*See also: CHARACTERS.md for role personalities, BADGES.md for achievements, PROGRESSION.md for leveling*
