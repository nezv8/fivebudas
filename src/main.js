import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';

const $ = (selector) => document.querySelector(selector);
const viewport = $('#viewport');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#08090d');
scene.fog = new THREE.FogExp2('#08090d', 0.014);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 160);
const homeCamera = new THREE.Vector3(10.8, 9.2, 13.5);
camera.position.copy(homeCamera);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.22;
viewport.prepend(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.minDistance = 5.2;
controls.maxDistance = 31;
controls.maxPolarAngle = Math.PI * 0.88;
controls.target.set(0, 0.15, 0);

scene.add(new THREE.AmbientLight('#b8a88c', 1.05));
const keyLight = new THREE.PointLight('#e8bd78', 190, 52);
keyLight.position.set(5, 8, 5);
scene.add(keyLight);
const fillLight = new THREE.PointLight('#4c9b9a', 92, 42);
fillLight.position.set(-7, -2, -6);
scene.add(fillLight);
const rimLight = new THREE.PointLight('#b96e43', 70, 36);
rimLight.position.set(0, 2, 8);
scene.add(rimLight);

const root = new THREE.Group();
scene.add(root);
const labelGroup = new THREE.Group();
root.add(labelGroup);

const palettes = {
  gold: { main: '#d9b16c', bright: '#ffe1a0', accent: '#b56c38', cool: '#68a9a2', red: '#b65b43', green: '#71906b' },
  jade: { main: '#72c6ad', bright: '#c5f5d5', accent: '#bc9857', cool: '#4c8fbd', red: '#b75d58', green: '#72a77c' },
  violet: { main: '#a98ce0', bright: '#e1d0ff', accent: '#d28a73', cool: '#5c9ec7', red: '#bb6b77', green: '#7ca58e' },
};
let colors = palettes.gold;

const standard = (color, metalness = 0.65, roughness = 0.36, emissive = '#000000', emissiveIntensity = 0) =>
  new THREE.MeshStandardMaterial({ color, metalness, roughness, emissive, emissiveIntensity });
const stone = standard('#262321', 0.28, 0.83);
const darkStone = standard('#17191d', 0.48, 0.74);
const gold = standard(colors.main, 0.78, 0.3, colors.main, 0.17);
const bright = standard(colors.bright, 0.65, 0.22, colors.main, 0.42);
const jade = standard(colors.cool, 0.58, 0.26, colors.cool, 0.58);
const accent = standard(colors.accent, 0.7, 0.31, colors.accent, 0.25);
const lineMaterial = (color = colors.main, opacity = 0.5) =>
  new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false });

function addTorus(parent, radius, tube, material, rotation = [Math.PI / 2, 0, 0], segments = 180) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 8, segments), material);
  mesh.rotation.set(...rotation);
  parent.add(mesh);
  return mesh;
}

function addLabel(text, position, size = 0.22, color = colors.bright, widthFactor = 5.2) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '600 39px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.position.set(...position);
  sprite.scale.set(size * widthFactor, size, 1);
  labelGroup.add(sprite);
  return sprite;
}

function addBox(parent, width, height, depth, material, position, bevel = false) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  parent.add(mesh);
  if (bevel) {
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), lineMaterial(colors.main, 0.42));
    edges.position.copy(mesh.position);
    parent.add(edges);
  }
  return mesh;
}

// Main circular foundation and the raised cross-shaped cosmogram.
const foundation = new THREE.Group();
root.add(foundation);
const disc = new THREE.Mesh(new THREE.CylinderGeometry(6.7, 6.95, 0.38, 96), darkStone);
disc.position.y = -0.72;
foundation.add(disc);
const discEdge = new THREE.Mesh(new THREE.TorusGeometry(6.62, 0.065, 10, 180), gold);
discEdge.rotation.x = Math.PI / 2;
discEdge.position.y = -0.48;
foundation.add(discEdge);
const discInner = addTorus(foundation, 5.9, 0.018, lineMaterial(colors.accent, 0.72));
discInner.position.y = -0.49;

// Cross arms, laid out on the X-Z plane. The four arms are equal and meet at one sacred center.
addBox(foundation, 2.95, 0.32, 11.7, stone, [0, -0.43, 0], true);
addBox(foundation, 11.7, 0.32, 2.95, stone, [0, -0.425, 0], true);
addBox(foundation, 3.42, 0.22, 3.42, gold, [0, -0.18, 0], true);

// Engraved border lines on both cross axes.
for (const offset of [-1.22, 1.22]) {
  const northSouth = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.018, 10.7), bright);
  northSouth.position.set(offset, -0.245, 0);
  foundation.add(northSouth);
  const eastWest = new THREE.Mesh(new THREE.BoxGeometry(10.7, 0.018, 0.035), bright);
  eastWest.position.set(0, -0.24, offset);
  foundation.add(eastWest);
}

// Stepped central platform.
const centralPlatform = new THREE.Group();
root.add(centralPlatform);
for (let level = 0; level < 5; level += 1) {
  const width = 3.05 - level * 0.43;
  const height = 0.2;
  const y = -0.28 + level * 0.2;
  addBox(centralPlatform, width, height, width, level % 2 ? gold : stone, [0, y, 0], true);
}

