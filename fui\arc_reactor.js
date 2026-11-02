/**
* arc_reactor.js
* Master 3D Mathematical Projection Canvas Engine for JARVIS Holographic FUI
* Inspired by Nawaz Alamgir's iconic 2015 FUI (Oblivion / Guardians / Iron Man HUD)
* Built for Swayam Dhawale's JARVIS AI.
*/
class ArcReactorCanvas {
constructor(canvasId) {
this.canvas = document.getElementById(canvasId);
if (!this.canvas) return;
this.ctx = this.canvas.getContext('2d');
// Display & Resize
this.width = 0;
this.height = 0;
this.dpr = window.devicePixelRatio || 1;
this.resize();
window.addEventListener('resize', () => this.resize());
// 3D Perspective & Mouse Parallax
this.tiltX = 0.28;
this.tiltY = -0.15;
this.targetTiltX = 0.28;
this.targetTiltY = -0.15;
this.is3DEnabled = true;
// Speeds & Phases
this.spinOuter = 0;
this.spinMid = 0;
this.spinInner = 0;
this.spinGears = 0;
this.radarAngle = 0;
this.pulsePhase = 0;
// Audio Responsiveness
this.audioEnergy = 0;
this.targetAudioEnergy = 0;
this.audioFreqData = new Array(72).fill(0.1);
// Color Palette States
this.mode = 'normal';
this.modeTransition = 0;
// Particle Sparks
this.particles = [];
this.initParticles();
// Mouse Tracking
window.addEventListener('mousemove', (e) => {
if (!this.is3DEnabled) return;
const rect = this.canvas.getBoundingClientRect();
const cx = rect.left + rect.width / 2;
const cy = rect.top + rect.height / 2;
const dx = (e.clientX - cx) / (window.innerWidth / 2);
const dy = (e.clientY - cy) / (window.innerHeight / 2);
this.targetTiltY = dx * 0.35;
this.targetTiltX = 0.28 - dy * 0.3;
});
this.animate = this.animate.bind(this);
requestAnimationFrame(this.animate);
}
resize() {
if (!this.canvas) return;
const rect = this.canvas.getBoundingClientRect();
t
h
i
s
.
w
i
d
t
h
=
r
e
c
t
.
w
i
d
t
h || 6
0
0
;
t
h
i
s
.
h
e
i
g
h
t
=
r
e
c
t
.
h
e
i
g
h
t || 5
0
0
;
t
h
i
s
.
c
a
n
v
a
s
.
w
i
d
t
h
=
t
h
i
s
.
w
i
d
t
h
*
t
h
i
s
.
d
p
r
;
t
h
i
s
.
c
a
n
v
a
s
.
h
e
i
g
h
t
=
t
h
i
s
.
h
e
i
g
h
t
*
t
h
i
s
.
d
p
r
;
t
h
i
s
.
c
t
x
.
s
c
a
l
e
(
t
h
i
s
.
d
p
r
,
t
h
i
s
.
d
p
r
)
;
t
h
i
s
.
c
e
n
t
e
r
X
=
t
h
i
s
.
w
i
d
t
h
/
2
;
t
h
i
s
.
c
e
n
t
e
r
Y
=
t
h
i
s
.
h
e
i
g
h
t
/
2
;
}s
e
t
A
u
d
i
o
E
n
e
r
g
y
(
e
n
e
r
g
y
,
s
p
e
a
k
e
r
= 'i
d
l
e')
{
t
h
i
s
.
t
a
r
g
e
t
A
u
d
i
o
E
n
e
r
g
y
=
M
a
t
h
.
m
i
n
(
1
.
0
,
M
a
t
h
.
m
a
x
(
0
.
0
,
e
n
e
r
g
y
)
)
;
t
h
i
s
.
s
p
e
a
k
e
r
=
s
p
e
a
k
e
r
;
}s
e
t
M
o
d
e
(
m
o
d
e
)
{
t
h
i
s
.
m
o
d
e
=
m
o
d
e
;
}t
o
g
g
l
e
3
D
(
)
{
t
h
i
s
.
i
s
3
D
E
n
a
b
l
e
d
= !t
h
i
s
.
i
s
3
D
E
n
a
b
l
e
d
;
i
f
(!t
h
i
s
.
i
s
3
D
E
n
a
b
l
e
d
)
{
t
h
i
s
.
t
a
r
g
e
t
T
i
l
t
X
=
0
;
t
h
i
s
.
t
a
r
g
e
t
T
i
l
t
Y
=
0
;
}
e
l
s
e
{
t
h
i
s
.
t
a
r
g
e
t
T
i
l
t
X
=
0
.
2
8
;
t
h
i
s
.
t
a
r
g
e
t
T
i
l
t
Y
=
-
0
.
1
5
;
}r
e
t
u
r
n
t
h
i
s
.
i
s
3
D
E
n
a
b
l
e
d
;
}i
n
i
t
P
a
r
t
i
c
l
e
s
(
)
{
t
h
i
s
.
p
a
r
t
i
c
l
e
s
=
[
]
;
f
o
r
(
l
e
t
i
=
0
;
i
<
9
0
;
i
+
+
)
{
c
o
n
s
t
a
n
g
l
e
=
M
a
t
h
.
r
a
n
d
o
m
(
)
*
M
a
t
h
.
P
I
*
2
;
c
o
n
s
t
d
i
s
t
=
3
0
+
M
a
t
h
.
r
a
n
d
o
m
(
)
*
2
4
0
;
t
h
i
s
.
p
a
r
t
i
c
l
e
s
.
p
u
s
h
(
{
x
:
M
a
t
h
.
c
o
s
(
a
n
g
l
e
)
*
d
i
s
t
,
y
:
M
a
t
h
.
s
i
n
(
a
n
g
l
e
)
*
d
i
s
t
,
z
:
(
M
a
t
h
.
r
a
n
d
o
m
(
)
-
0
.
5
)
*
8
0
,
v
x
:
(
M
a
t
h
.
r
a
n
d
o
m
(
)
-
0
.
5
)
*
0
.
4
,
v
y
:
(
M
a
t
h
.
r
a
n
d
o
m
(
)
-
0
.
5
)
*
0
.
4
,
v
z
:
(
M
a
t
h
.
r
a
n
d
o
m
(
)
-
0
.
5
)
*
0
.
6
,
s
i
z
e
:
0
.
8
+
M
a
t
h
.
r
a
n
d
o
m
(
)
*
2
.
2
,
a
l
p
h
a
:
0
.
2
+
M
a
t
h
.
r
a
n
d
o
m
(
)
*
0
.
7
,
l
i
f
e
:
M
a
t
h
.
r
a
n
d
o
m
(
)
*
1
0
0
}
)
;
}
}p
r
o
j
e
c
t
3
D
(
x
,
y
,
z
)
{
c
o
n
s
t
c
o
s
X
=
M
a
t
h
.
c
o
s
(
t
h
i
s
.
t
i
l
t
X
)
;
c
o
n
s
t
s
i
n
X
=
M
a
t
h
.
s
i
n
(
t
h
i
s
.
t
i
l
t
X
)
;
c
o
n
s
t
y
1
=
y
*
c
o
s
X
-
z
*
s
i
n
X
;
c
o
n
s
t
z
1
=
y
*
s
i
n
X
+
z
*
c
o
s
X
;
c
o
n
s
t
c
o
s
Y
=
M
a
t
h
.
c
o
s
(
t
h
i
s
.
t
i
l
t
Y
)
;
c
o
n
s
t
s
i
n
Y
=
M
a
t
h
.
s
i
n
(
t
h
i
s
.
t
i
l
t
Y
)
;
c
o
n
s
t
x
2
=
x
*
c
o
s
Y
+
z
1
*
s
i
n
Y
;
c
o
n
s
t
z
2
=
-
x
*
s
i
n
Y
+
z
1
*
c
o
s
Y
;
c
o
n
s
t
c
a
m
e
r
a
D
i
s
t
=
8
0
0
;
c
o
n
s
t
d
e
p
t
h
=
c
a
m
e
r
a
D
i
s
t
+
z
2
;
c
o
n
s
t
s
c
a
l
e
=
c
a
m
e
r
a
D
i
s
t
/
M
a
t
h
.
m
a
x
(
1
,
d
e
p
t
h
)
;
r
e
t
u
r
n
{
x
:
x
2
*
s
c
a
l
e
+
t
h
i
s
.
c
e
n
t
e
r
X
,
y
:
y
1
*
s
c
a
l
e
+
t
h
i
s
.
c
e
n
t
e
r
Y
,
s
c
a
l
e
:
s
c
a
l
e
,
z
:
z
2
}
;
}
getColor(type, alpha = 1.0) {
const t = this.modeTransition;
if (type === 'primary') {
const r = Math.round(0 + t * 255);
const g = Math.round(229 - t * 206);
const b = Math.round(255 - t * 187);
return `rgba(${r}, ${g}, ${b}, ${alpha})`;
} else if (type === 'accent') {
const r = 255;
const g = Math.round(183 - t * 38);
const b = 0;
return `rgba(${r}, ${g}, ${b}, ${alpha})`;
} else if (type === 'glow') {
const r = Math.round(2 + t * 211);
const g = Math.round(132 - t * 132);
const b = Math.round(199 - t * 199);
return `rgba(${r}, ${g}, ${b}, ${alpha})`;
} else if (type === 'core') {
const r = Math.round(224 + t * 31);
const g = Math.round(255 - t * 27);
const b = Math.round(255 - t * 25);
return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
return `rgba(0, 229, 255, ${alpha})`;
}
drawRing(radius, segments = 64, offsetZ = 0, spin = 0, style = {}) {
const points = [];
for (let i = 0; i <= segments; i++) {
const theta = (i / segments) * Math.PI * 2 + spin;
const x = radius * Math.cos(theta);
const y = radius * Math.sin(theta);
points.push(this.project3D(x, y, offsetZ));
}
this.ctx.beginPath();
this.ctx.moveTo(points[0].x, points[0].y);
for (let i = 1; i < points.length; i++) {
this.ctx.lineTo(points[i].x, points[i].y);
}
this.ctx.save();
this.ctx.strokeStyle = style.color || this.getColor('primary', 0.5);
this.ctx.lineWidth = (style.width || 1.5) * (points[0].scale || 1);
if (style.dash) this.ctx.setLineDash(style.dash);
if (style.glow) {
this.ctx.shadowColor = style.glowColor || this.getColor('primary', 0.8);
this.ctx.shadowBlur = style.glowBlur || 10;
}
this.ctx.stroke();
this.ctx.restore();
}
drawAzimuthDial(radius, offsetZ = 0, spin = 0) {
const totalTicks = 120;
for (let i = 0; i < totalTicks; i++) {
const theta = (i / totalTicks) * Math.PI * 2 + spin;
const isMajor = i % 10 === 0;
const isMedium = i % 5 === 0;
const innerR = isMajor ? radius - 16 : isMedium ? radius - 10 : radius - 5;
const outerR = radius;
const p1 = this.project3D(innerR * Math.cos(theta), innerR * Math.sin(theta), offsetZ);
const p2 = this.project3D(outerR * Math.cos(theta), outerR * Math.sin(theta), offsetZ);
this.ctx.beginPath();
this.ctx.moveTo(p1.x, p1.y);
this.ctx.lineTo(p2.x, p2.y);
this.ctx.strokeStyle = isMajor ? this.getColor('accent', 0.85) : isMedium ? this.getColor('primary', 0.
6) : this.getColor('primary', 0.25);
this.ctx.lineWidth = isMajor ? 2 : 1;
this.ctx.stroke();
if (isMajor) {
const deg = Math.round((i / totalTicks) * 360);
const textR = radius - 26;
const pt = this.project3D(textR * Math.cos(theta), textR * Math.sin(theta), offsetZ);
this.ctx.save();
this.ctx.font = `${Math.max(8, 9 * pt.scale)}px Consolas, monospace`;
this.ctx.fillStyle = this.getColor('accent', 0.75);
this.ctx.textAlign = 'center';
this.ctx.textBaseline = 'middle';
this.ctx.fillText(`${deg.toString().padStart(3, '0')}°`, pt.x, pt.y);
this.ctx.restore();
}
}
}
drawSegmentedArcs(radius, count, arcLen, offsetZ = 0, spin = 0, color, width = 3) {
for (let i = 0; i < count; i++) {
const startAngle = (i / count) * Math.PI * 2 + spin;
const endAngle = startAngle + arcLen;
const steps = 16;
this.ctx.beginPath();
for (let s = 0; s <= steps; s++) {
const theta = startAngle + (s / steps) * (endAngle - startAngle);
const pt = this.project3D(radius * Math.cos(theta), radius * Math.sin(theta), offsetZ);
if (s === 0) this.ctx.moveTo(pt.x, pt.y);
else this.ctx.lineTo(pt.x, pt.y);
}
this.ctx.strokeStyle = color;
this.ctx.lineWidth = width;
this.ctx.stroke();
}
}
drawRadialSpectrum(radius, offsetZ = 0, spin = 0) {
const bars = 72;
for (let i = 0; i < bars; i++) {
const theta = (i / bars) * Math.PI * 2 + spin;
const organicWave = Math.sin(this.pulsePhase * 3 + i * 0.4) * 0.35 + 0.45;
const energyBoost = this.audioEnergy * (Math.sin(i * 1.2 + this.pulsePhase * 8) * 0.5 + 0.8) * 45;
const barHeight = 4 + organicWave * 12 + energyBoost;
const p1 = this.project3D(radius * Math.cos(theta), radius * Math.sin(theta), offsetZ);
const p2 = this.project3D((radius + barHeight) * Math.cos(theta), (radius + barHeight) * Math.sin(thet
a), offsetZ);
this.ctx.beginPath();
this.ctx.moveTo(p1.x, p1.y);
this.ctx.lineTo(p2.x, p2.y);
const alpha = 0.3 + (barHeight / 50) * 0.7;
this.ctx.strokeStyle = this.getColor(i % 3 === 0 ? 'accent' : 'primary', Math.min(1.0, alpha));
this.ctx.lineWidth = 1.8 * p1.scale;
this.ctx.stroke();
}
}
drawGears(radius, teethCount, offsetZ = 0, spin = 0) {
this.ctx.beginPath();
const totalSteps = teethCount * 4;
for (let i = 0; i <= totalSteps; i++) {
const theta = (i / totalSteps) * Math.PI * 2 + spin;
const isTooth = Math.floor(i / 2) % 2 === 0;
const r = isTooth ? radius + 5 : radius;
const pt = this.project3D(r * Math.cos(theta), r * Math.sin(theta), offsetZ);
if (i === 0) this.ctx.moveTo(pt.x, pt.y);
else this.ctx.lineTo(pt.x, pt.y);
}
this.ctx.strokeStyle = this.getColor('primary', 0.4);
this.ctx.lineWidth = 1.2;
this.ctx.stroke();
}
drawRadarSweep(radius, offsetZ = 0) {
const sweepAngle = this.radarAngle;
const pCenter = this.project3D(0, 0, offsetZ);
const pEnd = this.project3D(radius * Math.cos(sweepAngle), radius * Math.sin(sweepAngle), offsetZ);
this.ctx.beginPath();
this.ctx.moveTo(pCenter.x, pCenter.y);
this.ctx.lineTo(pEnd.x, pEnd.y);
this.ctx.strokeStyle = this.getColor('primary', 0.85);
this.ctx.lineWidth = 1.5;
this.ctx.stroke();
const trailSteps = 16;
for (let i = 0; i < trailSteps; i++) {
const a = sweepAngle - (i / trailSteps) * 0.5;
const pt = this.project3D(radius * Math.cos(a), radius * Math.sin(a), offsetZ);
this.ctx.beginPath();
this.ctx.moveTo(pCenter.x, pCenter.y);
this.ctx.lineTo(pt.x, pt.y);
this.ctx.strokeStyle = this.getColor('primary', (1 - i / trailSteps) * 0.08);
this.ctx.lineWidth = 2;
this.ctx.stroke();
}
}
drawTargetCrosshairs(radius, offsetZ = 0) {
const pCenter = this.project3D(0, 0, offsetZ);
const armLen = 22;
this.ctx.save();
this.ctx.strokeStyle = this.getColor('primary', 0.6);
this.ctx.lineWidth = 1.5;
this.ctx.beginPath();
this.ctx.moveTo(pCenter.x - armLen, pCenter.y);
this.ctx.lineTo(pCenter.x - 8, pCenter.y);
this.ctx.moveTo(pCenter.x + 8, pCenter.y);
this.ctx.lineTo(pCenter.x + armLen, pCenter.y);
this.ctx.moveTo(pCenter.x, pCenter.y - armLen);
this.ctx.lineTo(pCenter.x, pCenter.y - 8);
this.ctx.moveTo(pCenter.x, pCenter.y + 8);
this.ctx.lineTo(pCenter.x, pCenter.y + armLen);
this.ctx.stroke();
const boxSize = 36;
const cornerLen = 8;
const corners = [
{ x: pCenter.x - boxSize, y: pCenter.y - boxSize, dx: 1, dy: 1 },
{ x: pCenter.x + boxSize, y: pCenter.y - boxSize, dx: -1, dy: 1 },
{ x: pCenter.x - boxSize, y: pCenter.y + boxSize, dx: 1, dy: -1 },
{ x: pCenter.x + boxSize, y: pCenter.y + boxSize, dx: -1, dy: -1 },
];
corners.forEach(c => {
this.ctx.beginPath();
this.ctx.moveTo(c.x, c.y + c.dy * cornerLen);
this.ctx.lineTo(c.x, c.y);
this.ctx.lineTo(c.x + c.dx * cornerLen, c.y);
this.ctx.strokeStyle = this.getColor('accent', 0.7);
this.ctx.stroke();
});
this.ctx.restore();
}
drawEnergyCore(offsetZ = 0) {
const pCenter = this.project3D(0, 0, offsetZ);
const pulse = Math.abs(Math.sin(this.pulsePhase)) * 8 + (this.audioEnergy * 14);
const r = 18 + pulse;
this.ctx.save();
const glowGrad = this.ctx.createRadialGradient(pCenter.x, pCenter.y, 4, pCenter.x, pCenter.y, r * 3.5);
glowGrad.addColorStop(0, this.getColor('core', 0.9));
glowGrad.addColorStop(0.3, this.getColor('primary', 0.6));
glowGrad.addColorStop(0.7, this.getColor('glow', 0.2));
glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
this.ctx.fillStyle = glowGrad;
this.ctx.beginPath();
this.ctx.arc(pCenter.x, pCenter.y, r * 3.5, 0, Math.PI * 2);
this.ctx.fill();
this.ctx.beginPath();
this.ctx.arc(pCenter.x, pCenter.y, r, 0, Math.PI * 2);
this.ctx.fillStyle = this.getColor('core', 0.95);
this.ctx.shadowColor = this.getColor('primary', 1.0);
this.ctx.shadowBlur = 24;
this.ctx.fill();
const triRadius = r * 0.7;
this.ctx.beginPath();
for (let i = 0; i < 3; i++) {
const angle = (i / 3) * Math.PI * 2 - Math.PI / 2 + this.spinInner * 0.5;
const tx = pCenter.x + Math.cos(angle) * triRadius;
const ty = pCenter.y + Math.sin(angle) * triRadius;
if (i === 0) this.ctx.moveTo(tx, ty);
else this.ctx.lineTo(tx, ty);
}
this.ctx.closePath();
this.ctx.strokeStyle = this.getColor('accent', 0.9);
this.ctx.lineWidth = 2.5;
this.ctx.stroke();
this.ctx.restore();
}
drawParticles() {
this.particles.forEach(p => {
p.x += p.vx;
p.y += p.vy;
p.z += p.vz;
p.life += 0.5;
if (p.life > 100 || Math.hypot(p.x, p.y) > 280) {
const angle = Math.random() * Math.PI * 2;
const dist = 25 + Math.random() * 40;
p.x = Math.cos(angle) * dist;
p.y = Math.sin(angle) * dist;
p.z = (Math.random() - 0.5) * 40;
p.life = 0;
}
const pt = this.project3D(p.x, p.y, p.z);
this.ctx.beginPath();
this.ctx.arc(pt.x, pt.y, p.size * pt.scale, 0, Math.PI * 2);
this.ctx.fillStyle = this.getColor(Math.random() > 0.6 ? 'accent' : 'primary', p.alpha * pt.scale);
this.ctx.fill();
});
}
animate() {
this.tiltX += (this.targetTiltX - this.tiltX) * 0.08;
this.tiltY += (this.targetTiltY - this.tiltY) * 0.08;
this.audioEnergy += (this.targetAudioEnergy - this.audioEnergy) * 0.15;
const targetTransition = this.mode === 'serious' ? 1.0 : 0.0;
this.modeTransition += (targetTransition - this.modeTransition) * 0.08;
const speedBoost = 1.0 + this.modeTransition * 1.2 + this.audioEnergy * 0.8;
this.spinOuter -= 0.003 * speedBoost;
this.spinMid += 0.007 * speedBoost;
this.spinInner -= 0.015 * speedBoost;
this.spinGears += 0.004 * speedBoost;
this.radarAngle += 0.025 * speedBoost;
this.pulsePhase += 0.04 * speedBoost;
this.ctx.clearRect(0, 0, this.width, this.height);
const baseR = Math.min(this.width, this.height) * 0.38;
this.drawParticles();
this.drawRing(baseR, 96, -20, 0, { color: this.getColor('primary', 0.2), width: 1 });
this.drawAzimuthDial(baseR, -10, this.spinOuter);
this.drawSegmentedArcs(baseR * 0.88, 4, 0.35, -5, this.spinMid, this.getColor('accent', 0.8), 3.5);
this.drawSegmentedArcs(baseR * 0.88, 4, 0.2, -5, this.spinMid + Math.PI / 4, this.getColor('primary', 0.6),
2);
this.drawRadialSpectrum(baseR * 0.72, 5, this.spinInner);
this.drawRing(baseR * 0.72, 64, 5, 0, { color: this.getColor('primary', 0.4), width: 1.5, dash: [4, 4] });
this.drawGears(baseR * 0.58, 24, 15, this.spinGears);
this.drawRing(baseR * 0.52, 48, 20, 0, { color: this.getColor('accent', 0.5), width: 1 });
this.drawRing(baseR * 0.38, 32, 25, this.spinInner, { color: this.getColor('primary', 0.8), width: 2, dash:
[10, 6], glow: true });
for (let i = 0; i < 6; i++) {
const theta = (i / 6) * Math.PI * 2 + this.spinInner;
const pt = this.project3D(baseR * 0.38 * Math.cos(theta), baseR * 0.38 * Math.sin(theta), 25);
this.ctx.beginPath();
this.ctx.arc(pt.x, pt.y, 3 * pt.scale, 0, Math.PI * 2);
this.ctx.fillStyle = this.getColor('accent', 1.0);
this.ctx.fill();
}
this.drawRadarSweep(baseR * 0.7, 10);
this.drawTargetCrosshairs(baseR * 0.2, 30);
this.drawEnergyCore(30);
requestAnimationFrame(this.animate);
}
}
window.ArcReactorCanvas = ArcReactorCanvas;