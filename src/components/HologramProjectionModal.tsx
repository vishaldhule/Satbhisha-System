import React, { useState, useEffect, useRef } from 'react';
import {
X,
Smartphone,
Orbit,
Radio,
Search,
ExternalLink,
RefreshCw,
Sparkles,
Layers,
Cpu,
Heart,
Car,
Plane,
Eye,
Sliders,
Maximize2
} from 'lucide-react';
import { HologramPayload, WeatherHologramData, ChronoHologramData } from '../types';
import { jarvisAudio } from '../utils/sound_effects';
interface HologramProjectionModalProps {
isOpen: boolean;
onClose: () => void;
hologram: HologramPayload | null;
onSendChatCommand?: (cmd: string) => void;
}
// Dynamic script loader for Three.js, OrbitControls and GLTFLoader inside Google AI Studio
const loadScript = (src: string): Promise<void> => {
return new Promise((resolve, reject) => {
if (document.querySelector(`script[src="${src}"]`)) {
resolve();
return;
}
const script = document.createElement('script');
script.src = src;
script.async = true;
script.onload = () => resolve();
script.onerror = (e) => reject(e);
document.head.appendChild(script);
});
};
export const HologramProjectionModal: React.FC<HologramProjectionModalProps> = ({
isOpen,
onClose,
hologram,
onSendChatCommand,
}) => {
// Active model query: 'phone' | 'solarsystem' | 'drone' | 'car' | 'brain' | 'heart' | 'reactor' | 'custom'
const [modelQuery, setModelQuery] = useState<string>('phone');
const [searchInput, setSearchInput] = useState<string>('');
const [customModelUrl, setCustomModelUrl] = useState<string>('');
const [isLoadingModel, setIsLoadingModel] = useState<boolean>(false);
// 3D Canvas Reference
const mountRef = useRef<HTMLDivElement | null>(null);
const engineRef = useRef<any>({
renderer: null,
scene: null,
camera: null,
controls: null,
animId: null,
currentModelGroup: null,
subParts: [],
planets: {},
isExploded: false,
explodeVal: 0,
Page 4 of 18
solarSpeed: 1.0,
autoRotate: true,
isWireframe: false,
hologramColor: 0x00f3ff,
audioCtx: null,
});
// Telemetry HUD state
const [telemetry, setTelemetry] = useState<{
badge: string;
title: string;
desc: string;
specs: Array<{ label: string; val: string; color?: string }>;
}>({
badge: 'TACTICAL 3D TELEMETRY',
title: 'HOLOGRAPHIC SMARTPHONE TEARDOWN',
desc: 'Multi-layered procedural 3D model featuring Ceramic Shield OLED screen, A17 Neural Engine motherboard, 4850mAh
battery, and triple-lens camera array.',
specs: [
{ label: 'ARCHITECTURE', val: 'Titanium Grade-5 Frame' },
{ label: 'STATUS', val: 'NOMINAL // 100%', color: 'text-emerald-400' },
{ label: 'CORE THERMAL', val: '31.8 °C', color: 'text-amber-300' },
{ label: 'EFFICIENCY', val: '99.8%', color: 'text-cyan-300' },
],
});
const [explodeSliderVal, setExplodeSliderVal] = useState<number>(0);
const [isExploded, setIsExploded] = useState<boolean>(false);
const [activePlanetId, setActivePlanetId] = useState<string>('sun');
// Web Audio Synth for Sci-Fi sound effects
const playSfx = (freq = 1200, duration = 0.08) => {
try {
const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
if (!AudioCtx) return;
if (!engineRef.current.audioCtx) {
engineRef.current.audioCtx = new AudioCtx();
}
const ctx = engineRef.current.audioCtx;
if (ctx.state === 'suspended') ctx.resume();
const osc = ctx.createOscillator();
const gain = ctx.createGain();
osc.type = 'sine';
osc.frequency.setValueAtTime(freq, ctx.currentTime);
osc.frequency.exponentialRampToValueAtTime(freq * 1.4, ctx.currentTime + duration);
gain.gain.setValueAtTime(0.06, ctx.currentTime);
gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
osc.connect(gain);
gain.connect(ctx.destination);
osc.start();
osc.stop(ctx.currentTime + duration);
} catch {}
};
// Sync 
if (!(window as any).THREE) {
await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
}
if (!(window as any).THREE?.OrbitControls) {
await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js');
}
if (!(window as any).THREE?.GLTFLoader) {
await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js');
}
if (!isSubscribed || !mountRef.current) return;
const THREE = (window as any).THREE;
mountRef.current.innerHTML = '';
const width = mountRef.current.clientWidth || 800;
const height = mountRef.current.clientHeight || 560;
// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(width, height);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
mountRef.current.appendChild(renderer.domElement);
// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030712);
scene.fog = new THREE.FogExp2(0x030712, 0.003);
// Camera
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2500);
camera.position.set(0, 8, 22);
// OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.0;
controls.maxDistance = 500;
controls.minDistance = 2;
// Lighting
const ambientLight = new THREE.AmbientLight(0x0a2244, 2.0);
scene.add(ambientLight);
const cyanDir = new THREE.DirectionalLight(0x00f3ff, 2.8);
cyanDir.position.set(15, 25, 20);
scene.add(cyanDir);
const amberDir = new THREE.DirectionalLight(0xffaa00, 2.0);
amberDir.position.set(-15, -10, -15);
scene.add(amberDir);
// Starfield
const count = 1200;
const starGeo = new THREE.BufferGeometry();
const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);
for (let i = 0; i < count; i++) {
positions[i * 3] = (Math.random() - 0.5) * 600;
positions[i * 3 + 1] = (Math.random() - 0.5) * 600;
positions[i * 3 + 2] = (Math.random() - 0.5) * 600;
const isCyan = Math.random() > 0.45;
colors[i * 3] = isCyan ? 0.0 : 0.9;
colors[i * 3 + 1] = isCyan ? 0.95 : 0.8;
colors[i * 3 + 2] = 1.0;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
const starMat = new THREE.PointsMaterial({ size: 1.6, vertexColors: true, transparent: true, opacity: 0.65 });
scene.add(new THREE.Points(starGeo, starMat));
engineRef.current = {
renderer,
scene,
camera,
controls,
currentModelGroup: null,
subParts: [],
planets: {},
isExploded: false,
explodeVal: 0,
solarSpeed: 1.0,
autoRotate: true,
isWireframe: false,
hologramColor: 0x00f3ff,
};
// Render initial model
buildModel(modelQuery);
// Animation Loop
const animate = () => {
engineRef.current.animId = requestAnimationFrame(animate);
controls.update();
// Model-specific continuous rotations
if (engineRef.current.planets && Object.keys(engineRef.current.planets).length > 0) {
Object.values(engineRef.current.planets).forEach((p: any) => {
if (p.pivot && p.speed) p.pivot.rotation.y += p.speed * 0.15 * engineRef.current.solarSpeed;
if (p.mesh) p.mesh.rotation.y += 0.012;
});
}
renderer.render(scene, camera);
};
animate();
// Raycasting for click-to-inspect
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const onCanvasClick = (e: MouseEvent) => {
if (!mountRef.current) return;
const rect = mountRef.current.getBoundingClientRect();
mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
raycaster.setFromCamera(mouse, camera);
if (engineRef.current.subParts && engineRef.current.subParts.length > 0) {
const hits = raycaster.intersectObjects(engineRef.current.subParts, true);
if (hits.length > 0) {
let hit = hits[0].object;
while (hit.parent && !hit.userData?.name && hit.parent !== scene) {
hit = hit.parent;
}
if (hit.userData && hit.userData.name) {
inspectSubPart(hit);
}
}
}
};
mountRef.current.addEventListener('click', onCanvasClick);
// Resize handler
const onResize = () => {
if (!mountRef.current) return;
const w = mountRef.current.clientWidth;
const h = mountRef.current.clientHeight;
camera.aspect = w / h;
camera.updateProjectionMatrix();
renderer.setSize(w, h);
};
window.addEventListener('resize', onResize);
} catch (err) {
console.error('Three.js setup error:', err);
}
};
initEngine();
return () => {
isSubscribed = false;
if (engineRef.current.animId) cancelAnimationFrame(engineRef.current.animId);
if (engineRef.current.renderer) engineRef.current.renderer.dispose();
};
}, [isOpen]);
// Inspect sub-part on click
const inspectSubPart = (mesh: any) => {
playSfx(1600, 0.09);
const data = mesh.userData;
setTelemetry({
badge: 'COMPONENT DIAGNOSTIC',
title: data.name.toUpperCase(),
desc: data.desc || 'Holographic component analyzed. Sub-assembly telemetry verified nominal.',
specs: [
{ label: 'COMPONENT', val: data.stats?.comp || data.name },
{ label: 'STATUS', val: data.stats?.status || 'ONLINE', color: 'text-emerald-400' },
{ label: 'THERMAL', val: data.stats?.therm || '32.1 °C', color: 'text-amber-300' },
{ label: 'EFFICIENCY', val: data.stats?.eff || '99.9%', color: 'text-cyan-300' },
],
});
// Highlight part in gold
engineRef.current.subParts.forEach((p: any) => {
if (p.material) {
if (p === mesh) {
p.material.emissive = new (window as any).THREE.Color(0xffaa00);
p.material.emissiveIntensity = 0.9;
} else {
p.material.emissive = new (window as any).THREE.Color(0x003355);
p.material.emissiveIntensity = 0.3;
}
}
});
};
// ---------------------------------------------------------------------------
// MODEL BUILDER & GLTF/PROCEDURAL PIPELINE
// ---------------------------------------------------------------------------
const buildModel = (modelKey: string, customUrl?: string) => {
const s = engineRef.current;
if (!s || !s.scene) return;
const THREE = (window as any).THREE;
// Remove old model
if (s.currentModelGroup) {
s.scene.remove(s.currentModelGroup);
s.currentModelGroup = null;
}
s.subParts = [];
s.planets = {};
setExplodeSliderVal(0);
setIsExploded(false);
const modelGroup = new THREE.Group();
s.currentModelGroup = modelGroup;
s.scene.add(modelGroup);
// Common Holographic Materials
const chassisMat = new THREE.MeshStandardMaterial({
color: 0x071e3d, metalness: 0.85, roughness: 0.25, emissive: 0x004066, emissiveIntensity: 0.35, wireframe: s.isWire
frame
});
const glassMat = new THREE.MeshPhysicalMaterial({
color: 0x00f3ff, transmission: 0.85, transparent: true, opacity: 0.7, emissive: 0x003355, emissiveIntensity: 0.4, w
ireframe: s.isWireframe
});
const circuitMat = new THREE.MeshStandardMaterial({
color: 0x0a1c2a, metalness: 0.7, roughness: 0.3, emissive: 0x00f3ff, emissiveIntensity: 0.6, wireframe: s.isWirefra
me
});
const socMat = new THREE.MeshStandardMaterial({
color: 0x111111, metalness: 0.9, roughness: 0.2, emissive: 0xffaa00, emissiveIntensity: 0.8, wireframe: s.isWirefra
me
});
// =========================================================================
// 1. SMARTPHONE PRO TEARDOWN
// =========================================================================
if (modelKey === 'phone') {
s.camera.position.set(0, 8, 22);
s.controls.target.set(0, 0, 0);
const phoneW = 7.2;
const phoneH = 15.0;
const phoneD = 0.8;
// Front OLED Glass (+Z offset)
const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(phoneW, phoneH, 0.08), glassMat.clone());
frontGlass.userData = {
name: "Front OLED Glass & Digitizer",
offset: new THREE.Vector3(0, 0, 5.0),
desc: "Super Retina XDR OLED panel with 120Hz ProMotion and Ceramic Shield holographic glass.",
stats: { comp: "OLED Panel", status: "120Hz NOMINAL", therm: "31.5 °C", eff: "99.8%" }
};
modelGroup.add(frontGlass);
s.subParts.push(frontGlass);
// Logic Board (+Z and +Y offset)
const board = new THREE.Mesh(new THREE.BoxGeometry(phoneW * 0.9, phoneH * 0.42, 0.14), circuitMat.clone());
board.position.set(0, phoneH * 0.24, 0);
board.userData = {
name: "Central Logic Board & NPU",
offset: new THREE.Vector3(0, 2.5, 3.2),
desc: "High-density multi-layer PCB housing the 3nm Neural SoC and 16GB LPDDR5X RAM.",
stats: { comp: "Logic Board", status: "OCTA-CORE ONLINE", therm: "38.6 °C", eff: "98.9%" }
};
modelGroup.add(board);
s.subParts.push(board);
// SoC Chip on Board
const soc = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.0, 0.12), socMat);
soc.position.set(0, 0, 0.12);
soc.userData = {
name: "A17 Pro / Snapdragon Neural Engine",
offset: new THREE.Vector3(0, 2.5, 3.6),
desc: "Next-gen 3nm Silicon with hardware ray tracing and 35 TOPS 16-core NPU.",
stats: { comp: "SoC Core", status: "3.78 GHz TURBO", therm: "41.2 °C", eff: "99.1%" }
};
board.add(soc);
s.subParts.push(soc);
// Battery Cell (+Z and -Y offset)
const battery = new THREE.Mesh(new THREE.BoxGeometry(phoneW * 0.88, phoneH * 0.46, 0.25), chassisMat.clone());
battery.position.set(0, -phoneH * 0.22, 0);
battery.userData = {
name: "4,850 mAh Li-Polymer Battery",
offset: new THREE.Vector3(0, -2.0, 2.2),
desc: "High-density dual-cell cobalt pack with 65W fast-charging telemetry.",
stats: { comp: "Battery Pack", status: "100% CHARGED", therm: "29.8 °C", eff: "99.9%" }
};
modelGroup.add(battery);
s.subParts.push(battery);
// Chassis Frame (Anchor 0 offset)
const frame = new THREE.Mesh(new THREE.BoxGeometry(phoneW, phoneH, phoneD), chassisMat.clone());
frame.userData = {
name: "Aerospace Titanium Chassis",
offset: new THREE.Vector3(0, 0, 0),
desc: "Grade 5 titanium outer band providing structural rigidity and thermal conduction.",
stats: { comp: "Titanium Frame", status: "RIGID INTEGRITY", therm: "30.4 °C", eff: "100%" }
};
modelGroup.add(frame);
s.subParts.push(frame);
// Camera Module (-Z offset backwards)
const camPlate = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.2, 0.4), chassisMat.clone());
camPlate.position.set(-phoneW * 0.22, phoneH * 0.32, -phoneD / 2 - 0.2);
camPlate.userData = {
name: "Pro Triple-Lens Camera Array",
offset: new THREE.Vector3(-1.8, 2.2, -3.8),
desc: "Tri-camera optical system: 48MP Main with OIS, Ultra-Wide, and 5x Optical Periscope.",
stats: { comp: "Camera Module", status: "4K 60FPS READY", therm: "32.0 °C", eff: "99.6%" }
};
modelGroup.add(camPlate);
s.subParts.push(camPlate);
// Rear Glass Panel (-Z offset)
const backGlass = new THREE.Mesh(new THREE.BoxGeometry(phoneW, phoneH, 0.08), glassMat.clone());
backGlass.position.set(0, 0, -phoneD / 2 - 0.04);
backGlass.userData = {
name: "Rear Frosted Ceramic Glass",
offset: new THREE.Vector3(0, 0, -4.5),
desc: "Precision textured frosted matte glass with MagSafe induction coil array.",
stats: { comp: "Back Cover", status: "MAGSAFE READY", therm: "29.1 °C", eff: "100%" }
};
modelGroup.add(backGlass);
s.subParts.push(backGlass);
setTelemetry({
badge: 'TACTICAL 3D TELEMETRY',
title: 'HOLOGRAPHIC SMARTPHONE TEARDOWN',
desc: 'Multi-layered procedural 3D model featuring Ceramic Shield OLED screen, A17 Neural Engine motherboard, 485
0mAh battery, and triple-lens camera array.',
specs: [
{ label: 'CHASSIS', val: 'Titanium Grade-5' },
{ label: 'STATUS', val: 'NOMINAL // 100%', color: 'text-emerald-400' },
{ label: 'THERMAL', val: '31.8 °C', color: 'text-amber-300' },
{ label: 'EFFICIENCY', val: '99.8%', color: 'text-cyan-300' },
],
});
// =========================================================================
// 2. SOLAR SYSTEM ORBITAL MATRIX
// =========================================================================
} else if (modelKey === 'solarsystem') {
s.camera.position.set(0, 90, 170);
s.controls.target.set(0, 0, 0);
const sun = new THREE.Mesh(new THREE.SphereGeometry(6.5, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffcc00
}));
modelGroup.add(sun);
const planetDefs = [
{ id: 'mercury', name: 'Mercury', color: 0xa8a8b2, r: 0.6, dist: 16, spd: 0.038, diam: '4,879 km', mass: '3.30 ×
10²³ kg', period: '88 Days', temp: '167 °C avg', desc: 'Smallest planet, rocky cratered surface, extreme temperature swin
gs.' },
{ id: 'venus', name: 'Venus', color: 0xe3bb76, r: 1.1, dist: 24, spd: 0.028, diam: '12,104 km', mass: '4.87 × 10²
³ kg', period: '225 Days', temp: '464 °C avg', desc: 'Hottest planet in the solar system due to runaway greenhouse effec
t.' },
{ id: 'earth', name: 'Earth', color: 0x2288ff, r: 1.25, dist: 34, spd: 0.020, diam: '12,742 km', mass: '5.97 × 10
²⁴ kg', period: '365.25 Days', temp: '15 °C avg', desc: 'The sapphire cradle of humanity. Oceans, atmosphere, and magneto
sphere.', hasMoon: true },
{ id: 'mars', name: 'Mars', color: 0xcc4422, r: 0.8, dist: 46, spd: 0.016, diam: '6,779 km', mass: '6.42 × 10²³ k
g', period: '687 Days', temp: '-63 °C avg', desc: 'The Red Planet. Iron oxide desert featuring Olympus Mons.' },
{ id: 'jupiter', name: 'Jupiter', color: 0xd9a46a, r: 3.4, dist: 66, spd: 0.011, diam: '139,820 km', mass: '1.89
× 10²⁷ kg', period: '11.86 Yrs', temp: '-110 °C avg', desc: 'King of planets. Massive gas giant with 95 moons and Great R
ed Spot.' },
{ id: 'saturn', name: 'Saturn', color: 0xe0c88a, r: 2.8, dist: 88, spd: 0.008, diam: '116,460 km', mass: '5.68 ×
10²⁶ kg', period: '29.45 Yrs', temp: '-140 °C avg', desc: 'Adorned with iconic multi-tier ring system of billions of ice
chunks.', hasRings: true },
{ id: 'uranus', name: 'Uranus', color: 0x66ddff, r: 1.9, dist: 110, spd: 0.0055, diam: '50,724 km', mass: '8.68 ×
10²⁵ kg', period: '84.0 Yrs', temp: '-195 °C avg', desc: 'Cyan ice giant with retrograde rotation and an extreme 98° axia
l tilt.' },
{ id: 'neptune', name: 'Neptune', color: 0x3355ee, r: 1.8, dist: 130, spd: 0.0042, diam: '49,244 km', mass: '1.02
× 10²⁶ kg', period: '164.8 Yrs', temp: '-200 °C avg', desc: 'Supersonic winds reaching 2,100 km/h and dark vortex storm
s.' },
];
planetDefs.forEach(p => {
const orbitCurve = new THREE.EllipseCurve(0, 0, p.dist, p.dist, 0, 2 * Math.PI, false, 0);
const orbitLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitCurve.getPoints(100)), new THREE.L
ineBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0.2 }));
orbitLine.rotation.x = Math.PI / 2;
modelGroup.add(orbitLine);
const pivot = new THREE.Group();
modelGroup.add(pivot);
const planetMesh = new THREE.Mesh(new THREE.SphereGeometry(p.r, 32, 32), new THREE.MeshStandardMaterial({ color:
p.color, roughness: 0.7 }));
planetMesh.position.set(p.dist, 0, 0);
pivot.add(planetMesh);
if (p.hasRings) {
const ringMesh = new THREE.Mesh(new THREE.RingGeometry(p.r * 1.4, p.r * 2.5, 32), new THREE.MeshStandardMateria
l({ color: 0xcca877, side: THREE.DoubleSide, transparent: true, opacity: 0.8 }));
ringMesh.rotation.x = Math.PI / 2;
}
s.planets[p.id] = { mesh: planetMesh, pivot, speed: p.spd, data: p };
s.subParts.push(planetMesh);
});
setTelemetry({
badge: 'CELESTIAL ORBITAL MATRIX',
title: 'SOLAR SYSTEM MATRIX',
desc: 'Gravitational orbital matrix of Sol and 8 planetary bodies. Click any planet to fly camera in and inspect
real planetary science telemetry.',
specs: [
{ label: 'STAR', val: 'Sol (G2V Class)' },
{ label: 'BODIES', val: '8 Major Planets', color: 'text-amber-300' },
{ label: 'SOLAR LIGHT', val: '3.0 POINT LIGHT', color: 'text-cyan-300' },
{ label: 'STABILITY', val: '100% NOMINAL', color: 'text-emerald-400' },
],
});
// =========================================================================
// 3. TACTICAL QUADCOPTER DRONE
// =========================================================================
} else if (modelKey === 'drone') {
s.camera.position.set(0, 10, 20);
s.controls.target.set(0, 0, 0);
// Central Body
const droneBody = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.2, 5.0), chassisMat.clone());
droneBody.userData = {
name: "Autonomous Carbon-Fiber Core",
offset: new THREE.Vector3(0, 0, 0),
desc: "Reinforced composite chassis housing dual LiDAR sensors, GPS-RTK positioning, and neural flight controlle
r.",
stats: { comp: "Central Chassis", status: "ARMED // NOMINAL", therm: "28.4 °C", eff: "99.4%" }
};
modelGroup.add(droneBody);
s.subParts.push(droneBody);
// 4 Arms & Rotors
const armPositions = [
{ x: 4.5, z: 4.5, offX: 3.5, offZ: 3.5, label: "Motor Arm Front-Right" },
{ x: -4.5, z: 4.5, offX: -3.5, offZ: 3.5, label: "Motor Arm Front-Left" },
{ x: 4.5, z: -4.5, offX: 3.5, offZ: -3.5, label: "Motor Arm Rear-Right" },
{ x: -4.5, z: -4.5, offX: -3.5, offZ: -3.5, label: "Motor Arm Rear-Left" },
];
armPositions.forEach((pos) => {
const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 4.5), chassisMat.clone());
arm.position.set(pos.x / 2, 0.2, pos.z / 2);
arm.rotation.z = Math.PI / 4;
arm.userData = {
name: pos.label,
offset: new THREE.Vector3(pos.offX, 1.5, pos.offZ),
desc: "High-torque brushless outrunner motor delivering 14,000 RPM with carbon propeller blades.",
stats: { comp: pos.label, status: "14,000 RPM READY", therm: "33.2 °C", eff: "99.2%" }
};
modelGroup.add(arm);
s.subParts.push(arm);
// Rotor Disk
const rotor = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 0.05, 16), glassMat.clone());
rotor.position.set(pos.x, 0.6, pos.z);
rotor.userData = {
name: `${pos.label} Rotor`,
offset: new THREE.Vector3(pos.offX * 1.3, 3.0, pos.offZ * 1.3),
desc: "Aerodynamic dual-blade folding carbon propeller generating 2.4 kg peak thrust per axis.",
stats: { comp: "Propeller Blade", status: "BALANCED", therm: "26.1 °C", eff: "99.8%" }
};
modelGroup.add(rotor);
s.subParts.push(rotor);
});
// Gimbal 4K Camera (-Y offset)
const gimbal = new THREE.Mesh(new THREE.SphereGeometry(1.0, 16, 16), socMat);
gimbal.position.set(0, -1.2, 2.2);
gimbal.userData = {
name: "3-Axis 4K Thermal Gimbal Camera",
offset: new THREE.Vector3(0, -3.5, 2.0),
desc: "Stabilized optical pod with 64MP Sony sensor, 8x digital zoom, and night-vision FLIR infrared.",
stats: { comp: "Gimbal Sensor", status: "4K 60FPS STREAM", therm: "35.0 °C", eff: "98.7%" }
};
modelGroup.add(gimbal);
s.subParts.push(gimbal);
setTelemetry({
badge: 'TACTICAL 3D TELEMETRY',
title: 'AUTONOMOUS SURVEILLANCE DRONE',
desc: 'Quad-rotor autonomous reconnaissance drone with 4K FLIR infrared camera, carbon composite arms, and obstac
le avoidance LiDAR.',
specs: [
{ label: 'AIRFRAME', val: 'Carbon Composite' },
{ label: 'FLIGHT TIME', val: '45 Mins Nominal', color: 'text-cyan-300' },
{ label: 'MOTORS', val: '4x Brushless 14k RPM', color: 'text-amber-300' },
{ label: 'STATUS', val: 'ARMED // AIRBORNE', color: 'text-emerald-400' },
],
});
// =========================================================================
// 4. CYBER SUPERCAR / AUTOMOBILE
// =========================================================================
} else if (modelKey === 'car') {
s.camera.position.set(0, 8, 24);
s.controls.target.set(0, 0, 0);
// Chassis Lower
const body = new THREE.Mesh(new THREE.BoxGeometry(7.5, 1.8, 16.0), chassisMat.clone());
body.userData = {
name: "Aerodynamic Cyber Chassis",
offset: new THREE.Vector3(0, 0, 0),
desc: "Low-drag carbon monocoque chassis with active underbody venturi tunnels and structural battery pack.",
stats: { comp: "Monocoque Chassis", status: "STRUCTURAL NOMINAL", therm: "27.5 °C", eff: "100%" }
};
modelGroup.add(body);
s.subParts.push(body);
// Cockpit Canopy (+Y offset)
const canopy = new THREE.Mesh(new THREE.BoxGeometry(5.8, 1.6, 7.5), glassMat.clone());
canopy.position.set(0, 1.6, -0.5);
canopy.userData = {
name: "Holographic Glass Canopy",
offset: new THREE.Vector3(0, 4.0, 0),
desc: "Electrochromic smart glass canopy with integrated HUD holographic flight instruments.",
stats: { comp: "Cockpit Canopy", status: "TINT ACTIVE", therm: "29.0 °C", eff: "99.5%" }
};
modelGroup.add(canopy);
s.subParts.push(canopy);
// 4 Wheels
const wheels = [
{ x: 4.2, z: 5.5, label: "Front-Right Wheel" },
{ x: -4.2, z: 5.5, label: "Front-Left Wheel" },
{ x: 4.2, z: -5.5, label: "Rear-Right Wheel" },
{ x: -4.2, z: -5.5, label: "Rear-Left Wheel" },
];
wheels.forEach((w) => {
const wheel = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 1.2, 24), socMat);
wheel.rotation.z = Math.PI / 2;
wheel.position.set(w.x, -0.4, w.z);
wheel.userData = {
name: w.label,
offset: new THREE.Vector3(w.x * 0.8, 0, w.z * 0.2),
desc: "Independent in-wheel electric motor delivering 350 Nm torque with regenerative carbon ceramic brakes.",
stats: { comp: w.label, status: "IN-WHEEL MOTOR 350Nm", therm: "36.2 °C", eff: "98.5%" }
};
modelGroup.add(wheel);
s.subParts.push(wheel);
});
setTelemetry({
badge: 'TACTICAL 3D TELEMETRY',
title: 'HYPER-ELECTRIC CYBERCAR',
desc: 'Dual-motor 1,200 HP electric supercar featuring active aero canopy, torque-vectoring in-wheel motors, and
regenerative braking.',
specs: [
{ label: 'DRIVETRAIN', val: 'Dual Motor 1,200 HP' },
{ label: '0-100 KM/H', val: '1.85 Seconds', color: 'text-amber-300' },
{ label: 'RANGE', val: '680 km (WLTP)', color: 'text-cyan-300' },
{ label: 'STATUS', val: 'SPORT MODE READY', color: 'text-emerald-400' },
],
});
// =========================================================================
// 5. CYBERNETIC NEURAL BRAIN
// =========================================================================
} else if (modelKey === 'brain') {
s.camera.position.set(0, 4, 18);
s.controls.target.set(0, 0, 0);
// Left Hemisphere
const leftHemi = new THREE.Mesh(new THREE.SphereGeometry(4.2, 32, 32), circuitMat.clone());
leftHemi.position.set(-2.2, 0, 0);
leftHemi.scale.set(1.0, 1.2, 1.4);
leftHemi.userData = {
name: "Left Cerebral Hemisphere (Logic/Analytical)",
offset: new THREE.Vector3(-4.0, 0, 0),
desc: "Neural network routing mathematical operations, symbolic code reasoning, and multi-threaded syntax compila
tion.",
stats: { comp: "Left Hemisphere", status: "SYNAPSE LOCKED", therm: "37.0 °C", eff: "99.9%" }
};
modelGroup.add(leftHemi);
s.subParts.push(leftHemi);
// Right Hemisphere
const rightHemi = new THREE.Mesh(new THREE.SphereGeometry(4.2, 32, 32), circuitMat.clone());
rightHemi.position.set(2.2, 0, 0);
rightHemi.scale.set(1.0, 1.2, 1.4);
rightHemi.userData = {
name: "Right Cerebral Hemisphere (Creative/Multimodal)",
offset: new THREE.Vector3(4.0, 0, 0),
desc: "Cognitive diffusion matrix processing visual telemetry, voice synthesis, and spontaneous pattern recogniti
on.",
stats: { comp: "Right Hemisphere", status: "DIFFUSION ACTIVE", therm: "37.2 °C", eff: "99.8%" }
};
modelGroup.add(rightHemi);
s.subParts.push(rightHemi);
// Cerebellum & Brainstem
const stem = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.8, 4.0, 16), chassisMat.clone());
stem.position.set(0, -3.8, -1.0);
stem.userData = {
name: "Brainstem & Motor Reflex Core",
offset: new THREE.Vector3(0, -3.5, 0),
desc: "Hardware IO bus managing physical mouse automation, background tasks, and real-time audio sample streamin
g.",
stats: { comp: "Brainstem Bus", status: "SUB-10MS LATENCY", therm: "34.0 °C", eff: "100%" }
};
modelGroup.add(stem);
s.subParts.push(stem);
setTelemetry({
badge: 'NEURAL 3D TELEMETRY',
title: 'CYBERNETIC NEURAL CORE',
desc: 'Bio-synthetic neural matrix with dual analytical/creative hemispheres and sub-10ms sensory brainstem bu
s.',
specs: [
{ label: 'COGNITION', val: 'Groq + Gemini Vision' },
{ label: 'SYNAPSE COUNT', val: '1.2 Trillion Synapses', color: 'text-purple-300' },
{ label: 'LATENCY', val: '12 ms Real-Time', color: 'text-emerald-400' },
{ label: 'STATUS', val: 'CONSCIOUS // NOMINAL', color: 'text-cyan-300' },
],
});
// =========================================================================
// 6. ARC REACTOR MK-VII
// =========================================================================
} else {
s.camera.position.set(0, 0, 16);
s.controls.target.set(0, 0, 0);
const coreCyl = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 0.6, 32), new THREE.MeshBasicMaterial({ color:
0x00f3ff }));
coreCyl.rotation.x = Math.PI / 2;
modelGroup.add(coreCyl);
const torus = new THREE.Mesh(new THREE.TorusGeometry(5.2, 0.45, 16, 48), chassisMat.clone());
modelGroup.add(torus);
for (let i = 0; i < 10; i++) {
const angle = (i / 10) * Math.PI * 2;
const coil = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.6), socMat);
coil.position.set(Math.cos(angle) * 5.2, Math.sin(angle) * 5.2, 0);
coil.rotation.z = angle;
modelGroup.add(coil);
}
setTelemetry({
badge: 'QUANTUM 3D TELEMETRY',
title: 'ARC REACTOR MK-VII',
desc: 'Zero-point quantum vacuum oscillation core delivering clean palladium energy matrix. Output stabilizes at
3.2 Gigawatts.',
specs: [
{ label: 'CORE MATRIX', val: 'MK-VII Palladium' },
{ label: 'POWER OUTPUT', val: '3.2 GW NOMINAL', color: 'text-cyan-300' },
{ label: 'PLASMA TEMP', val: '1200 K STABLE', color: 'text-amber-300' },
{ label: 'STATUS', val: '100% CLEAN ENERGY', color: 'text-emerald-400' },
],
});
}
};
// Switch Model helper
const loadModel = (key: string) => {
playSfx(1400, 0.08);
setModelQuery(key);
buildModel(key);
};
// Explode view slider
const handleExplodeSlider = (val: number) => {
setExplodeSliderVal(val);
const progress = val / 100;
const s = engineRef.current;
if (!s || !s.subParts) return;
s.subParts.forEach((part: any) => {
if (part.userData && part.userData.offset) {
const off = part.userData.offset;
part.position.x = off.x * progress;
part.position.y = (part.userData.baseY || 0) + off.y * progress;
part.position.z = off.z * progress;
}
});
};
// Explode toggle animation
const handleToggleExplode = () => {
playSfx(800, 0.25);
const targetVal = isExploded ? 0 : 100;
setIsExploded(!isExploded);
const startVal = explodeSliderVal;
const duration = 400;
const startTime = performance.now();
const step = (now: number) => {
const elapsed = now - startTime;
const p = Math.min(elapsed / duration, 1);
const ease = 0.5 - Math.cos(p * Math.PI) / 2;
const current = Math.round(startVal + (targetVal - startVal) * ease);
handleExplodeSlider(current);
if (p < 1) requestAnimationFrame(step);
};
requestAnimationFrame(step);
};
// Fly camera to planet
const handleFocusPlanet = (planetId: string) => {
playSfx(1600, 0.12);
setActivePlanetId(planetId);
const s = engineRef.current;
if (!s || !s.planets || !s.planets[planetId]) return;
const p = s.planets[planetId];
setTelemetry({
badge: 'CELESTIAL TELEMETRY',
title: p.data.name.toUpperCase(),
desc: p.data.desc,
specs: [
{ label: 'DIAMETER', val: p.data.diam },
{ label: 'MASS', val: p.data.mass },
{ label: 'SURFACE TEMP', val: p.data.temp, color: 'text-amber-300' },
{ label: 'ORBIT PERIOD', val: p.data.period, color: 'text-cyan-300' },
],
});
const worldPos = new (window as any).THREE.Vector3();
p.mesh.getWorldPosition(worldPos);
const targetCamDist = (p.data.r || 4) * 4.5 + 4;
const targetCamPos = new (window as any).THREE.Vector3(
worldPos.x + targetCamDist * 0.8,
worldPos.y + targetCamDist * 0.4,
worldPos.z + targetCamDist
);
const startPos = s.camera.position.clone();
const startTarget = s.controls.target.clone();
const duration = 700;
const startTime = performance.now();
const flyStep = (now: number) => {
const elapsed = now - startTime;
const prog = Math.min(elapsed / duration, 1);
const ease = 0.5 - Math.cos(prog * Math.PI) / 2;
s.camera.position.lerpVectors(startPos, targetCamPos, ease);
s.controls.target.lerpVectors(startTarget, worldPos, ease);
s.controls.update();
if (prog < 1) requestAnimationFrame(flyStep);
};
requestAnimationFrame(flyStep);
};
// Search input handler
const handleSearchSubmit = (e: React.FormEvent) => {
e.preventDefault();
if (!searchInput.trim()) return;
const term = searchInput.trim().toLowerCase();
playSfx(1500, 0.1);
if (term.includes('solar') || term.includes('planet')) loadModel('solarsystem');
else if (term.includes('drone') || term.includes('quad') || term.includes('copter')) loadModel('drone');
else if (term.includes('car') || term.includes('auto') || term.includes('supercar')) loadModel('car');
else if (term.includes('brain') || term.includes('neuro') || term.includes('mind')) loadModel('brain');
else if (term.includes('reactor') || term.includes('core')) loadModel('reactor');
else loadModel('phone');
setSearchInput('');
};
const handleToggleAutoRotate = () => {
playSfx(1100, 0.05);
const s = engineRef.current;
if (!s || !s.controls) return;
s.autoRotate = !s.autoRotate;
s.controls.autoRotate = s.autoRotate;
};
const handleToggleWireframe = () => {
playSfx(1100, 0.05);
const s = engineRef.current;
if (!s || !s.scene) return;
s.isWireframe = !s.isWireframe;
s.scene.traverse((obj: any) => {
if (obj.isMesh && obj.material && obj.material.wireframe !== undefined) {
obj.material.wireframe = s.isWireframe;
}
});
};
if (!isOpen) return null;
return (
<div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-xl animate-i
n fade-in duration-200">
{/* Background Holographic Glow Grid */}
<div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.15),tra
nsparent_70%)]" />
{/* Main Container */}
<div className="relative w-full max-w-6xl h-[90vh] max-h-[920px] rounded-2xl border border-cyan-500/40 bg-[#04081
4]/95 shadow-[0_0_50px_rgba(0,229,255,0.25)] flex flex-col overflow-hidden">
{/* Hologram Corner Brackets */}
<div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
<div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
<div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
<div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />
{/* Top Header Bar with Universal Search Input */}
<div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-cyan-500/20 bg-
[#071225]/90 gap-4">
<div className="flex items-center gap-3">
<span className="w-2.5 h-2.5 rounded-full bg-cyan-400 block animate-ping" />
<div>
<h2 className="text-xs sm:text-sm font-tech font-bold uppercase tracking-wider text-slate-100 flex items-ce
nter gap-2">
<span>J.A.R.V.I.S. UNIVERSAL 3D HOLOGRAM STAGE</span>
<span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cy
an-500/40">
WEBGL // GLTF
</span>
</h2>
</div>
</div>
{/* Universal Search Bar */}
<form onSubmit={handleSearchSubmit} className="flex-1 max-w-md hidden md:flex items-center gap-2 bg-slate-900/8
0 px-3 py-1.5 rounded-xl border border-cyan-500/30">
<Search className="w-4 h-4 text-cyan-400" />
<input
type="text"
value={searchInput}
onChange={(e) => setSearchInput(e.target.value)}
placeholder="Search or ask any 3D model (e.g. Phone, Drone, Car, Brain)..."
className="bg-transparent border-none text-xs font-mono text-cyan-300 outline-none w-full placeholder-slate
-500"
/>
</form>
<button
onClick={() => {
jarvisAudio.playClick();
onClose();
}}
className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/30 text-slate-400 hover:text-rose-300 border bo
rder-slate-700 transition-colors cursor-pointer"
title="Close Hologram Stage"
>
<X className="w-4 h-4" />
</button>
</div>
{/* Quick Model Selector Pills */}
<div className="flex-shrink-0 px-4 py-2 border-b border-slate-800 bg-[#060D1E] flex items-center gap-2 overflow-x
-auto no-scrollbar">
{[
{ id: 'phone', label: '📱 Smartphone Teardown', icon: Smartphone, color: 'text-cyan-300' },
{ id: 'solarsystem', label: '🌌 Solar System Matrix', icon: Orbit, color: 'text-amber-300' },
{ id: 'drone', label: '🛸 Tactical Drone', icon: Plane, color: 'text-purple-300' },
{ id: 'car', label: '🏎️ Hyper Cybercar', icon: Car, color: 'text-rose-400' },
{ id: 'brain', label: '🧠 Neural Brain Core', icon: Cpu, color: 'text-cyan-300' },
{ id: 'reactor', label: '⚡ Arc Reactor MK-VII', icon: Radio, color: 'text-cyan-300' },
].map((item) => {
const Icon = item.icon;
const isActive = modelQuery === item.id;
return (
<button
key={item.id}
onClick={() => loadModel(item.id)}
className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all w
hitespace-nowrap cursor-pointer ${
isActive
? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(0,229,255,0.3)]'
: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
}`}
>
<Icon className={`w-3.5 h-3.5 ${isActive ? item.color : 'text-slate-500'}`} />
<span>{item.label}</span>
</button>
);
})}
</div>
{/* Main 3D Viewport Area */}
<div className="flex-1 min-h-0 relative overflow-hidden bg-gradient-to-b from-[#02050E] via-[#040A1A] to-[#02050
E] flex flex-col">
{/* Top Floating Action Controls */}
<div className="absolute top-3 left-4 z-20 flex items-center gap-2 flex-wrap pointer-events-auto">
{modelQuery !== 'solarsystem' && modelQuery !== 'reactor' && (
<button
onClick={handleToggleExplode}
className="px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-30
0 text-xs font-mono font-bold backdrop-blur-md shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all cursor-pointer"
>
{isExploded ? '🛡️ ASSEMBLE MODEL' : '💥 EXPLODE TEARDOWN'}
</button>
)}
<button
onClick={handleToggleWireframe}
className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300
text-xs font-mono font-bold backdrop-blur-md transition-all cursor-pointer"
> 🕸️ WIREFRAME / SOLID
</button>
<button
onClick={handleToggleAutoRotate}
className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300
text-xs font-mono font-bold backdrop-blur-md transition-all cursor-pointer"
> 🔄 ROTATE TOGGLE
</button>
</div>
{/* Explode Slider for Models with parts */}
{modelQuery !== 'solarsystem' && modelQuery !== 'reactor' && (
<div className="absolute top-14 left-4 z-20 bg-slate-950/80 border border-cyan-500/30 p-2.5 rounded-xl backdr
op-blur-md w-60 space-y-1">
<div className="flex justify-between text-[10px] font-mono text-cyan-300">
<span>TEARDOWN EXPANSION</span>
<span className="font-bold">{explodeSliderVal}%</span>
</div>
<input
type="range"
min="0"
max="100"
value={explodeSliderVal}
onChange={(e) => handleExplodeSlider(Number(e.target.value))}
className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
/>
</div>
)}
{/* Right Telemetry Dossier Card */}
<div className="absolute top-3 right-4 z-20 hidden md:flex flex-col w-72 bg-slate-950/85 border border-cyan-50
0/30 p-4 rounded-xl backdrop-blur-md space-y-2 shadow-2xl">
<span className="text-[9px] font-mono text-cyan-400 tracking-wider uppercase">
{telemetry.badge}
</span>
<h3 className="text-sm font-tech font-bold text-slate-100">
{telemetry.title}
</h3>
<p className="text-[11px] font-sans text-slate-300 leading-relaxed">
{telemetry.desc}
</p>
<div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
{telemetry.specs.map((spec, idx) => (
<div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800">
<span className="text-[9px] font-mono text-slate-400 block">{spec.label}</span>
<span className={`text-xs font-mono font-bold ${spec.color || 'text-cyan-300'}`}>{spec.val}</span>
</div>
))}
</div>
</div>
{/* Bottom Planetary Selector (Only active in Solar System Mode) */}
{modelQuery === 'solarsystem' && (
<div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-slate-950/85 bo
rder border-cyan-500/40 p-2 rounded-2xl backdrop-blur-md max-w-[95vw] overflow-x-auto no-scrollbar">
{[
{ id: 'sun', label: '☀️ Sun' },
{ id: 'mercury', label: '☿ Mercury' },
{ id: 'venus', label: '♀ Venus' },
{ id: 'earth', label: '🌍 Earth' },
{ id: 'mars', label: '♂ Mars' },
{ id: 'jupiter', label: '♃ Jupiter' },
{ id: 'saturn', label: '♄ Saturn' },
{ id: 'uranus', label: '♅ Uranus' },
{ id: 'neptune', label: '♆ Neptune' },
].map((p) => (
<button
key={p.id}
onClick={() => handleFocusPlanet(p.id)}
className={`px-2.5 py-1 rounded-xl text-[10.5px] font-mono font-bold transition-all cursor-pointer whit
espace-nowrap ${
activePlanetId === p.id
? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_12px_rgba(255,170,0,0.5)]'
: 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
}`}
>
{p.label}
</button>
))}
</div>
)}
{/* 3D WebGL Canvas Mount */}
<div ref={mountRef} className="w-full h-full flex-1 cursor-grab active:cursor-grabbing" />
</div>
</div>
</div>
);
};