// Central sun / fire axis, built as layered geometry rather than a flat illustration.
const centerCore = new THREE.Group();
centerCore.position.y = 1.1;
root.add(centerCore);
const sunDisk = new THREE.Mesh(
  new THREE.CylinderGeometry(0.78, 0.88, 0.28, 12),
  new THREE.MeshPhysicalMaterial({ color: '#e7b45f', metalness: 0.58, roughness: 0.22, emissive: '#b96b2d', emissiveIntensity: 1.15 })
);
centerCore.add(sunDisk);
const sunSphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.48, 32, 24),
  new THREE.MeshPhysicalMaterial({ color: '#fff0ba', metalness: 0.12, roughness: 0.1, emissive: '#f3a644', emissiveIntensity: 1.5, transmission: 0.12 })
);
centerCore.add(sunSphere);
const sunHalo = addTorus(centerCore, 1.06, 0.035, bright);
const sunHalo2 = addTorus(centerCore, 1.34, 0.018, jade, [Math.PI / 2, 0.4, 0]);
const sunHalo3 = addTorus(centerCore, 1.56, 0.012, lineMaterial(colors.accent, 0.6), [0.2, 0.2, 0.1]);

// Rays around the sacred center.
const sunRays = new THREE.Group();
centerCore.add(sunRays);
for (let i = 0; i < 16; i += 1) {
  const angle = (i / 16) * Math.PI * 2;
  const ray = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.55, 5), i % 2 ? gold : bright);
  ray.position.set(Math.cos(angle) * 1.12, 0, Math.sin(angle) * 1.12);
  ray.rotation.z = Math.PI / 2;
  ray.rotation.y = -angle;
  sunRays.add(ray);
}

// Vertical world axis: upper sky, inhabited middle, and deep world represented as a layered cosmogram.
const worldAxis = new THREE.Group();
root.add(worldAxis);
const axisShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.11, 7.6, 12), bright);
axisShaft.position.y = 1.55;
worldAxis.add(axisShaft);
const axisRingTop = addTorus(worldAxis, 0.58, 0.022, jade);
axisRingTop.position.y = 4.95;
const axisRingBottom = addTorus(worldAxis, 0.58, 0.022, accent);
axisRingBottom.position.y = -1.85;
const skyGlobe = new THREE.Mesh(new THREE.SphereGeometry(0.78, 24, 18), new THREE.MeshBasicMaterial({ color: colors.cool, wireframe: true, transparent: true, opacity: 0.25 }));
skyGlobe.position.y = 4.95;
worldAxis.add(skyGlobe);
const deepGlobe = new THREE.Mesh(new THREE.SphereGeometry(0.74, 24, 18), new THREE.MeshBasicMaterial({ color: colors.accent, wireframe: true, transparent: true, opacity: 0.23 }));
deepGlobe.position.y = -1.85;
worldAxis.add(deepGlobe);
addLabel('BẦU TRỜI', [0, 6.05, 0], 0.17, colors.cool, 4.4);
addLabel('TÂM THIÊNG', [0, 2.05, 0], 0.17, colors.bright, 4.5);
addLabel('CÕI SÂU', [0, -2.8, 0], 0.16, colors.accent, 4.2);

// Four direction sanctuaries: East, South, West, North. Each has its own accent hue and layered gate.
const directions = [
  { key: 'east', name: 'ĐÔNG', english: 'EAST', position: [0, 0, -5.0], rotation: 0, color: '#d5a95f' },
  { key: 'south', name: 'NAM', english: 'SOUTH', position: [5.0, 0, 0], rotation: Math.PI / 2, color: '#b65b43' },
  { key: 'west', name: 'TÂY', english: 'WEST', position: [0, 0, 5.0], rotation: Math.PI, color: '#6a9b82' },
  { key: 'north', name: 'BẮC', english: 'NORTH', position: [-5.0, 0, 0], rotation: -Math.PI / 2, color: '#5c9eae' },
];
const directionNodes = [];
for (const direction of directions) {
  const altar = new THREE.Group();
  altar.position.set(...direction.position);
  altar.rotation.y = direction.rotation;
  root.add(altar);
  const accentMaterial = standard(direction.color, 0.6, 0.3, direction.color, 0.45);
  addBox(altar, 2.35, 0.22, 2.2, darkStone, [0, -0.2, 0], true);
  addBox(altar, 1.8, 0.14, 1.7, accentMaterial, [0, -0.03, 0], true);
  for (let pillarIndex = 0; pillarIndex < 2; pillarIndex += 1) {
    const x = pillarIndex === 0 ? -0.68 : 0.68;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.18, 0.92, 7), gold);
    pillar.position.set(x, 0.43, -0.38);
    altar.add(pillar);
    const capital = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.13, 7), accentMaterial);
    capital.position.set(x, 0.95, -0.38);
    altar.add(capital);
  }
  const altarGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 1), new THREE.MeshStandardMaterial({ color: direction.color, metalness: 0.4, roughness: 0.2, emissive: direction.color, emissiveIntensity: 0.9 }));
  altarGem.position.set(0, 0.45, 0.32);
  altar.add(altarGem);
  const halo = addTorus(altar, 0.61, 0.025, new THREE.MeshBasicMaterial({ color: direction.color, transparent: true, opacity: 0.65 }));
  halo.position.y = 0.42;
  const gate = new THREE.Group();
  gate.position.set(0, 0.1, -0.88);
  altar.add(gate);
  const gateLeft = new THREE.Mesh(new THREE.BoxGeometry(0.11, 1.75, 0.13), gold);
  gateLeft.position.x = -0.62;
  const gateRight = gateLeft.clone();
  gateRight.position.x = 0.62;
  const gateTop = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.13, 0.13), accentMaterial);
  gateTop.position.y = 0.87;
  gate.add(gateLeft, gateRight, gateTop);
  const node = new THREE.Group();
  node.position.set(0, 0.12, 0.32);
  altar.add(node);
  const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10), new THREE.MeshBasicMaterial({ color: '#fff4cf' }));
  pulse.position.y = 0.6;
  node.add(pulse);
  directionNodes.push({ group: altar, gem: altarGem, halo, node, direction, accentMaterial, pulse });
  addLabel(`${direction.name} · ${direction.english}`, [direction.position[0] * 1.08, 1.6, direction.position[2] * 1.08], 0.19, direction.color, 4.5);
}

