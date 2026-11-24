import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

// How full the context window is, 0 to 100. Fireflies are counted from it.
const percent = atom({ plugin: 'firefly-meadow', key: 'percent' } as const, 0)

// Dusk: plum-tinted grays, firefly gold for the accent.
const { theme, problems } = makeColors({
  label: 'Firefly meadow',
  only: 'dark',
  roles: { accent: '#e8c25a', danger: '#e0705f', success: '#8fc47a', warning: '#e8a54a', pro: '#b49be0' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#161528',
        'surface-1': '#1d1b33',
        'surface-2': '#24213c',
        'surface-3': '#2a2744',
        'text-primary': '#f1ecdf',
        'text-secondary': '#cfc8d8',
        'text-muted': '#a9a2bb',
      },
    },
  },
})

const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: 'firefly-meadow', glass: { blur: 14, tint: '#161528', opacity: 0.55 } },
}

// A steady pseudo-random, so each firefly keeps its place between redraws.
const rand = (i: number, salt: number) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

const BASE = 6
const MAX_EXTRA = 54

const fireflyCount = (p: number) => BASE + Math.round((Math.min(100, Math.max(0, p)) / 100) * MAX_EXTRA)

const fireflies = (count: number) => {
  let out = ''
  for (let i = 0; i < count; i++) {
    // Keep them off the middle column where the words sit: favour the sides and the grass.
    const side = rand(i, 1) < 0.5 ? rand(i, 2) * 0.36 : 0.64 + rand(i, 2) * 0.36
    const x = Math.round((rand(i, 7) < 0.25 ? rand(i, 3) : side) * 1600)
    const y = Math.round(420 + rand(i, 4) * 520)
    const r = (1.6 + rand(i, 5) * 1.8).toFixed(1)
    const drift = 1 + (i % 4)
    const dur = (14 + rand(i, 6) * 14).toFixed(1)
    const delay = (-rand(i, 8) * 28).toFixed(1)
    const glow = (3.5 + rand(i, 9) * 3.5).toFixed(1)
    const gdelay = (-rand(i, 10) * 7).toFixed(1)
    out +=
      `<g transform="translate(${x} ${y})">` +
      `<g class="d${drift}" style="animation-duration:${dur}s;animation-delay:${delay}s">` +
      `<g class="glow" style="animation-duration:${glow}s;animation-delay:${gdelay}s">` +
      `<circle r="${(Number(r) * 6).toFixed(1)}" fill="url(#halo)"/>` +
      `<circle r="${r}" fill="#fff3b0"/>` +
      `</g></g></g>`
  }
  return out
}

const stars = (() => {
  let out = ''
  for (let i = 0; i < 40; i++) {
    const x = Math.round(rand(i, 21) * 1600)
    const y = Math.round(rand(i, 22) * 380)
    const r = (0.6 + rand(i, 23) * 1.1).toFixed(1)
    const o = (0.35 + rand(i, 24) * 0.5).toFixed(2)
    out += `<circle cx="${x}" cy="${y}" r="${r}" fill="#f6ecd8" opacity="${o}"/>`
  }
  return out
})()

const grass = (() => {
  let out = ''
  for (let i = 0; i < 120; i++) {
    const x = Math.round((i / 120) * 1620 - 10 + rand(i, 31) * 10)
    const h = Math.round(40 + rand(i, 32) * 90)
    const lean = Math.round((rand(i, 33) - 0.5) * 40)
    out += `<path d="M${x - 3} 1000 Q${x + lean / 2} ${1000 - h / 2} ${x + lean} ${1000 - h} Q${x + lean / 2 + 2} ${1000 - h / 2} ${x + 3} 1000Z"/>`
  }
  return out
})()

const scene = (count: number) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#121129"/>
<stop offset="0.45" stop-color="#2b2350"/>
<stop offset="0.72" stop-color="#5a3a5e"/>
<stop offset="0.86" stop-color="#9a5a55"/>
</linearGradient>
<radialGradient id="halo">
<stop offset="0" stop-color="#ffe88a" stop-opacity="0.75"/>
<stop offset="0.35" stop-color="#f2c94c" stop-opacity="0.28"/>
<stop offset="1" stop-color="#f2c94c" stop-opacity="0"/>
</radialGradient>
<radialGradient id="moonglow">
<stop offset="0" stop-color="#f7ecd0" stop-opacity="0.35"/>
<stop offset="1" stop-color="#f7ecd0" stop-opacity="0"/>
</radialGradient>
</defs>
<style>
.glow { opacity: 0.85; animation-name: glow; animation-iteration-count: infinite; animation-timing-function: ease-in-out; }
.d1, .d2, .d3, .d4 { animation-iteration-count: infinite; animation-timing-function: ease-in-out; animation-direction: alternate; }
.d1 { animation-name: d1; } .d2 { animation-name: d2; } .d3 { animation-name: d3; } .d4 { animation-name: d4; }
@keyframes glow { 0% { opacity: 0.25; } 50% { opacity: 1; } 100% { opacity: 0.25; } }
@keyframes d1 { from { transform: translate(0px, 0px); } to { transform: translate(60px, -40px); } }
@keyframes d2 { from { transform: translate(0px, 0px); } to { transform: translate(-50px, -60px); } }
@keyframes d3 { from { transform: translate(0px, 0px); } to { transform: translate(40px, 30px); } }
@keyframes d4 { from { transform: translate(0px, 0px); } to { transform: translate(-30px, 45px); } }
.sway { transform-origin: 800px 1000px; animation: sway 9s ease-in-out infinite alternate; }
@keyframes sway { from { transform: skewX(-1.5deg); } to { transform: skewX(1.5deg); } }
</style>
<!-- sky and stars -->
<rect width="1600" height="1000" fill="url(#sky)"/>
${stars}
<!-- moon, top right corner -->
<circle cx="1390" cy="150" r="120" fill="url(#moonglow)"/>
<circle cx="1390" cy="150" r="34" fill="#f4e6c4"/>
<!-- far and near hills -->
<path d="M0 720 C220 640 420 690 620 660 C860 620 1040 700 1260 650 C1420 615 1520 640 1600 630 V1000 H0Z" fill="#2a2440"/>
<path d="M0 800 C260 740 480 790 760 760 C1040 730 1280 800 1600 750 V1000 H0Z" fill="#1d1a2e"/>
<path d="M0 880 C300 840 600 880 900 860 C1200 840 1400 880 1600 860 V1000 H0Z" fill="#141322"/>
<!-- fireflies -->
${fireflies(count)}
<!-- grass in front -->
<g class="sway" fill="#0f0e1a">${grass}</g>
</svg>`

const applyLook = async ($: EngineInterface) => {
  const set = await $.theme.set(LOOK)
  if (!set.isDrawn) {
    $.ui.status(set.reason)
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))
    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }

    const usage = await $.session.usage()
    await update($, percent, () => usage.context.percent ?? 0)

    await applyLook($)

    return next(e)
  })

  // After each turn: a new reading of the context window brings more fireflies.
  on('session.measure', async ($, e, next) => {
    if (e.changed.includes('context') && e.context.percent !== undefined) {
      const p = e.context.percent
      if (fireflyCount(p) !== fireflyCount(await read($, percent))) {
        await update($, percent, () => p)
      }
    }
    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    if (e.props.plugin !== 'firefly-meadow' || (e.surface !== 'desktop' && e.surface !== 'mobile')) {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)
    const count = fireflyCount(await read($, percent))

    return <Svg source={scene(count)} alt={`Fireflies drifting over a dusky meadow: ${count} of them`} />
  })
}
