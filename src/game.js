var THREE = require("three");
var stats = require("stats.js")();

stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

document
    .body
    .appendChild(stats.dom);

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default

document
    .body
    .appendChild(renderer.domElement);

var material = new THREE.MeshPhongMaterial({color: 0x00ff00, specular: 0xffffff, reflectivity: 0.8, shininess: 1.0});
// var geometry = new THREE.SphereBufferGeometry(1.0, 32, 16);
var geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);

var cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
scene.add(cube);

var planeGeometry = new THREE.BoxGeometry(5, 1, 5);

var plane = new THREE.Mesh(planeGeometry, material);
plane.receiveShadow = true;
plane.position.y -= 2.0;
plane.rotation.x += Math.PI;
scene.add(plane);

var light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
light.castShadow = true;

scene.add(light);

camera.position.z = 5;

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {
    stats.begin();

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    stats.end();
}
animate();