// Calendar rings: 13 numbered beats and 20 day-sign markers, orbiting the central cosmogram.
const calendarGroup = new THREE.Group();
root.add(calendarGroup);
for (let ringIndex = 0; ringIndex < 4; ringIndex += 1) {
  const radius = 2.55 + ringIndex * 0.62;
  const ring = addTorus(calendarGroup, radius, ringIndex === 0 ? 0.027 : 0.013, ringIndex % 2 ? jade : gold);
  ring.rotation.x = Math.PI / 2;
  ring.userData.spin = ringIndex % 2 ? -0.035 : 0.045;
}
const dayGlyphs = [];
for (let i = 0; i < 20; i += 1) {
  const angle = (i / 20) * Math.PI * 2;
  const radius = 4.95;
  const glyph = new THREE.Group();
  glyph.position.set(Math.cos(angle) * radius, -0.05, Math.sin(angle) * radius);
  glyph.rotation.y = -angle;
  calendarGroup.add(glyph);
  const markerMaterial = i % 5 === 0 ? bright : (i % 2 ? gold : jade);
  const marker = new THREE.Mesh(new THREE.OctahedronGeometry(0.13, 0), markerMaterial);
  glyph.add(marker);
  const orbit = addTorus(glyph, 0.2, 0.012, lineMaterial(i % 2 ? colors.main : colors.cool, 0.55));
  dayGlyphs.push({ glyph, marker, orbit });
}
const numberMarkers = [];
for (let i = 0; i < 13; i += 1) {
  const angle = (i / 13) * Math.PI * 2;
  const marker = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.28, 4), i % 3 ? gold : bright);
  marker.position.set(Math.cos(angle) * 3.7, 0.13, Math.sin(angle) * 3.7);
  marker.rotation.z = Math.PI;
  marker.rotation.y = -angle;
  calendarGroup.add(marker);
  numberMarkers.push(marker);
}
addLabel('TONALPOHUALLI · 260 NGÀY', [0, 0.05, 6.15], 0.16, colors.bright, 6.1);

// Pairwise correlation paths and moving dots: a restrained visual metaphor for entanglement.
const correlationGroup = new THREE.Group();
root.add(correlationGroup);
const correlationPaths = [];
function makeCorrelationPath(start, end, color) {
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...start),
    new THREE.Vector3(0, 2.25, 0),
    new THREE.Vector3(...end),
  );
  const points = curve.getPoints(90);
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), lineMaterial(color, 0.18));
  correlationGroup.add(line);
  const beadMaterial = new THREE.MeshBasicMaterial({ color: '#fff0be' });
  const beadA = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 12), beadMaterial);
  const beadB = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 10), new THREE.MeshBasicMaterial({ color }));
  correlationGroup.add(beadA, beadB);
  correlationPaths.push({ curve, line, beadA, beadB, phase: Math.random() * Math.PI * 2 });
}
makeCorrelationPath([0, 0.48, -5.0], [0, 0.48, 5.0], colors.cool);
makeCorrelationPath([5.0, 0.48, 0], [-5.0, 0.48, 0], colors.accent);
addLabel('TƯƠNG QUAN XA · MINH HỌA', [0, 3.2, 6.1], 0.13, colors.cool, 6.4);

