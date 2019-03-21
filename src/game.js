var THREE = require("three");
var stats = require("stats.js")();

stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

document
    .body
    .appendChild(stats.dom);

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default

document
    .body
    .appendChild(renderer.domElement);

var ambientLight = new THREE.AmbientLight(0x707070); // soft white light
scene.add(ambientLight);

let light = new THREE.SpotLight(0xffffff);
//let light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
light.castShadow = true;
light.position.y = 5.0;
scene.add(light);

//Set up shadow properties for the light

light.shadow.mapSize.width = 2048; // default
light.shadow.mapSize.height = 2048; // default
light.shadow.camera.near = 0.5; // default
light.shadow.camera.far = 1000 // default
light.shadow.radius = 1.5;
light.shadow.bias = 0.0001;

let material = new THREE.MeshPhongMaterial({color: 0xf0f0f0, specular: 0xffffff, reflectivity: 0.8, shininess: 1.0});
// var geometry = new THREE.SphereBufferGeometry(1.0, 32, 16);
let geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);

let cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
cube.receiveShadow = true;
scene.add(cube);

let planeGeometry = new THREE.BoxGeometry(5, 0.25, 5);

let plane = new THREE.Mesh(planeGeometry, material);
plane.receiveShadow = true;
plane.position.y -= 2.0;
plane.rotation.x += Math.PI;
scene.add(plane);

camera.position.z = 8;

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

let deltaClock = new THREE.Clock(true);

// Main game loop
function gameloop() {

    // Delta time between frames, used for smooth movement
    let deltaTime = deltaClock.getDelta();

    cube.rotation.x += 0.7 * deltaTime;
    cube.rotation.y += 0.7 * deltaTime;

    renderer.render(scene, camera); // render the entire scene

    stats.update(); // update FPS stats counter

    requestAnimationFrame(gameloop); // ask the browser to call our function again when it can
}

gameloop(); // start the game loop