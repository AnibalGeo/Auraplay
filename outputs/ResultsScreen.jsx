import { useEffect, useRef } from 'react'
import { usePatient } from '../context/PatientContext'
import { LEVELS, STIMULUS_CONFIG } from '../data/levels'

// Vibración háptica según estrellas ganadas
function vibrate(earned) {
  if (!navigator.vibrate) return
  if (earned === 3) navigator.vibrate([80, 40, 80, 40, 120])
  else if (earned === 2) navigator.vibrate([80, 40, 80])
  else navigator.vibrate([60])
}

// Confeti canvas — partículas simples sin librería externa
function launchConfetti(canvas, earned) {
  if (earned < 2) return
  const ctx = canvas.getContext('2d')
  const W = canvas.width = canvas.offsetWidth
  const H = canvas.height = canvas.offsetHeight
  const count = earned === 3 ? 120 : 60
  const colors = ['#4aab8a','#7c6bb0','#e07a5f','#e8a020','#fff','#c8e8dc']

  const particles = Array.from({ length: count }, () => ({
    x: Math.random() * W,
    y: -10 - Math.random() * 40,
    r: 4 + Math.random() * 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random() - 0.5) * 3,
    vy: 2 + Math.random() * 3,
    rot: Math.random() * 360,
    rotV: (Math.random() - 0.5) * 6,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
  }))

  let frame
  let elapsed = 0

  function draw() {
    ctx.clearRect(0, 0, W, H)
    elapsed++
    let alive = false
    for (const p of particles) {
      p.x  += p.vx
      p.y  += p.vy
      p.rot += p.rotV
      p.vy += 0.06  // gravity
      if (p.y < H + 20) alive = true
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate((p.rot * Math.PI) / 180)
      ctx.globalAlpha = Math.max(0, 1 - elapsed / 160)
      ctx.fillStyle = p.color
      if (p.shape === 'rect') {
        ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r)
      } else {
        ctx.beginPath()
        ctx.arc(0, 0, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }
    if (alive && elapsed < 180) frame = requestAnimationFrame(draw)
    else ctx.clearRect(0, 0, W, H)
  }
  frame = requestAnimationFrame(draw)
  return () => cancelAnimationFrame(frame)
}

// Sonido de celebración con Web Audio API
function playCelebration(earned) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const notes = earned === 3
      ? [523, 659, 784, 1047]   // Do-Mi-Sol-Do (acorde mayor ascendente)
      : [523, 659, 784]          // Do-Mi-Sol
    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.22, ctx.currentTime + i * 0.13)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.13 + 0.25)
      osc.start(ctx.currentTime + i * 0.13)
      osc.stop(ctx.currentTime + i * 0.13 + 0.3)
    })
  } catch (_) {}
}