// Layered translucent holographic planes and point-cloud echo around the central axis.
const hologramGroup = new THREE.Group();
root.add(hologramGroup);
const hologramMaterials = [
  new THREE.MeshBasicMaterial({ color: colors.cool, transparent: true, opacity: 0.095, side: THREE.DoubleSide, depthWrite: false, wireframe: true }),
  new THREE.MeshBasicMaterial({ color: colors.bright, transparent: true, opacity: 0.075, side: THREE.DoubleSide, depthWrite: false, wireframe: true }),
  new THREE.MeshBasicMaterial({ color: colors.accent, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false, wireframe: true }),
];
const holoSheets = [];
for (let i = 0; i < 3; i += 1) {
  const geometry = new THREE.PlaneGeometry(8.6 - i * 1.35, 8.6 - i * 1.35, 12, 12);
  const plane = new THREE.Mesh(geometry, hologramMaterials[i]);
  plane.rotation.x = -Math.PI / 2 + (i - 1) * 0.12;
  plane.rotation.z = (i - 1) * 0.13;
  plane.position.y = 1.9 + i * 0.58;
  hologramGroup.add(plane);
  holoSheets.push(plane);
}
const holoOrbit1 = addTorus(hologramGroup, 3.5, 0.012, lineMaterial(colors.cool, 0.34), [0.18, 0.1, 0.1]);
holoOrbit1.position.y = 2.4;
const holoOrbit2 = addTorus(hologramGroup, 4.3, 0.01, lineMaterial(colors.bright, 0.24), [0.55, 0.2, 0.15]);
holoOrbit2.position.y = 3.15;

// A compact, animated star field and local dust cloud.
const starCount = 1550;
const starPositions = new Float32Array(starCount * 3);
const starColors = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i += 1) {
  const radius = THREE.MathUtils.randFloat(10, 58);
  const angle = Math.random() * Math.PI * 2;
  starPositions[i * 3] = Math.cos(angle) * radius;
  starPositions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(30);
  starPositions[i * 3 + 2] = Math.sin(angle) * radius;
  const color = new THREE.Color(i % 11 === 0 ? colors.main : '#aaa9b0');
  starColors.set([color.r, color.g, color.b], i * 3);
}
const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ size: 0.055, vertexColors: true, transparent: true, opacity: 0.72, sizeAttenuation: true }));
scene.add(stars);

const dustCount = 760;
const dustPositions = new Float32Array(dustCount * 3);
const dustPhase = new Float32Array(dustCount);
for (let i = 0; i < dustCount; i += 1) {
  const angle = Math.random() * Math.PI * 2;
  const radius = THREE.MathUtils.randFloat(2.4, 8.3);
  dustPositions[i * 3] = Math.cos(angle) * radius;
  dustPositions[i * 3 + 1] = THREE.MathUtils.randFloat(-2.2, 4.8);
  dustPositions[i * 3 + 2] = Math.sin(angle) * radius;
  dustPhase[i] = Math.random() * Math.PI * 2;
}
const dustGeometry = new THREE.BufferGeometry();
dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
const dustField = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: colors.bright, size: 0.034, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending, depthWrite: false }));
scene.add(dustField);

// Decorative wave mesh below the cosmogram.
const waveGeometry = new THREE.PlaneGeometry(18, 18, 74, 74);
waveGeometry.rotateX(-Math.PI / 2);
const waveMaterial = new THREE.MeshBasicMaterial({ color: colors.cool, wireframe: true, transparent: true, opacity: 0.11 });
const waveMesh = new THREE.Mesh(waveGeometry, waveMaterial);
waveMesh.position.y = -1.08;
scene.add(waveMesh);
const waveBase = waveGeometry.attributes.position.array.slice();

const lattice = new THREE.Group();
scene.add(lattice);
for (let row = -6; row <= 6; row += 1) {
  const pointsA = [];
  const pointsB = [];
  for (let col = -12; col <= 12; col += 1) {
    pointsA.push(new THREE.Vector3(col * 0.9, -1.0, row * 0.9));
    pointsB.push(new THREE.Vector3(row * 0.9, -1.0, col * 0.9));
  }
  lattice.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pointsA), lineMaterial(colors.cool, 0.075)));
  lattice.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pointsB), lineMaterial(colors.cool, 0.075)));
}

