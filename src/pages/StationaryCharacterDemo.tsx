import { useState } from 'react';
import { StationaryCharacter } from '@/components/character/StationaryCharacter';
import { RPG_CHARACTERS, getSpriteForRole, getBadgeForCharacter } from '@/lib/rpgSprites';

export default function StationaryCharacterDemo() {
  const [selectedCharacter, setSelectedCharacter] = useState('soldier');
  const [animationState, setAnimationState] = useState<'idle' | 'walk' | 'attack' | 'block' | 'hurt' | 'death'>('idle');

  const availableCharacters = [
    { id: 'soldier', name: 'Soldier', role: 'Recruit' },
    { id: 'archer', name: 'Archer', role: 'Hunter' },
    { id: 'knight', name: 'Knight', role: 'Closer' },
    { id: 'priest', name: 'Priest', role: 'Cultivator' },
    { id: 'armored', name: 'Armored', role: 'Champion' },
    { id: 'wizard', name: 'Wizard', role: 'Senior' },
    { id: 'orc', name: 'Orc', role: 'Enemy' },
    { id: 'slime', name: 'Slime', role: 'Basic' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          🎮 RPG Character Sprites - Stationary
        </h1>

        {/* Character Selector */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Select Character</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {availableCharacters.map((char) => (
              <button
                key={char.id}
                onClick={() => setSelectedCharacter(char.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedCharacter === char.id
                    ? 'border-yellow-400 bg-yellow-400/20 scale-105'
                    : 'border-white/20 bg-white/5 hover:border-white/40'
                }`}
              >
                <div className="text-2xl mb-2">{getBadgeForCharacter(char.id)}</div>
                <div className="text-white font-medium">{char.name}</div>
                <div className="text-xs text-white/60">{char.role}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Animation State Selector */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Animation State</h2>
          <div className="flex flex-wrap gap-3">
            {(['idle', 'walk', 'attack', 'block', 'hurt', 'death'] as const).map((state) => (
              <button
                key={state}
                onClick={() => setAnimationState(state)}
                className={`px-6 py-2 rounded-lg border-2 font-medium transition-all ${
                  animationState === state
                    ? 'border-yellow-400 bg-yellow-400 text-yellow-900'
                    : 'border-white/20 bg-white/5 text-white hover:border-white/40'
                }`}
              >
                {state.charAt(0).toUpperCase() + state.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Character Display Area */}
        <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-12 border border-white/20 min-h-[400px]">
          <div className="absolute top-4 left-4 text-white/60 text-sm">
            Display: 100x100 pixel art with idle animation
          </div>

          {/* Stationary character */}
          <StationaryCharacter
            config={RPG_CHARACTERS[selectedCharacter]}
            size={150}
            position="center"
            name={availableCharacters.find(c => c.id === selectedCharacter)?.name}
            badge={getBadgeForCharacter(selectedCharacter)}
            state={animationState}
            onClick={() => setAnimationState(animationState === 'idle' ? 'attack' : 'idle')}
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm text-center">
            Click character to toggle idle/attack
          </div>
        </div>

        {/* Info Panel */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-3">📋 Character Info</h3>
            <div className="space-y-2 text-white/80">
              <div><span className="font-medium">Type:</span> {selectedCharacter}</div>
              <div><span className="font-medium">Size:</span> 100x100 pixels</div>
              <div><span className="font-medium">Animations:</span> Idle, Walk, Attack, Block, Hurt, Death</div>
              <div><span className="font-medium">Current State:</span> {animationState}</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-3">🎮 Usage</h3>
            <div className="space-y-2 text-sm text-white/80">
              <div>✅ Stationary position (fixed on screen)</div>
              <div>✅ Idle animation by default</div>
              <div>✅ Click to trigger attack animation</div>
              <div>✅ 20 character types available</div>
              <div>✅ Pixel-perfect rendering</div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-8 bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-200 mb-3">📝 Implementation Notes</h3>
          <ul className="space-y-2 text-sm text-yellow-100/90">
            <li>• Replace sprite URLs in <code className="bg-black/30 px-2 py-1 rounded">rpgSprites.ts</code> with actual sprite sheet paths</li>
            <li>• Place sprite sheets in <code className="bg-black/30 px-2 py-1 rounded">public/sprites/</code> directory</li>
            <li>• Each sprite sheet is 100x100 tiles, 6 frames per animation, 6 animation rows</li>
            <li>• Characters are stationary - perfect for UI elements, avatars, and profile displays</li>
            <li>• Use <code className="bg-black/30 px-2 py-1 rounded">StationaryCharacter</code> component for fixed positions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