export default function ResultsScreen({ result, onHome }) {
  const { patient } = usePatient()
  const level = LEVELS[patient.levelId]
  const canvasRef = useRef(null)
  const cleanupRef = useRef(null)

  const { score, total, earned } = result
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0

  const config = {
    3: { icon: '🏆', title: '¡Increíble!',    sub: 'Actividad completada perfectamente', color: '#e8a020' },
    2: { icon: '🌟', title: '¡Muy bien!',      sub: 'Gran trabajo en esta sesión',        color: '#4aab8a' },
    1: { icon: '⭐', title: '¡Buen intento!',  sub: 'Con práctica lo lograrás',           color: '#7c6bb0' },
    0: { icon: '💪', title: '¡Sigue adelante!','sub': 'Cada intento cuenta',              color: '#e07a5f' },
  }[Math.min(earned, 3)] ?? config?.[1]

  const diagConfig = Object.values(STIMULUS_CONFIG ?? {}).find(
    c => c.key === patient.diagnosis
  ) ?? { label: patient.diagnosis }

  useEffect(() => {
    // Pequeño delay para que la pantalla esté visible antes de los efectos
    const t = setTimeout(() => {
      vibrate(earned)
      playCelebration(earned)
      if (canvasRef.current) {
        cleanupRef.current = launchConfetti(canvasRef.current, earned)
      }
    }, 300)
    return () => {
      clearTimeout(t)
      cleanupRef.current?.()
    }
  }, [])

  const stars = Array.from({ length: 3 }, (_, i) => i < earned ? '★' : '☆')

  return (
    <div style={styles.screen}>

      {/* Canvas de confeti — posición absoluta sobre toda la pantalla */}
      <canvas
        ref={canvasRef}
        style={styles.canvas}
        aria-hidden="true"
      />

      <div style={styles.content}>

        {/* Ícono animado */}
        <div style={{ ...styles.iconWrap, borderColor: config.color }}>
          <span style={styles.icon}>{config.icon}</span>
        </div>

        {/* Título */}
        <h1 style={styles.title}>{config.title}</h1>
        <p style={styles.sub}>{config.sub}</p>

        {/* Estrellas */}
        <div style={styles.starsRow}>
          {stars.map((s, i) => (
            <span
              key={i}
              style={{
                ...styles.star,
                color: i < earned ? '#e8a020' : '#ddd',
                animationDelay: `${0.3 + i * 0.12}s`,
              }}
            >
              {s}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div style={styles.statsCard}>
          <div style={styles.statsGrid}>
            <div style={styles.stat}>
              <span style={styles.statVal}>{score}/{total}</span>
              <span style={styles.statLabel}>Correctas</span>
            </div>
            <div style={styles.stat}>
              <span style={{ ...styles.statVal, color: config.color }}>{percentage}%</span>
              <span style={styles.statLabel}>Logrado</span>
            </div>
            <div style={styles.stat}>
              <span style={{ ...styles.statVal, color: '#e8a020' }}>+{earned}</span>
              <span style={styles.statLabel}>Estrellas</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statVal}>⭐ {patient.stars ?? 0}</span>
              <span style={styles.statLabel}>Total</span>
            </div>
          </div>
          <div style={styles.divider} />
          <p style={styles.levelLabel}>
            {level?.label ?? patient.levelId}
            {level?.ageRange ? ` · ${level.ageRange}` : ''}
          </p>
        </div>

        {/* Diagnóstico */}
        <div style={styles.diagCard}>
          <span style={styles.diagLabel}>{diagConfig.label ?? patient.diagnosis}</span>
        </div>

        {/* Botón home */}
        <button style={styles.homeBtn} onClick={onHome}>
          Volver al inicio 🏠
        </button>

      </div>

      <style>{`
        @keyframes bounceIn {
          0%   { transform: scale(0.4); opacity: 0; }
          60%  { transform: scale(1.15); opacity: 1; }
          80%  { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        @keyframes starPop {
          0%   { transform: scale(0); opacity: 0; }
          70%  { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }
        .result-icon { animation: bounceIn 0.5s ease forwards; }
        .result-star { animation: starPop 0.4s ease forwards; opacity: 0; }
      `}</style>
    </div>
  )
}

const styles = {
  screen: {
    minHeight: '100vh',
    background: '#f4f6f4',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  canvas: {
    position: 'absolute',
    top: 0, left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 10,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '48px 20px 40px',
    width: '100%',
    maxWidth: 480,
    gap: 16,
    position: 'relative',
    zIndex: 20,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: '50%',
    background: '#fff',
    border: '3px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'bounceIn 0.5s ease forwards',
    boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
  },
  icon: { fontSize: 52 },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#3a3a3a',
    margin: 0,
    textAlign: 'center',
  },
  sub: {
    fontSize: 15,
    color: '#666',
    margin: 0,
    textAlign: 'center',
  },
  starsRow: {
    display: 'flex',
    gap: 8,
  },
  star: {
    fontSize: 40,
    display: 'inline-block',
    animation: 'starPop 0.4s ease forwards',
    opacity: 0,
  },
  statsCard: {
    width: '100%',
    background: '#fff',
    borderRadius: 16,
    border: '0.5px solid rgba(0,0,0,0.09)',
    padding: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap: 8,
    textAlign: 'center',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  statVal: {
    fontSize: 18,
    fontWeight: 700,
    color: '#3a3a3a',
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
  },
  divider: {
    height: '0.5px',
    background: 'rgba(0,0,0,0.08)',
    margin: '12px 0 10px',
  },
  levelLabel: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    margin: 0,
  },
  diagCard: {
    background: '#fff',
    borderRadius: 12,
    border: '0.5px solid rgba(0,0,0,0.09)',
    padding: '8px 18px',
  },
  diagLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: 500,
  },
  homeBtn: {
    width: '100%',
    padding: '15px',
    borderRadius: 14,
    border: 'none',
    background: '#4aab8a',
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 8,
  },
}