// The viewport's interactive narrative: content is revealed as a 3D focus layer, not a static sidebar essay.
const focusContent = {
  center: {
    kicker: 'TRỤC THẾ GIỚI · 01',
    title: 'Tâm thiêng và trục vũ trụ',
    text: 'Bốn miền phương hướng quy tụ quanh một tâm thiêng. Trục đứng nối các lớp bầu trời, cõi người và cõi sâu trong bố cục vũ trụ học.',
    camera: [10.8, 9.2, 13.5],
  },
  directions: {
    kicker: 'KHÔNG GIAN · 02',
    title: 'Bốn phương của thế giới',
    text: 'Bốn cổng gặp nhau tại tâm. Theo bố cục của Codex, Đông ở phía trên, Tây phía dưới, Bắc bên trái và Nam bên phải khi nhìn từ trên xuống.',
    camera: [12.5, 6.2, 2.2],
  },
  calendar: {
    kicker: 'THỜI GIAN · 03',
    title: 'Vòng lịch pháp 260 ngày',
    text: 'Vòng trong hiển thị 13 nhịp số; vòng ngoài có 20 dấu ngày. Đây là cách diễn giải trực quan chu kỳ tonalpohualli gồm 13 × 20 ngày.',
    camera: [0.2, 14.5, 0.1],
  },
  entanglement: {
    kicker: 'ĐỐI CHIẾU KHOA HỌC · 04',
    title: 'Vướng víu và tương quan xa',
    text: 'Các đường sáng nối những cặp điểm đối diện gợi hình ảnh tương quan lượng tử phi cổ điển. Chúng không biểu thị tín hiệu truyền tức thời hay liên lạc nhanh hơn ánh sáng.',
    camera: [11, 5.5, 10],
  },
  hologram: {
    kicker: 'ĐỐI CHIẾU Ý NIỆM · 05',
    title: 'Trật tự hàm ẩn và phép tương tự toàn ảnh',
    text: 'Những lớp lưới bán trong suốt gợi phép tương tự hologram David Bohm dùng khi bàn về quan hệ phần – toàn thể. Đây là mô hình ý niệm, không phải bằng chứng vũ trụ là một hologram.',
    camera: [8.5, 10.5, 8.5],
  },
};
let activeFocus = 'center';
let autoRotate = true;
let showLabels = true;
let rotationSpeed = 0.35;
let particleDensity = 0.65;
let glow = 0.7;
let elapsed = 0;
let lastFrame = performance.now();
let frameCount = 0;
let fpsStart = lastFrame;

