const THREE = require("three");
const stats = require("stats.js")();
const OIMO = require("oimo");
const MazeCreator = require("./MazeCreator");
import listen from "key-state";

const audio = new Audio("ripped.mp3");
audio.volume = 0.1;
audio.loop = true;
// audio.play();

const keys = listen(window);

const coords = MazeCreator.create(MazeCreator.ONE);
const planeBodies = [];

stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

document
    .body
    .appendChild(stats.dom);

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 8;

let renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default

document
    .body
    .appendChild(renderer.domElement);

let ambientLight = new THREE.AmbientLight(0x707070); // soft white light
scene.add(ambientLight);

let light = new THREE.SpotLight(0xffffff);
//let light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
light.castShadow = true;
light.position.y = 5.0;

// Set up shadow properties for the light
light.shadow.mapSize.width = 2048; // default
light.shadow.mapSize.height = 2048; // default
light.shadow.camera.near = 0.5; // default
light.shadow.camera.far = 1000; // default
light.shadow.radius = 1.5;
light.shadow.bias = 0.0001;

scene.add(light);

let material = new THREE.MeshPhongMaterial({color: 0xf0f0f0, specular: 0xffffff, reflectivity: 0.8, shininess: 1.0});
let geometry = new THREE.SphereBufferGeometry(1.0, 32, 16);

let sphere = new THREE.Mesh(geometry, material);
sphere.castShadow = true;
sphere.receiveShadow = true;

scene.add(sphere);

// Physics world
let world = new OIMO.World({
    timestep: 1 / 60,
    iterations: 8,
    broadphase: 2, // 1 brute force, 2 sweep and prune, 3 volume tree
    worldscale: 1, // scale full world
    random: true, // randomize sample
    info: false, // calculate statistic or not
    gravity: [0, -9.8, 0]
});

let sphereBody = world.add({
    type: 'sphere', // type of shape : sphere, box, cylinder
    size: [
        1, 1, 1
    ], // size of shape
    pos: [
        0, 0, 0
    ], // start position in degree
    rot: [
        0, 0, 90
    ], // start rotation in degree
    move: true, // dynamic or statique
    density: 1,
    friction: 0.2,
    restitution: 0.2,
    belongsTo: 1, // The bits of the collision groups to which the shape belongs.
    collidesWith: 0xffffffff, // The bits of the collision groups with which the shape collides.
});

for (let coordinate of coords) {
  let planeGeometry = new THREE.BoxGeometry(5, 0.25, 5);
  let planeMesh = new THREE.Mesh(planeGeometry, material);
  planeMesh.receiveShadow = true;
  scene.add(planeMesh);

  const length = 5;
  const width = 5;
  planeBodies.push([planeMesh, world.add({
    type: 'box', // type of shape : sphere, box, cylinder
    size: [
      width, 0.25, length
    ], // size of shape
    pos: [
      width * coordinate[0], -3, -coordinate[2] * length
    ], // start position in degree
    rot: [
      0, 0, 0
    ], // start rotation in degree
    move: false, // dynamic or statique
    density: 1,
    friction: 0.2,
    restitution: 0.2,
    belongsTo: 1, // The bits of the collision groups to which the shape belongs.
    collidesWith: 0xffffffff, // The bits of the collision groups with which the shape collides.
  })]);
}

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

}

// Copy the physics world body to our three.js representation of those objects
function copyPhysicsProperties(target, body) {
    target
        .position
        .copy(body.getPosition());

    target
        .quaternion
        .copy(body.getQuaternion());
}

function updateCameraPosition() {
  camera.position.x = sphereBody.position.x;
  camera.position.z = sphereBody.position.z + 8;
}

let deltaClock = new THREE.Clock(true);

// Main game loop
function gameloop() {

    // Delta time between frames, used for smooth movement
    let deltaTime = deltaClock.getDelta();

    copyPhysicsProperties(sphere, sphereBody);

    for (const planeBody of planeBodies) {
      copyPhysicsProperties(planeBody[0], planeBody[1]);
    }

    if (keys["ArrowUp"]) {
      sphereBody.awake();
      sphereBody.position.z -= 0.1;
    }

    if (keys["ArrowDown"]) {
      sphereBody.awake();
      sphereBody.position.z += 0.1;
    }

    if (keys["ArrowLeft"]) {
      sphereBody.awake();
      sphereBody.position.x -= 0.1;
    }

    if (keys["ArrowRight"]) {
      sphereBody.awake();
      sphereBody.position.x += 0.1;
    }

    if (sphereBody.position.y <= -25.0) {
      sphereBody.sleep();
      sphereBody.position = new OIMO.Vec3(0, 0, 0);
    }

    updateCameraPosition();

    // Update physics
    world.step();

    renderer.render(scene, camera); // render the entire scene

    stats.update(); // update FPS stats counter

    // ask the browser to call our render function again when it can
    requestAnimationFrame(gameloop);
}

gameloop(); // start the game loop