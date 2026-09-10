import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Trophy, Sparkles, Zap, Shield, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

const KNIFE_SKINS = [
  { id: 'cyber', name: 'Cyber Dagger', color: '#00f2fe', glow: '#00f2fe', handle: '#1c2848', cost: 0 },
  { id: 'crimson', name: 'Crimson Fury', color: '#f52d3a', glow: '#ff0844', handle: '#3a080c', cost: 5 },
  { id: 'plasma', name: 'Plasma Katana', color: '#b85df5', glow: '#d946ef', handle: '#24083a', cost: 15 },
  { id: 'golden', name: 'Golden Talon', color: '#ffd200', glow: '#fbbf24', handle: '#3a2d04', cost: 30 },
  { id: 'emerald', name: 'Matrix Kunai', color: '#00f5a0', glow: '#10b981', handle: '#053321', cost: 50 }
];

const STAGE_CONFIGS = [
  { stage: 1, targetHp: 6, speed: 0.025, accel: 0, reversal: false, preKnives: 0, apples: 1, isBoss: false, name: 'Target Alpha' },
  { stage: 2, targetHp: 7, speed: 0.032, accel: 0.0002, reversal: false, preKnives: 1, apples: 1, isBoss: false, name: 'Cyber Wheel' },
  { stage: 3, targetHp: 8, speed: 0.038, accel: 0.0004, reversal: true, preKnives: 2, apples: 2, isBoss: false, name: 'Overclock Core' },
  { stage: 4, targetHp: 9, speed: 0.045, accel: 0.0006, reversal: true, preKnives: 2, apples: 2, isBoss: false, name: 'Quantum Shield' },
  { stage: 5, targetHp: 11, speed: 0.048, accel: 0.0008, reversal: true, preKnives: 3, apples: 3, isBoss: true, name: 'CYBER BOSS: NEON DREADNOUGHT' },
  { stage: 6, targetHp: 9, speed: 0.052, accel: 0.0009, reversal: true, preKnives: 3, apples: 2, isBoss: false, name: 'Hyper Spinner' },
  { stage: 7, targetHp: 10, speed: 0.055, accel: 0.001, reversal: true, preKnives: 4, apples: 2, isBoss: false, name: 'Vortex Grid' },
  { stage: 8, targetHp: 12, speed: 0.06, accel: 0.0012, reversal: true, preKnives: 4, apples: 3, isBoss: false, name: 'Plasma Disk' },
  { stage: 9, targetHp: 11, speed: 0.062, accel: 0.0014, reversal: true, preKnives: 4, apples: 2, isBoss: false, name: 'Strobe Matrix' },
  { stage: 10, targetHp: 14, speed: 0.065, accel: 0.0016, reversal: true, preKnives: 5, apples: 4, isBoss: true, name: 'FINAL BOSS: QUANTUM OVERLORD' }
];

