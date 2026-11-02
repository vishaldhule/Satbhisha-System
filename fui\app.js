/**
* app.js
* Main Controller for JARVIS Tactical Holographic FUI
* Manages WebSocket Bridge, Reactive Audio, Telemetry Graphs, and Command Transmission
* Built for Swayam Dhawale's JARVIS AI.
*/
document.addEventListener('DOMContentLoaded', () => {
// 1. Initialize Hologram Arc Reactor Engine
const reactor = new ArcReactorCanvas('arc-canvas');
// DOM Elements
const chatLogs = document.getElementById('chat-logs');
const cmdInput = document.getElementById('cmd-input');
const btnTransmit = document.getElementById('btn-transmit');
const btnSerious = document.getElementById('btn-serious');
const btn3DToggle = document.getElementById('btn-3d-toggle');
const btnAudioMute = document.getElementById('btn-audio-mute');
const bridgeStatus = document.getElementById('bridge-status');
const pingDisplay = document.getElementById('ping-display');
const missionTime = document.getElementById('mission-time');
const packetStream = document.getElementById('packet-stream');
// Telemetry Elements
const cpuVal = document.getElementById('cpu-val');
const cpuBar = document.getElementById('cpu-bar');
const ramVal = document.getElementById('ram-val');
const ramBar = document.getElementById('ram-bar');
const tempVal = document.getElementById('temp-val');
const tempBar = document.getElementById('temp-bar');
const batteryVal = document.getElementById('battery-val');
const batteryBar = document.getElementById('battery-bar');
const volumeSlider = document.getElementById('volume-slider');
const brightnessSlider = document.getElementById('brightness-slider');
const voiceStateBadge = document.getElementById('voice-state-badge');
// Audio Oscilloscope Canvas
const oscCanvas = document.getElementById('oscilloscope-canvas');
const oscCtx = oscCanvas ? oscCanvas.getContext('2d') : null;
let currentMode = 'normal';
let isConnected = false;
let ws = null;
let reconnectTimer = null;
let activeJarvisBubble = null;
let oscPhase = 0;
let currentAudioEnergy = 0;
// Real-Time Clock & Uptime
function updateTime() {
const now = new Date();
const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
if (missionTime) {
missionTime.textContent = `${timeStr} IST`;
}
requestAnimationFrame(updateTime);
}
updateTime();
// Packet Stream Generator (FUI Hex Cascade)
const hexChars = '0123456789ABCDEF';
function getRandomHex(len) {
let s = '0x';
for (let i = 0; i < len; i++) s += hexChars[Math.floor(Math.random() * 16)];
return s;
}
function appendPacketLine() {
if (!packetStream) return;
const protocols = ['SYNC_ACK', 'TELEMETRY_TX', 'NEURAL_PULSE', 'BUFFER_DRAIN', 'SYS_VITALS', 'DMA_BURST'];
const p = protocols[Math.floor(Math.random() * protocols.length)];
const hex1 = getRandomHex(6);
const hex2 = getRandomHex(4);
const line = document.createElement('div');
line.className = 'packet-line';
line.innerHTML = `<span class="dim">[${new Date().toISOString().substring(14, 23)}]</span> <span class="acc
ent">${p}</span> <span class="cyan">${hex1}</span> -> <span class="gold">${hex2}</span>`;
packetStream.appendChild(line);
if (packetStream.childNodes.length > 25) {
packetStream.removeChild(packetStream.firstChild);
}
packetStream.scrollTop = packetStream.scrollHeight;
}
setInterval(appendPacketLine, 450);
// Oscilloscope Animation Loop
function drawOscilloscope() {
if (!oscCtx || !oscCanvas) return;
const w = oscCanvas.width = oscCanvas.offsetWidth;
const h = oscCanvas.height = oscCanvas.offsetHeight;
oscCtx.clearRect(0, 0, w, h);
oscPhase += 0.08 + currentAudioEnergy * 0.2;
const color = currentMode === 'serious' ? '#FF1744' : '#00E5FF';
// Center Baseline
oscCtx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
oscCtx.lineWidth = 1;
oscCtx.beginPath();
oscCtx.moveTo(0, h / 2);
oscCtx.lineTo(w, h / 2);
oscCtx.stroke();
// Dynamic Waveform
oscCtx.beginPath();
const amp = (h * 0.35) * (0.1 + currentAudioEnergy * 0.9);
for (let x = 0; x < w; x++) {
const freq = 0.035;
const y = h / 2 + Math.sin(x * freq + oscPhase) * Math.cos(x * 0.015 - oscPhase * 0.5) * amp;
if (x === 0) oscCtx.moveTo(x, y);
else oscCtx.lineTo(x, y);
}
oscCtx.strokeStyle = color;
oscCtx.lineWidth = 2;
oscCtx.shadowColor = color;
oscCtx.shadowBlur = 8;
oscCtx.stroke();
requestAnimationFrame(drawOscilloscope);
}
drawOscilloscope();
// Logging and Chat Display
function appendLog(text, tag = 'system') {
if (!chatLogs) return;
activeJarvisBubble = null;
const item = document.createElement('div');
item.className = `log-entry log-${tag}`;
let prefix = 'SYS //';
if (tag === 'user_voice') prefix = 'YOU (VOICE) //';
else if (tag === 'user_text') prefix = 'YOU (CMD) //';
else if (tag === 'jarvis') prefix = 'JARVIS //';
else if (tag === 'tool') prefix = 'TOOL EXEC //';
const timestamp = new Date().toTimeString().split(' ')[0];
item.innerHTML = `
<span class="log-tag">[${timestamp}] ${prefix}</span>
<span class="log-text">${escapeHtml(text)}</span>
`;
chatLogs.appendChild(item);
chatLogs.scrollTop = chatLogs.scrollHeight;
if (window.jarvisAudio) window.jarvisAudio.playDataPacket();
}
function appendStreamToken(token, tag = 'jarvis_stream') {
if (!chatLogs) return;
if (!activeJarvisBubble) {
activeJarvisBubble = document.createElement('div');
activeJarvisBubble.className = 'log-entry log-jarvis';
const timestamp = new Date().toTimeString().split(' ')[0];
activeJarvisBubble.innerHTML = `
<span class="log-tag">[${timestamp}] JARVIS //</span>
<span class="log-text"></span>
`;
chatLogs.appendChild(activeJarvisBubble);
}
const textSpan = activeJarvisBubble.querySelector('.log-text');
if (textSpan) {
textSpan.textContent += token;
}
chatLogs.scrollTop = chatLogs.scrollHeight;
}
function escapeHtml(str) {
return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
// Set Serious Mode
function setSeriousMode(enabled, triggerByWs = false) {
if (enabled) {
currentMode = 'serious';
document.body.classList.add('serious-active');
if (reactor) reactor.setMode('serious');
if (btnSerious) {
btnSerious.innerHTML = '<span class="icon">⚠️</span> SERIOUS ACTIVE';
btnSerious.classList.add('active');
}
if (window.jarvisAudio) window.jarvisAudio.playAlert();
appendLog('TACTICAL SERIOUS MODE ENGAGED. HIGH COGNITIVE OVERRIDE ACTIVE.', 'system');
if (!triggerByWs) sendCommand('activate_serious');
} else {
currentMode = 'normal';
document.body.classList.remove('serious-active');
if (reactor) reactor.setMode('normal');
if (btnSerious) {
btnSerious.innerHTML = '<span class="icon">⚡</span> SERIOUS MODE';
btnSerious.classList.remove('active');
}
if (window.jarvisAudio) window.jarvisAudio.playPowerUp();
appendLog('TACTICAL SERIOUS MODE DISENGAGED. NOMINAL PROTOCOLS RESTORED.', 'system');
if (!triggerByWs) sendCommand('deactivate_serious');
}
}
// WebSocket Bridge Connection
function connectWebSocket() {
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsHost = window.location.host || '127.0.0.1:7777';
const wsUrl = `${wsProtocol}//${wsHost}/ws`;
if (bridgeStatus) {
bridgeStatus.textContent = 'CONNECTING TO BRIDGE...';
bridgeStatus.className = 'status-badge connecting';
}
try {
ws = new WebSocket(wsUrl);
ws.onopen = () => {
isConnected = true;
if (bridgeStatus) {
bridgeStatus.textContent = 'NEURAL BRIDGE ONLINE';
bridgeStatus.className = 'status-badge online';
}
if (pingDisplay) pingDisplay.textContent = '12ms';
if (window.jarvisAudio) window.jarvisAudio.playPowerUp();
appendLog('Neural bridge connected. Multimodal core synchronized.', 'system');
};
ws.onmessage = (event) => {
try {
const msg = JSON.parse(event.data);
handleBridgeMessage(msg);
} catch (e) {
console.error('WS Parse Error:', e);
}
};
ws.onclose = () => {
isConnected = false;
if (bridgeStatus) {
bridgeStatus.textContent = 'STANDALONE MODE';
bridgeStatus.className = 'status-badge offline';
}
if (pingDisplay) pingDisplay.textContent = 'OFFLINE';
clearTimeout(reconnectTimer);
reconnectTimer = setTimeout(connectWebSocket, 3000);
};
ws.onerror = () => {
ws.close();
};
} catch (e) {
clearTimeout(reconnectTimer);
reconnectTimer = setTimeout(connectWebSocket, 3000);
}
}
// Bridge Message Dispatcher
function handleBridgeMessage(msg) {
switch (msg.type) {
case 'log':
appendLog(msg.text, msg.tag);
break;
case 'token':
appendStreamToken(msg.token, msg.tag);
break;
case 'turn_complete':
activeJarvisBubble = null;
if (reactor) reactor.setAudioEnergy(0, 'idle');
currentAudioEnergy = 0;
break;
case 'barge_in':
activeJarvisBubble = null;
if (reactor) reactor.setAudioEnergy(0.8, 'user');
if (window.jarvisAudio) window.jarvisAudio.playBeep(1800, 0.08);
appendLog('⚡ LIVE BARGE-IN DETECTED: Speech interrupted. Priority given to user.', 'system');
break;
case 'audio_energy':
currentAudioEnergy = msg.energy;
if (reactor) reactor.setAudioEnergy(msg.energy, msg.speaker);
break;
case 'mode':
setSeriousMode(msg.mode === 'serious', true);
break;
case 'telemetry':
updateTelemetry(msg);
break;
case 'tool':
handleToolExecution(msg);
break;
case 'voice_state':
if (voiceStateBadge) {
voiceStateBadge.textContent = msg.text || 'HANDS-FREE';
voiceStateBadge.className = `voice-badge ${msg.state}`;
}
break;
}
}
// Update Telemetry Displays
function updateTelemetry(data) {
if (data.cpu !== undefined) {
if (cpuVal) cpuVal.textContent = `${Math.round(data.cpu)}%`;
if (cpuBar) cpuBar.style.width = `${Math.min(100, data.cpu)}%`;
}
if (data.ram !== undefined) {
if (ramVal) ramVal.textContent = `${Math.round(data.ram)}%`;
if (ramBar) ramBar.style.width = `${Math.min(100, data.ram)}%`;
}
if (data.temp !== undefined) {
if (tempVal) tempVal.textContent = `${Math.round(data.temp)}°C`;
if (tempBar) tempBar.style.width = `${Math.min(100, (data.temp / 100) * 100)}%`;
}
if (data.battery !== undefined) {
if (batteryVal) batteryVal.textContent = `${Math.round(data.battery)}%`;
if (batteryBar) batteryBar.style.width = `${Math.min(100, data.battery)}%`;
}
if (data.volume !== undefined && volumeSlider) {
volumeSlider.value = data.volume;
}
if (data.brightness !== undefined && brightnessSlider) {
brightnessSlider.value = data.brightness;
}
}
// Highlight Tool Badges in HUD
function handleToolExecution(toolData) {
appendLog(`[TOOL INVOKED] ${toolData.name} -> ${toolData.result || 'Running...'}`, 'tool');
const badge = document.querySelector(`[data-tool="${toolData.name}"]`);
if (badge) {
badge.classList.add('tool-active');
setTimeout(() => badge.classList.remove('tool-active'), 2500);
}
}
// Transmit Command
function sendUserInput(text) {
if (!text || !text.trim()) return;
const clean = text.trim();
appendLog(clean, 'user_text');
if (window.jarvisAudio) window.jarvisAudio.playTransmit();
if (isConnected && ws && ws.readyState === WebSocket.OPEN) {
ws.send(JSON.stringify({ type: 'input', text: clean }));
} else {
appendLog(`(Command recorded: "${clean}")`, 'system');
}
}
function sendCommand(action, payload = {}) {
if (isConnected && ws && ws.readyState === WebSocket.OPEN) {
ws.send(JSON.stringify({ type: 'command', action: action, payload: payload }));
}
}
// Event Listeners for Command Bar
if (btnTransmit && cmdInput) {
btnTransmit.addEventListener('click', () => {
sendUserInput(cmdInput.value);
cmdInput.value = '';
cmdInput.focus();
});
cmdInput.addEventListener('keydown', (e) => {
if (e.key === 'Enter') {
sendUserInput(cmdInput.value);
cmdInput.value = '';
}
}
)
;
}/
/
S
e
r
i
o
u
s
M
o
d
e
T
o
g
g
l
e
B
u
t
t
o
n
i
f
(
b
t
n
S
e
r
i
o
u
s
)
{
b
t
n
S
e
r
i
o
u
s
.
a
d
d
E
v
e
n
t
L
i
s
t
e
n
e
r
('c
l
i
c
k',
(
)
=
>
{
c
o
n
s
t
w
i
l
l
B
e
S
e
r
i
o
u
s
=
c
u
r
r
e
n
t
M
o
d
e !=
= 's
e
r
i
o
u
s';
s
e
t
S
e
r
i
o
u
s
M
o
d
e
(
w
i
l
l
B
e
S
e
r
i
o
u
s
)
;
}
)
;
}/
/
3
D
T
i
l
t
M
o
d
e
T
o
g
g
l
e
B
u
t
t
o
n
i
f
(
b
t
n
3
D
T
o
g
g
l
e
)
{
b
t
n
3
D
T
o
g
g
l
e
.
a
d
d
E
v
e
n
t
L
i
s
t
e
n
e
r
('c
l
i
c
k',
(
)
=
>
{
i
f
(
r
e
a
c
t
o
r
)
{
c
o
n
s
t
e
n
a
b
l
e
d
=
r
e
a
c
t
o
r
.
t
o
g
g
l
e
3
D
(
)
;
b
t
n
3
D
T
o
g
g
l
e
.
t
e
x
t
C
o
n
t
e
n
t
=
e
n
a
b
l
e
d
? '3
D
T
I
L
T
:
O
N' : '3
D
T
I
L
T
:
O
F
F';
b
t
n
3
D
T
o
g
g
l
e
.
c
l
a
s
s
L
i
s
t
.
t
o
g
g
l
e
('a
c
t
i
v
e',
e
n
a
b
l
e
d
)
;
}i
f
(
w
i
n
d
o
w
.
j
a
r
v
i
s
A
u
d
i
o
)
w
i
n
d
o
w
.
j
a
r
v
i
s
A
u
d
i
o
.
p
l
a
y
C
l
i
c
k
(
)
;
}
)
;
}/
/
S
o
u
n
d
F
X
M
u
t
e
T
o
g
g
l
e
B
u
t
t
o
n
i
f
(
b
t
n
A
u
d
i
o
M
u
t
e
)
{
b
t
n
A
u
d
i
o
M
u
t
e
.
a
d
d
E
v
e
n
t
L
i
s
t
e
n
e
r
('c
l
i
c
k',
(
)
=
>
{
i
f
(
w
i
n
d
o
w
.
j
a
r
v
i
s
A
u
d
i
o
)
{
c
o
n
s
t
m
u
t
e
d
=
w
i
n
d
o
w
.
j
a
r
v
i
s
A
u
d
i
o
.
t
o
g
g
l
e
M
u
t
e
(
)
;
b
t
n
A
u
d
i
o
M
u
t
e
.
t
e
x
t
C
o
n
t
e
n
t
=
m
u
t
e
d
? 'S
F
X
:
M
U
T
E
D' : 'S
F
X
:
O
N';
b
t
n
A
u
d
i
o
M
u
t
e
.
c
l
a
s
s
L
i
s
t
.
t
o
g
g
l
e
('m
u
t
e
d',
m
u
t
e
d
)
;
}
}
)
;
}/
/
Q
u
i
c
k
A
c
t
i
o
n
B
u
t
t
o
n
s
d
o
c
u
m
e
n
t
.
q
u
e
r
y
S
e
l
e
c
t
o
r
A
l
l
('.
q
u
i
c
k
-
b
t
n')
.
f
o
r
E
a
c
h
(
b
t
n
=
>
{
b
t
n
.
a
d
d
E
v
e
n
t
L
i
s
t
e
n
e
r
('c
l
i
c
k',
(
)
=
>
{
i
f
(
w
i
n
d
o
w
.
j
a
r
v
i
s
A
u
d
i
o
)
w
i
n
d
o
w
.
j
a
r
v
i
s
A
u
d
i
o
.
p
l
a
y
C
l
i
c
k
(
)
;
c
o
n
s
t
p
r
o
m
p
t
=
b
t
n
.
g
e
t
A
t
t
r
i
b
u
t
e
('d
a
t
a
-
p
r
o
m
p
t')
;
c
o
n
s
t
a
c
t
i
o
n
=
b
t
n
.
g
e
t
A
t
t
r
i
b
u
t
e
('d
a
t
a
-
a
c
t
i
o
n')
;
i
f
(
p
r
o
m
p
t
)
{
s
e
n
d
U
s
e
r
I
n
p
u
t
(
p
r
o
m
p
t
)
;
}
e
l
s
e
i
f
(
a
c
t
i
o
n
=
=
= 't
o
g
g
l
e
_
s
e
r
i
o
u
s')
{
s
e
t
S
e
r
i
o
u
s
M
o
d
e
(
c
u
r
r
e
n
t
M
o
d
e !=
= 's
e
r
i
o
u
s')
;
}
e
l
s
e
i
f
(
a
c
t
i
o
n
)
{
s
e
n
d
C
o
m
m
a
n
d
(
a
c
t
i
o
n
)
;
}
}
)
;
}
)
;
/
/
T
o
o
l
C
a
r
d
D
i
r
e
c
t
C
l
i
c
k
d
o
c
u
m
e
n
t
.
q
u
e
r
y
S
e
l
e
c
t
o
r
A
l
l
('.
t
o
o
l
-
b
a
d
g
e')
.
f
o
r
E
a
c
h
(
b
a
d
g
e
=
>
{
b
a
d
g
e
.
a
d
d
E
v
e
n
t
L
i
s
t
e
n
e
r
('c
l
i
c
k',
(
)
=
>
{
i
f
(
w
i
n
d
o
w
.
j
a
r
v
i
s
A
u
d
i
o
)
w
i
n
d
o
w
.
j
a
r
v
i
s
A
u
d
i
o
.
p
l
a
y
C
l
i
c
k
(
)
;
c
o
n
s
t
p
r
o
m
p
t
=
b
a
d
g
e
.
g
e
t
A
t
t
r
i
b
u
t
e
('d
a
t
a
-
p
r
o
m
p
t')
;
c
o
n
s
t
t
o
o
l
=
b
a
d
g
e
.
g
e
t
A
t
t
r
i
b
u
t
e
('d
a
t
a
-
t
o
o
l')
;
i
f
(
p
r
o
m
p
t
)
{
s
e
n
d
U
s
e
r
I
n
p
u
t
(
p
r
o
m
p
t
)
;
}
e
l
s
e
i
f
(
t
o
o
l
)
{
s
e
n
d
U
s
e
r
I
n
p
u
t
(
`
E
x
e
c
u
t
e
t
o
o
l
:
$
{
t
o
o
l
}
`
)
;
}
}
)
;
}
)
;
/
/
V
o
l
u
m
e
&
B
r
i
g
h
t
n
e
s
s
S
l
i
d
e
r
S
y
n
c
i
f
(
v
o
l
u
m
e
S
l
i
d
e
r
)
{
v
o
l
u
m
e
S
l
i
d
e
r
.
a
d
d
E
v
e
n
t
L
i
s
t
e
n
e
r
('c
h
a
n
g
e',
(
)
=
>
{
i
f
(
w
i
n
d
o
w
.
j
a
r
v
i
s
A
u
d
i
o
)
w
i
n
d
o
w
.
j
a
r
v
i
s
A
u
d
i
o
.
p
l
a
y
B
e
e
p
(
1
4
0
0
,
0
.
0
3
)
;
s
e
n
d
U
s
e
r
I
n
p
u
t
(
`
S
e
t
m
a
s
t
e
r
v
o
l
u
m
e
t
o
$
{
v
o
l
u
m
e
S
l
i
d
e
r
.
v
a
l
u
e
}
%
`
)
;
}
)
;
}
if (brightnessSlider) {
brightnessSlider.addEventListener('change', () => {
if (window.jarvisAudio) window.jarvisAudio.playBeep(1400, 0.03);
sendUserInput(`Set display brightness to ${brightnessSlider.value}%`);
});
}
// Standalone Simulation fallback
setInterval(() => {
if (!isConnected) {
const mockCpu = Math.floor(18 + Math.random() * 25);
const mockRam = Math.floor(40 + Math.random() * 8);
const mockTemp = Math.floor(45 + Math.random() * 8);
const mockBat = 96;
updateTelemetry({ cpu: mockCpu, ram: mockRam, temp: mockTemp, battery: mockBat });
}
}, 1800);
connectWebSocket();
});