function selectFocus(key) {
  const data = focusContent[key];
  if (!data) return;
  activeFocus = key;
  $('#focusKicker').textContent = data.kicker;
  $('#focusTitle').textContent = data.title;
  $('#focusDescription').textContent = data.text;
  document.querySelectorAll('.geometry').forEach((button) => {
    const active = button.dataset.focus === key;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  camera.position.set(...data.camera);
  controls.target.set(0, 0.2, 0);
  controls.update();
  correlationGroup.visible = key === 'entanglement' || key === 'center' || key === 'directions';
  calendarGroup.visible = key !== 'hologram';
  hologramGroup.visible = key === 'hologram' || $('#holoLayer').checked;
  correlationPaths.forEach((path) => {
    path.line.material.opacity = key === 'entanglement' ? 0.58 : 0.18;
  });
}

document.querySelectorAll('.geometry').forEach((button) => {
  button.addEventListener('click', () => selectFocus(button.dataset.focus));
});

// Give the major 3D layers focus keys so the user can select them by clicking the model itself.
function tagFocus(group, key) {
  group.traverse((object) => {
    if (object.isMesh || object.isLine || object.isSprite) object.userData.focusKey = key;
  });
}
tagFocus(foundation, 'directions');
tagFocus(centralPlatform, 'center');
tagFocus(centerCore, 'center');
tagFocus(worldAxis, 'center');
tagFocus(calendarGroup, 'calendar');
tagFocus(correlationGroup, 'entanglement');
tagFocus(hologramGroup, 'hologram');
directionNodes.forEach((item) => tagFocus(item.group, 'directions'));

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerStart = null;
renderer.domElement.addEventListener('pointerdown', (event) => {
  pointerStart = { x: event.clientX, y: event.clientY };
});
renderer.domElement.addEventListener('pointerup', (event) => {
  if (!pointerStart) return;
  const moved = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
  pointerStart = null;
  if (moved > 6) return; // Ignore camera drags; respond only to a deliberate tap/click.
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(root.children, true).find((item) => {
    let object = item.object;
    while (object && !object.userData.focusKey) object = object.parent;
    return Boolean(object?.userData.focusKey);
  });
  if (hit) {
    let object = hit.object;
    while (object && !object.userData.focusKey) object = object.parent;
    if (object?.userData.focusKey) selectFocus(object.userData.focusKey);
  }
});

function recolor(name) {
  colors = palettes[name];
  gold.color.set(colors.main); gold.emissive.set(colors.main);
  bright.color.set(colors.bright); bright.emissive.set(colors.main);
  jade.color.set(colors.cool); jade.emissive.set(colors.cool);
  accent.color.set(colors.accent); accent.emissive.set(colors.accent);
  keyLight.color.set(colors.main);
  fillLight.color.set(colors.cool);
  rimLight.color.set(colors.accent);
  waveMaterial.color.set(colors.cool);
  dustField.material.color.set(colors.bright);
  hologramMaterials[0].color.set(colors.cool);
  hologramMaterials[1].color.set(colors.bright);
  hologramMaterials[2].color.set(colors.accent);
  holoOrbit1.material.color.set(colors.cool);
  holoOrbit2.material.color.set(colors.bright);
  correlationPaths.forEach((path, index) => path.line.material.color.set(index ? colors.accent : colors.cool));
  lattice.children.forEach((line) => line.material.color.set(colors.cool));
  document.querySelectorAll('.swatch').forEach((swatch) => swatch.classList.toggle('active', swatch.dataset.palette === name));
}
document.querySelectorAll('.swatch').forEach((button) => button.addEventListener('click', () => recolor(button.dataset.palette)));

$('#autoRotate').addEventListener('click', () => {
  autoRotate = !autoRotate;
  $('#autoRotate').classList.toggle('active', autoRotate);
  $('#autoRotate').setAttribute('aria-pressed', String(autoRotate));
});
$('#resetCamera').addEventListener('click', () => {
  camera.position.copy(homeCamera);
  controls.target.set(0, 0.15, 0);
  controls.update();
  root.rotation.set(0, 0, 0);
});
$('#toggleLabels').addEventListener('click', () => {
  showLabels = !showLabels;
  labelGroup.visible = showLabels;
  $('#toggleLabels').classList.toggle('active', showLabels);
  $('#toggleLabels').setAttribute('aria-pressed', String(showLabels));
});
$('#rotation').addEventListener('input', (event) => {
  rotationSpeed = Number(event.target.value);
  $('#rotationVal').textContent = `${rotationSpeed.toFixed(2)}×`;
});
$('#particles').addEventListener('input', (event) => {
  particleDensity = Number(event.target.value) / 100;
  $('#particlesVal').textContent = `${event.target.value}%`;
  dustField.material.size = 0.02 + particleDensity * 0.025;
});
$('#glow').addEventListener('input', (event) => {
  glow = Number(event.target.value) / 100;
  $('#glowVal').textContent = `${event.target.value}%`;
});
$('#waves').addEventListener('change', (event) => { waveMesh.visible = event.target.checked; });
$('#starDust').addEventListener('change', (event) => { dustField.visible = event.target.checked; });
$('#lattice').addEventListener('change', (event) => { lattice.visible = event.target.checked; });
$('#holoLayer').addEventListener('change', (event) => {
  hologramGroup.visible = event.target.checked || activeFocus === 'hologram';
});

function resize() {
  const width = Math.max(1, viewport.clientWidth);
  const height = Math.max(1, viewport.clientHeight);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
  const fxCanvas = $('#fxCanvas');
  const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
  fxCanvas.width = Math.floor(width * ratio);
  fxCanvas.height = Math.floor(height * ratio);
  fxCanvas.style.width = `${width}px`;
  fxCanvas.style.height = `${height}px`;
}
new ResizeObserver(resize).observe(viewport);
resize();

function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min((now - lastFrame) / 1000, 0.05);
  lastFrame = now;
  elapsed += dt;
  frameCount += 1;
  if (now - fpsStart > 1000) {
    $('#fps').textContent = `${Math.round((frameCount * 1000) / (now - fpsStart))} FPS`;
    frameCount = 0;
    fpsStart = now;
  }

  if (autoRotate) {
    root.rotation.y += dt * rotationSpeed * 0.115;
    stars.rotation.y -= dt * 0.0025;
  }
  centerCore.rotation.y += dt * 0.16;
  sunSphere.scale.setScalar(1 + Math.sin(elapsed * 1.7) * 0.025);
  sunHalo.rotation.z += dt * 0.18;
  sunHalo2.rotation.x += dt * 0.1;
  sunHalo3.rotation.z -= dt * 0.07;
  sunRays.rotation.y -= dt * 0.045;
  worldAxis.rotation.y += dt * 0.035;
  skyGlobe.rotation.y += dt * 0.11;
  deepGlobe.rotation.y -= dt * 0.08;
  calendarGroup.children.forEach((child) => {
    if (child.userData.spin) child.rotation.y += dt * child.userData.spin;
  });
  dayGlyphs.forEach((item, index) => {
    item.orbit.rotation.z += dt * (index % 2 ? 0.15 : -0.12);
    item.marker.scale.setScalar(1 + Math.sin(elapsed * 1.5 + index) * 0.06);
  });
  directionNodes.forEach((item, index) => {
    const pulse = 1 + Math.sin(elapsed * 1.8 + index * 0.9) * 0.08;
    item.gem.scale.setScalar(pulse);
    item.halo.rotation.z += dt * 0.3;
    item.node.position.y = 0.12 + Math.sin(elapsed * 1.4 + index) * 0.07;
  });
  correlationPaths.forEach((path) => {
    const phase = (elapsed * 0.16 + path.phase / (Math.PI * 2)) % 1;
    path.beadA.position.copy(path.curve.getPoint(phase));
    path.beadB.position.copy(path.curve.getPoint((phase + 0.5) % 1));
    path.beadA.scale.setScalar(0.85 + Math.sin(elapsed * 2.2 + path.phase) * 0.2);
  });
  holoSheets.forEach((plane, index) => {
    plane.rotation.z += dt * (index - 1) * 0.012;
    plane.position.y += Math.sin(elapsed * 0.65 + index) * 0.0009;
  });
  holoOrbit1.rotation.y += dt * 0.045;
  holoOrbit2.rotation.x -= dt * 0.032;

  const dust = dustGeometry.attributes.position.array;
  for (let i = 0; i < dustCount; i += 1) {
    const offset = i * 3;
    const phase = dustPhase[i];
    dust[offset + 1] += Math.sin(elapsed * 1.1 + phase) * 0.0018;
    dust[offset] += Math.sin(elapsed * 0.28 + phase) * 0.0007;
  }
  dustGeometry.attributes.position.needsUpdate = true;
  dustField.material.opacity = particleDensity;
  waveMaterial.opacity = 0.045 + glow * 0.12;
  const waveVertices = waveGeometry.attributes.position.array;
  for (let i = 0; i < waveVertices.length; i += 3) {
    const x = waveBase[i];
    const z = waveBase[i + 2];
    waveVertices[i + 1] = waveBase[i + 1] + (Math.sin(x * 1.2 + elapsed * 0.9) + Math.cos(z * 1.15 - elapsed * 0.7)) * 0.055;
  }
  waveGeometry.attributes.position.needsUpdate = true;
  bright.emissiveIntensity = 0.12 + glow * 0.72;
  gold.emissiveIntensity = 0.04 + glow * 0.2;
  keyLight.intensity = 100 + glow * 130;
  fillLight.intensity = 45 + glow * 65;
  controls.update();
  renderer.render(scene, camera);
  $('#cameraReadout').textContent = `QUỸ ĐẠO / ${String((Math.round(THREE.MathUtils.radToDeg(root.rotation.y) % 360 + 360) % 360)).padStart(3, '0')}°`;
  $('#energyReadout').textContent = `${(70 + Math.sin(elapsed * 0.7) * 8 + glow * 5).toFixed(1)}%`;
  $('#fxCanvas').style.opacity = String(0.2 + glow * 0.75);
}
requestAnimationFrame(animate);
$('#loading').remove();
selectFocus('center');

// Background MP3 player. GitHub Pages is static, so tracks are read from playlist.json.
const audioPlayer = $('#audioPlayer');
const musicToggle = $('#musicToggle');
const musicPrev = $('#musicPrev');
const musicNext = $('#musicNext');
const musicProgress = $('#musicProgress');
const musicVolume = $('#musicVolume');
let musicTracks = [];
let currentTrack = 0;
let isSeeking = false;
const basePath = import.meta.env.BASE_URL;
const playlistUrl = new URL(`${basePath}mp3/playlist.json`, window.location.origin);
const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
};
function setMusicStatus(message, state = '') {
  $('#musicStatus').textContent = message;
  $('#musicStatus').dataset.state = state;
}
function updateMusicButtons() {
  const hasTracks = musicTracks.length > 0;
  [musicToggle, musicPrev, musicNext].forEach((button) => { button.disabled = !hasTracks; });
  musicProgress.disabled = !hasTracks;
  musicToggle.textContent = audioPlayer.paused ? '▶ PHÁT NHẠC' : 'Ⅱ TẠM DỪNG';
  musicToggle.setAttribute('aria-label', audioPlayer.paused ? 'Phát nhạc' : 'Tạm dừng nhạc');
  musicToggle.setAttribute('aria-pressed', String(!audioPlayer.paused));
}
function loadTrack(index, autoplay = false) {
  if (!musicTracks.length) return;
  currentTrack = (index + musicTracks.length) % musicTracks.length;
  const track = musicTracks[currentTrack];
  const filename = String(track.file || '').trim();
  if (!filename || filename.includes('/') || filename.includes('\\') || filename.startsWith('.')) {
    setMusicStatus('TÊN FILE KHÔNG HỢP LỆ', 'error');
    return;
  }
  audioPlayer.src = new URL(`${basePath}mp3/${encodeURIComponent(filename)}`, window.location.origin).href;
  audioPlayer.load();
  $('#musicTrackTitle').textContent = track.title || filename.replace(/\.mp3$/i, '');
  $('#musicCurrentTime').textContent = '0:00';
  $('#musicDuration').textContent = '0:00';
  musicProgress.value = '0';
  if (autoplay) playMusic();
  else setMusicStatus('ĐÃ NẠP BÀI HÁT', 'ready');
}
async function playMusic() {
  if (!musicTracks.length) return;
  try {
    await audioPlayer.play();
    setMusicStatus('ĐANG PHÁT', 'playing');
  } catch {
    setMusicStatus('CHỜ BẠN NHẤN PHÁT', 'blocked');
    $('#musicHint').textContent = 'Tự phát có thể bị trình duyệt chặn. Nhấn “Phát nhạc” hoặc chạm/click vào vùng mô phỏng để bắt đầu.';
  }
  updateMusicButtons();
}
function pauseMusic() {
  audioPlayer.pause();
  setMusicStatus('ĐANG TẠM DỪNG', 'paused');
  updateMusicButtons();
}
async function initMusic() {
  try {
    const response = await fetch(playlistUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Playlist HTTP ${response.status}`);
    const manifest = await response.json();
    musicTracks = (Array.isArray(manifest.tracks) ? manifest.tracks : []).filter((track) =>
      track && typeof track.file === 'string' && track.file.trim() &&
      !track.file.includes('/') && !track.file.includes('\\') && !track.file.startsWith('.'));
    if (!musicTracks.length) {
      $('#musicTrackTitle').textContent = 'Chưa có MP3 trong thư viện';
      $('#musicHint').innerHTML = 'Tải MP3 vào <code>public/mp3/</code>, sau đó thêm tên file vào <code>playlist.json</code>.';
      setMusicStatus('CHƯA CÓ NHẠC', 'empty');
      updateMusicButtons();
      return;
    }
    audioPlayer.volume = Number(musicVolume.value);
    loadTrack(0, true);
    updateMusicButtons();
  } catch (error) {
    console.warn('Music playlist unavailable:', error);
    $('#musicTrackTitle').textContent = 'Không đọc được danh sách nhạc';
    $('#musicHint').textContent = 'Kiểm tra public/mp3/playlist.json rồi tải lại trang.';
    setMusicStatus('LỖI PLAYLIST', 'error');
    updateMusicButtons();
  }
}
musicToggle.addEventListener('click', () => audioPlayer.paused ? playMusic() : pauseMusic());
musicPrev.addEventListener('click', () => loadTrack(currentTrack - 1, true));
musicNext.addEventListener('click', () => loadTrack(currentTrack + 1, true));
musicVolume.addEventListener('input', () => { audioPlayer.volume = Number(musicVolume.value); });
musicProgress.addEventListener('input', () => {
  isSeeking = true;
  if (Number.isFinite(audioPlayer.duration)) audioPlayer.currentTime = (Number(musicProgress.value) / 1000) * audioPlayer.duration;
  isSeeking = false;
});
audioPlayer.addEventListener('timeupdate', () => {
  if (!Number.isFinite(audioPlayer.duration) || audioPlayer.duration <= 0) return;
  if (!isSeeking) musicProgress.value = String(Math.round((audioPlayer.currentTime / audioPlayer.duration) * 1000));
  $('#musicCurrentTime').textContent = formatTime(audioPlayer.currentTime);
  $('#musicDuration').textContent = formatTime(audioPlayer.duration);
});
audioPlayer.addEventListener('play', () => { setMusicStatus('ĐANG PHÁT', 'playing'); updateMusicButtons(); });
audioPlayer.addEventListener('pause', updateMusicButtons);
audioPlayer.addEventListener('ended', () => loadTrack(currentTrack + 1, true));
audioPlayer.addEventListener('error', () => setMusicStatus('KHÔNG TẢI ĐƯỢC FILE', 'error'));
const resumeMusicFromGesture = (event) => {
  if (event.target?.closest?.('.music-card')) return;
  if (musicTracks.length && audioPlayer.paused) playMusic();
};
document.addEventListener('pointerdown', resumeMusicFromGesture, { passive: true });
document.addEventListener('keydown', resumeMusicFromGesture);
audioPlayer.addEventListener('play', () => {
  document.removeEventListener('pointerdown', resumeMusicFromGesture);
  document.removeEventListener('keydown', resumeMusicFromGesture);
});
initMusic();

// PixelFX is an optional pixel-art overlay; Three.js remains responsible for the complete 3D scene.
try {
  const [{ createFrame, clearFrame, createFx, composite }, runeCircle] = await Promise.all([
    import('pixelfx'),
    import('pixelfx/fx/arcane/rune-circle'),
  ]);
  const frameWidth = 256;
  const frameHeight = 256;
  const frame = createFrame(frameWidth, frameHeight);
  const imageData = new ImageData(frameWidth, frameHeight);
  const effect = createFx(runeCircle, {
    x: 128,
    y: 128,
    seed: 23,
    palette: ['#21152a', '#65452f', '#c18b4a', '#f1d18b', '#fff0c9'],
  });
  const fxCanvas = $('#fxCanvas');
  const fxContext = fxCanvas.getContext('2d');
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = frameWidth;
  tempCanvas.height = frameHeight;
  const tempContext = tempCanvas.getContext('2d');
  let previousTime = performance.now();
  const drawPixelFx = (now) => {
    const delta = (now - previousTime) / 1000;
    previousTime = now;
    effect.update(Math.min(0.05, delta));
    clearFrame(frame);
    effect.draw(frame, 'front');
    composite(frame, imageData.data, '#000000');
    tempContext.putImageData(imageData, 0, 0);
    fxContext.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
    fxContext.globalAlpha = 0.38;
    fxContext.globalCompositeOperation = 'screen';
    fxContext.drawImage(tempCanvas, fxCanvas.width * 0.27, fxCanvas.height * 0.17, fxCanvas.width * 0.46, fxCanvas.height * 0.46);
    fxContext.globalAlpha = 1;
    fxContext.globalCompositeOperation = 'source-over';
    requestAnimationFrame(drawPixelFx);
  };
  requestAnimationFrame(drawPixelFx);
} catch (error) {
  console.info('PixelFX overlay unavailable; procedural Three.js effects are active.', error);
}