export default function KnifeClash() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('sky_knife_highscore') || localStorage.getItem('thop_knife_highscore') || '0', 10);
  });
  const [applesCount, setApplesCount] = useState(() => {
    return parseInt(localStorage.getItem('sky_knife_apples') || localStorage.getItem('thop_knife_apples') || '0', 10);
  });
  const [stage, setStage] = useState(1);
  const [knivesLeft, setKnivesLeft] = useState(6);
  const [maxKnivesInStage, setMaxKnivesInStage] = useState(6);
  const [selectedSkin, setSelectedSkin] = useState('cyber');
  const [unlockedSkins, setUnlockedSkins] = useState(() => {
    try {
      const saved = localStorage.getItem('sky_knife_unlocked_skins') || localStorage.getItem('thop_knife_unlocked_skins');
      return saved ? JSON.parse(saved) : ['cyber'];
    } catch {
      return ['cyber'];
    }
  });

  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [stageClearTransition, setStageClearTransition] = useState(false);
  const [showSkinPicker, setShowSkinPicker] = useState(false);

  const stateRef = useRef({
    target: {
      x: 200,
      y: 155,
      radius: 68,
      angle: 0,
      speed: 0.03,
      baseSpeed: 0.03,
      accel: 0,
      direction: 1,
      reversalTimer: 0,
      reversalInterval: 180,
      recoilY: 0,
      hitFlash: 0
    },
    embeddedKnives: [], // Array of relative angles
    apples: [], // Array of { angle, sliced: bool }
    flyingKnife: null, // { x, y, vy, skin }
    clashedKnife: null, // { x, y, vx, vy, rot, vrot }
    shards: [], // Exploding target shards on stage clear
    particles: [], // Sparks & sliced fruit particles
    floatingTexts: [], // "+1", "CLASH!", "+2 CRYSTALS"
    screenShake: 0,
    currentConfig: STAGE_CONFIGS[0]
  });

  const activeSkinObj = KNIFE_SKINS.find(s => s.id === selectedSkin) || KNIFE_SKINS[0];

  // Save persistent data
  useEffect(() => {
    localStorage.setItem('sky_knife_apples', applesCount.toString());
  }, [applesCount]);

  useEffect(() => {
    localStorage.setItem('sky_knife_unlocked_skins', JSON.stringify(unlockedSkins));
  }, [unlockedSkins]);

  const initStage = (stageNum, resetAll = false) => {
    const configIdx = Math.min(stageNum - 1, STAGE_CONFIGS.length - 1);
    const config = STAGE_CONFIGS[configIdx];
    stateRef.current.currentConfig = config;

    stateRef.current.target.speed = config.speed;
    stateRef.current.target.baseSpeed = config.speed;
    stateRef.current.target.accel = config.accel;
    stateRef.current.target.direction = Math.random() > 0.5 ? 1 : -1;
    stateRef.current.target.reversalTimer = 0;
    stateRef.current.target.recoilY = 0;
    stateRef.current.target.hitFlash = 0;

    // Pre-place existing knives on target for challenge
    const preKnives = [];
    if (config.preKnives > 0) {
      const step = (Math.PI * 2) / (config.preKnives + config.apples + 1);
      for (let i = 0; i < config.preKnives; i++) {
        preKnives.push((i * step) + Math.random() * 0.3);
      }
    }
    stateRef.current.embeddedKnives = preKnives;

    // Place energy crystals / apples
    const apples = [];
    if (config.apples > 0) {
      for (let i = 0; i < config.apples; i++) {
        const angle = (i * ((Math.PI * 2) / config.apples)) + (Math.PI / 4) + (Math.random() * 0.4);
        apples.push({ angle, sliced: false });
      }
    }
    stateRef.current.apples = apples;

    stateRef.current.flyingKnife = null;
    stateRef.current.clashedKnife = null;
    stateRef.current.shards = [];

    setKnivesLeft(config.targetHp);
    setMaxKnivesInStage(config.targetHp);
    setStage(stageNum);
    setStageClearTransition(false);

    if (resetAll) {
      setScore(0);
      setGameOver(false);
      stateRef.current.particles = [];
      stateRef.current.floatingTexts = [];
    }
  };

  const startGame = () => {
    setGameStarted(true);
    initStage(1, true);
    sounds.playClick();
  };

  const restartGame = () => {
    initStage(1, true);
    sounds.playClick();
  };

  const unlockSkin = (skin) => {
    if (applesCount >= skin.cost && !unlockedSkins.includes(skin.id)) {
      setApplesCount(prev => prev - skin.cost);
      setUnlockedSkins(prev => [...prev, skin.id]);
      setSelectedSkin(skin.id);
      sounds.playPowerup();
      confetti({ particleCount: 40, spread: 60 });
    }
  };

  // Throw knife handler
  const throwKnife = () => {
    if (!gameStarted || gameOver || stageClearTransition) return;
    if (stateRef.current.flyingKnife) return; // Knife currently in flight
    if (knivesLeft <= 0) return;

    sounds.playKnifeThrow();

    stateRef.current.flyingKnife = {
      x: 200,
      y: 390,
      vy: -32,
      skin: activeSkinObj
    };
  };

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['Space', 'ArrowUp', 'KeyW', 'Enter'].includes(e.code)) {
        e.preventDefault();
        if (!gameStarted) {
          startGame();
        } else if (gameOver) {
          restartGame();
        } else {
          throwKnife();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver, stageClearTransition, knivesLeft, selectedSkin]);

  // Main 60FPS Game Loop
  useEffect(() => {
    let animId;

    const gameLoop = () => {
      animId = requestAnimationFrame(gameLoop);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const state = stateRef.current;
      const target = state.target;
      const config = state.currentConfig;

      // Screen Shake
      ctx.save();
      if (state.screenShake > 0) {
        const sx = (Math.random() - 0.5) * state.screenShake;
        const sy = (Math.random() - 0.5) * state.screenShake;
        ctx.translate(sx, sy);
        state.screenShake *= 0.88;
        if (state.screenShake < 0.2) state.screenShake = 0;
      }

      // Background Cyber Dark Grid
      ctx.fillStyle = '#040714';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cyber Grid lines
      ctx.strokeStyle = 'rgba(184, 93, 245, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Radial glowing background aura behind target
      const targetAura = ctx.createRadialGradient(target.x, target.y + target.recoilY, 20, target.x, target.y + target.recoilY, 150);
      if (config.isBoss) {
        targetAura.addColorStop(0, 'rgba(245, 45, 58, 0.25)');
        targetAura.addColorStop(1, 'rgba(245, 45, 58, 0)');
      } else {
        targetAura.addColorStop(0, 'rgba(0, 242, 254, 0.18)');
        targetAura.addColorStop(1, 'rgba(0, 242, 254, 0)');
      }
      ctx.fillStyle = targetAura;
      ctx.beginPath();
      ctx.arc(target.x, target.y + target.recoilY, 150, 0, Math.PI * 2);
      ctx.fill();

      // Target recoil easing
      if (target.recoilY < 0) {
        target.recoilY += 1.5;
        if (target.recoilY > 0) target.recoilY = 0;
      }

      // Target hit flash decay
      if (target.hitFlash > 0) {
        target.hitFlash -= 0.1;
        if (target.hitFlash < 0) target.hitFlash = 0;
      }

      // Rotate target if not exploding
      if (state.shards.length === 0) {
        // Dynamic speed & reversal patterns
        if (config.reversal) {
          target.reversalTimer++;
          if (target.reversalTimer > target.reversalInterval) {
            target.direction *= -1;
            target.reversalTimer = 0;
            target.reversalInterval = 120 + Math.floor(Math.random() * 140);
          }
        }
        target.angle += target.speed * target.direction;
      }

      const targetCenterY = target.y + target.recoilY;

      // Draw Exploding Target Shards (when stage cleared)
      if (state.shards.length > 0) {
        state.shards.forEach(shard => {
          shard.x += shard.vx;
          shard.y += shard.vy;
          shard.vy += 0.4; // gravity
          shard.rot += shard.vrot;
          shard.alpha -= 0.015;

          if (shard.alpha > 0) {
            ctx.save();
            ctx.translate(shard.x, shard.y);
            ctx.rotate(shard.rot);
            ctx.globalAlpha = shard.alpha;
            ctx.fillStyle = shard.color;
            ctx.shadowColor = shard.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(0, 0, shard.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        });
      }

      // 1. DRAW ROTATING TARGET & EMBEDDED OBJECTS
      if (state.shards.length === 0) {
        ctx.save();
        ctx.translate(target.x, targetCenterY);
        ctx.rotate(target.angle);

        // Target Outer Glow
        ctx.shadowBlur = config.isBoss ? 25 : 15;
        ctx.shadowColor = config.isBoss ? '#f52d3a' : '#00f2fe';

        // Outer Ring
        ctx.beginPath();
        ctx.arc(0, 0, target.radius, 0, Math.PI * 2);
        ctx.fillStyle = target.hitFlash > 0
          ? '#ffffff'
          : (config.isBoss ? '#1a0508' : '#0d152c');
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = config.isBoss ? '#ff0844' : '#00f2fe';
        ctx.stroke();

        // Inner Tech Core / Wood Rings
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(0, 0, target.radius - 12, 0, Math.PI * 2);
        ctx.fillStyle = config.isBoss ? '#290910' : '#142044';
        ctx.fill();
        ctx.strokeStyle = config.isBoss ? 'rgba(255, 100, 100, 0.4)' : 'rgba(0, 242, 254, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Tech Grooves & Radial Notches
        ctx.strokeStyle = config.isBoss ? 'rgba(255, 8, 68, 0.6)' : 'rgba(184, 93, 245, 0.5)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          const rot = (i * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(Math.cos(rot) * 20, Math.sin(rot) * 20);
          ctx.lineTo(Math.cos(rot) * (target.radius - 16), Math.sin(rot) * (target.radius - 16));
          ctx.stroke();
        }

        // Center Cyber Orb
        const centerGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 22);
        if (config.isBoss) {
          centerGrad.addColorStop(0, '#ffffff');
          centerGrad.addColorStop(0.4, '#ff0844');
          centerGrad.addColorStop(1, '#660015');
        } else {
          centerGrad.addColorStop(0, '#ffffff');
          centerGrad.addColorStop(0.4, '#00f2fe');
          centerGrad.addColorStop(1, '#0b396b');
        }
        ctx.fillStyle = centerGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // DRAW EMBEDDED KNIVES ON ROTATING TARGET
        state.embeddedKnives.forEach(knifeAngle => {
          ctx.save();
          ctx.rotate(knifeAngle);
          // Embedded at top edge: angle 0 corresponds to bottom facing out (towards 6 o'clock)
          // Draw knife sticking outwards from the circle
          drawBladeModel(ctx, 0, target.radius, Math.PI, activeSkinObj);
          ctx.restore();
        });

        // DRAW CRYSTALS / APPLES ON ROTATING TARGET
        state.apples.forEach(apple => {
          if (!apple.sliced) {
            ctx.save();
            ctx.rotate(apple.angle);
            // Draw glowing diamond crystal / neon apple
            const appleDist = target.radius + 6;
            ctx.translate(0, appleDist);

            ctx.shadowBlur = 12;
            ctx.shadowColor = '#ffd200';
            ctx.fillStyle = '#ffb300';
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(8, 0);
            ctx.lineTo(0, 10);
            ctx.lineTo(-8, 0);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, -2, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
          }
        });

        ctx.restore();
      }

      // Helper to render knife blade & hilt model
      function drawBladeModel(context, x, y, rotation, skin) {
        context.save();
        context.translate(x, y);
        context.rotate(rotation);

        context.shadowBlur = 10;
        context.shadowColor = skin.glow;

        // Blade Point & Edge
        context.fillStyle = '#ffffff';
        context.beginPath();
        context.moveTo(0, 0); // Tip
        context.lineTo(4, 34);
        context.lineTo(0, 42); // Central Spine
        context.lineTo(-4, 34);
        context.closePath();
        context.fill();

        // Colored Core Glow
        context.fillStyle = skin.color;
        context.beginPath();
        context.moveTo(0, 4);
        context.lineTo(2.5, 32);
        context.lineTo(0, 38);
        context.lineTo(-2.5, 32);
        context.closePath();
        context.fill();

        // Crossguard
        context.shadowBlur = 0;
        context.fillStyle = '#ffd200';
        context.fillRect(-7, 40, 14, 4);

        // Handle Grip
        context.fillStyle = skin.handle;
        context.fillRect(-3, 44, 6, 22);

        // Pommel
        context.fillStyle = '#ffffff';
        context.beginPath();
        context.arc(0, 68, 4, 0, Math.PI * 2);
        context.fill();

        context.restore();
      }

      // 2. DRAW READY KNIFE AT BOTTOM (if not flying)
      if (!state.flyingKnife && knivesLeft > 0 && !gameOver && !stageClearTransition) {
        drawBladeModel(ctx, 200, 390, 0, activeSkinObj);
      }

      // 3. UPDATE & DRAW FLYING KNIFE
      if (state.flyingKnife) {
        const fk = state.flyingKnife;
        fk.y += fk.vy;

        // Blade particle trail
        state.particles.push({
          x: fk.x + (Math.random() - 0.5) * 6,
          y: fk.y + 40,
          vx: (Math.random() - 0.5) * 2,
          vy: Math.random() * 3 + 2,
          size: Math.random() * 3 + 1,
          color: fk.skin.color,
          alpha: 0.8,
          decay: 0.06
        });

        // Check Target Contact Collision
        const contactDistance = target.radius + 10;
        if (fk.y <= targetCenterY + contactDistance) {
          // Calculate contact angle in target's local rotating coordinate space
          // A knife flying up hits the bottom of the target (contact angle = PI/2 in canvas world coordinates)
          const hitAngleWorld = Math.PI / 2;
          let hitAngleLocal = (hitAngleWorld - target.angle) % (Math.PI * 2);
          if (hitAngleLocal < 0) hitAngleLocal += Math.PI * 2;

          // Check Knife-on-Knife CLASH Collision!
          const MIN_CLASH_DIFF = 0.26; // ~15 degrees tolerance
          let hasClashed = false;

          for (let i = 0; i < state.embeddedKnives.length; i++) {
            const existingAngle = state.embeddedKnives[i];
            let diff = Math.abs(hitAngleLocal - existingAngle);
            if (diff > Math.PI) diff = (Math.PI * 2) - diff;

            if (diff < MIN_CLASH_DIFF) {
              hasClashed = true;
              break;
            }
          }

          if (hasClashed) {
            // KNIFE CLASH DETECTED!
            sounds.playKnifeClash();
            sounds.playGameOver();

            state.screenShake = 14;

            // Spawn clashed bouncing knife with physics
            state.clashedKnife = {
              x: fk.x,
              y: fk.y,
              vx: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 5 + 4),
              vy: Math.random() * 4 + 6,
              rot: 0,
              vrot: (Math.random() > 0.5 ? 0.3 : -0.3)
            };

            // Spawn brilliant clash metal sparks
            for (let s = 0; s < 30; s++) {
              state.particles.push({
                x: fk.x,
                y: fk.y,
                vx: (Math.random() - 0.5) * 14,
                vy: (Math.random() - 0.5) * 14,
                size: Math.random() * 4 + 2,
                color: Math.random() > 0.5 ? '#ffd200' : '#ffffff',
                alpha: 1,
                decay: 0.03
              });
            }

            state.floatingTexts.push({
              text: 'KNIFE CLASH!',
              x: 200,
              y: fk.y - 20,
              vy: -1.5,
              alpha: 1,
              color: '#f52d3a'
            });

            state.flyingKnife = null;
            setGameOver(true);
          } else {
            // CLEAN HIT!
            sounds.playKnifeHit();
            target.recoilY = -12;
            target.hitFlash = 1;
            state.screenShake = 5;

            // Check if sliced any energy crystal / apple
            state.apples.forEach(apple => {
              if (!apple.sliced) {
                let diff = Math.abs(hitAngleLocal - apple.angle);
                if (diff > Math.PI) diff = (Math.PI * 2) - diff;

                if (diff < 0.28) {
                  apple.sliced = true;
                  sounds.playAppleSlice();
                  setApplesCount(prev => prev + 2);
                  state.floatingTexts.push({
                    text: '+2 CRYSTALS!',
                    x: 200,
                    y: fk.y - 30,
                    vy: -2,
                    alpha: 1,
                    color: '#ffd200'
                  });

                  // Crystal burst particles
                  for (let p = 0; p < 18; p++) {
                    state.particles.push({
                      x: fk.x,
                      y: fk.y,
                      vx: (Math.random() - 0.5) * 10,
                      vy: (Math.random() - 0.5) * 10,
                      size: Math.random() * 3 + 2,
                      color: '#ffd200',
                      alpha: 1,
                      decay: 0.04
                    });
                  }
                }
              }
            });

            // Add embedded knife
            state.embeddedKnives.push(hitAngleLocal);

            // Hit sparks
            for (let s = 0; s < 12; s++) {
              state.particles.push({
                x: fk.x,
                y: fk.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 3 + 1,
                color: fk.skin.color,
                alpha: 1,
                decay: 0.05
              });
            }

            // Score update
            setScore(prev => {
              const next = prev + 1;
              if (next > highScore) {
                setHighScore(next);
                localStorage.setItem('sky_knife_highscore', next.toString());
              }
              return next;
            });

            const remaining = knivesLeft - 1;
            setKnivesLeft(remaining);
            state.flyingKnife = null;

            // Check Stage Clear!
            if (remaining <= 0) {
              setStageClearTransition(true);
              sounds.playStageClear();
              confetti({ particleCount: 50, spread: 70, origin: { y: 0.4 } });

              // Create Exploding Target Shards
              const shardColors = config.isBoss ? ['#f52d3a', '#ffd200', '#ffffff', '#ff0844'] : ['#00f2fe', '#b85df5', '#ffffff', '#ffd200'];
              for (let i = 0; i < 24; i++) {
                const angle = (i * Math.PI * 2) / 24;
                const spd = Math.random() * 8 + 4;
                state.shards.push({
                  x: target.x,
                  y: targetCenterY,
                  vx: Math.cos(angle) * spd,
                  vy: Math.sin(angle) * spd - 3,
                  size: Math.random() * 8 + 4,
                  color: shardColors[i % shardColors.length],
                  rot: Math.random() * Math.PI * 2,
                  vrot: (Math.random() - 0.5) * 0.4,
                  alpha: 1
                });
              }

              state.floatingTexts.push({
                text: config.isBoss ? 'BOSS DEFEATED!' : 'STAGE CLEARED!',
                x: 200,
                y: 180,
                vy: -1,
                alpha: 1,
                color: '#00f5a0'
              });

              setTimeout(() => {
                initStage(stage + 1, false);
              }, 1100);
            }
          }
        } else {
          // Draw flying knife
          drawBladeModel(ctx, fk.x, fk.y, 0, fk.skin);
        }
      }

      // 4. DRAW CLASHED BOUNCING KNIFE
      if (state.clashedKnife) {
        const ck = state.clashedKnife;
        ck.x += ck.vx;
        ck.y += ck.vy;
        ck.vy += 0.8; // Gravity
        ck.rot += ck.vrot;

        drawBladeModel(ctx, ck.x, ck.y, ck.rot, activeSkinObj);
      }

      // 5. UPDATE & DRAW PARTICLES
      state.particles = state.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.alpha <= 0) return false;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      });

      // 6. UPDATE & DRAW FLOATING TEXTS
      state.floatingTexts = state.floatingTexts.filter(ft => {
        ft.y += ft.vy;
        ft.alpha -= 0.02;
        if (ft.alpha <= 0) return false;

        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.font = 'bold 18px "Rajdhani", sans-serif';
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.shadowBlur = 12;
        ctx.shadowColor = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
        return true;
      });

      ctx.restore(); // Restore screen shake
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameStarted, gameOver, stageClearTransition, knivesLeft, stage, highScore, selectedSkin]);

  return (
    <div className="neon-game-container">
      {/* Top Game Stats Header */}
      <div className="game-stats-header">
        <div className="stat-badge glow-badge">
          <span>STAGE: <strong>{stage}</strong> {stateRef.current.currentConfig?.isBoss && <Flame size={14} className="text-red animate-pulse" />}</span>
        </div>
        <div className="stat-badge">
          <span>Score: <strong>{score}</strong></span>
        </div>
        <div className="stat-badge">
          <Trophy size={16} className="text-yellow" />
          <span>High: <strong>{highScore}</strong></span>
        </div>
        <div className="stat-badge">
          <Sparkles size={16} className="text-cyan" />
          <span>Crystals: <strong>{applesCount}</strong></span>
        </div>
        <button
          className="stat-badge hover:border-purple cursor-pointer"
          onClick={() => setShowSkinPicker(!showSkinPicker)}
          title="Select Blade Skin"
        >
          <Zap size={15} style={{ color: activeSkinObj.color }} />
          <span>{activeSkinObj.name}</span>
        </button>
      </div>

      {/* Skin Selection Panel */}
      {showSkinPicker && (
        <div className="knife-skins-modal">
          <div className="skins-modal-header">
            <h4>Select Cyber Blade Skin</h4>
            <button className="skins-close-btn" onClick={() => setShowSkinPicker(false)}>✕</button>
          </div>
          <div className="skins-grid">
            {KNIFE_SKINS.map(skin => {
              const isUnlocked = unlockedSkins.includes(skin.id);
              const isSelected = selectedSkin === skin.id;

              return (
                <div
                  key={skin.id}
                  className={`skin-card ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`}
                  onClick={() => {
                    if (isUnlocked) {
                      setSelectedSkin(skin.id);
                      sounds.playClick();
                    } else {
                      unlockSkin(skin);
                    }
                  }}
                >
                  <div className="skin-preview-dot" style={{ background: skin.color, boxShadow: `0 0 10px ${skin.glow}` }} />
                  <div className="skin-info">
                    <span className="skin-name">{skin.name}</span>
                    {isUnlocked ? (
                      <span className="skin-status active-text">{isSelected ? 'EQUIPPED' : 'SELECT'}</span>
                    ) : (
                      <span className="skin-status cost-text">
                        <Sparkles size={12} /> {skin.cost} Crystals
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Canvas Viewport & Touch Area */}
      <div className="canvas-wrapper relative" onClick={throwKnife}>
        <canvas ref={canvasRef} width={400} height={460} className="game-canvas" />

        {/* Stage Remaining Knives UI on Left */}
        {gameStarted && !gameOver && (
          <div className="knife-ammo-stack">
            {Array.from({ length: maxKnivesInStage }).map((_, idx) => (
              <div
                key={idx}
                className={`ammo-knife-icon ${idx < knivesLeft ? 'ready' : 'spent'}`}
                style={{
                  backgroundColor: idx < knivesLeft ? activeSkinObj.color : 'rgba(255, 255, 255, 0.15)',
                  boxShadow: idx < knivesLeft ? `0 0 8px ${activeSkinObj.glow}` : 'none'
                }}
              />
            ))}
          </div>
        )}

        {/* Start Overlay */}
        {!gameStarted && (
          <div className="game-overlay">
            <h2 className="glow-text">KNIFE CLASH 2077</h2>
            <p>Throw knives into the cyber core without hitting existing blades!</p>
            <div className="knife-hero-badge">
              <Zap size={18} className="text-yellow" /> Slice crystals for bonus points & skins!
            </div>
            <button className="neon-play-btn" onClick={startGame}>
              <Play size={20} /> START CLASH
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="game-overlay">
            <h2 className="glow-text-red">BLADES CLASHED!</h2>
            <p>Score: <strong>{score}</strong> | Stage: <strong>{stage}</strong></p>
            {score >= highScore && score > 0 && (
              <div className="high-score-announcement">
                <Trophy size={16} className="text-yellow" /> NEW HIGH SCORE!
              </div>
            )}
            <button className="neon-play-btn" onClick={restartGame}>
              <RotateCcw size={20} /> TRY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Throw Action Button for Mobile / Touch */}
      <div className="knife-controls-bar">
        <button
          className="knife-throw-button"
          onClick={(e) => {
            e.stopPropagation();
            if (!gameStarted) startGame();
            else if (gameOver) restartGame();
            else throwKnife();
          }}
        >
          <Zap size={20} /> THROW KNIFE
        </button>
        <p className="game-tip-text">💡 Tap anywhere on screen or press <strong>SPACE</strong> to throw</p>
      </div>
    </div>
  );
}
