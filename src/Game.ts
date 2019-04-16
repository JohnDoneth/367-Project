/* These do NOT have Typescript implementations, so we must resolve to module names. */
import {
  AudioLoader,
  Clock,
  AmbientLight,
  BoxGeometry,
  Mesh,
  MeshPhongMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  SphereBufferGeometry,
  WebGLRenderer,
  PointLight,
  Object3D
} from "three";
import AudioManager from "./AudioManager";
import MazeCreator, {IMazeResults} from "./MazeCreator";
import listen from "key-state";
import Maze from "./models/Maze";
import { BlendFunction, BloomEffect, KernelSize, NormalPass, SSAOEffect, OutlineEffect, BokehEffect, VignetteEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";

var xAxisOrientation;
var yAxisOrientation;
var zAxisOrientation;

var currentLevel;
var currentTime;
var currentScore;

var usedHint = false;

const stats = require("stats.js")();
const OIMO = require("oimo");

const hintButton = document.getElementById("timer-screen").getElementsByTagName("button")[0]
const clock = new Clock();

export default class Game {
  /* Elements for the scene */
  private _scene : Scene;
  private _camera : PerspectiveCamera;
  private _renderer : WebGLRenderer;
  private _ambientLight : AmbientLight;
  private _player : Mesh;

  private timer;

  private _pointLight : PointLight;

  /* Physics objects */
  private _world : any;
  private _playerBody : any;
  private _bodies : any[];

  /* Player movement */
  private _keys : any;

  private _nightMode : boolean;

  /* Post Processing */
  private _composer: EffectComposer;
  private _ballShadows: any[]
  private _hitWallFlag: boolean = false;


  constructor(nightMode: boolean) {

    this._keys = listen(window);

    this._nightMode = nightMode;
    usedHint = false;
    console.log("Used hint false");
    hintButton.addEventListener("click", () => {
      var hintTime = 0;
      var hinttimer = setInterval(() => {
        usedHint = true;
        console.log("Used hint true");

        this
        ._scene
        .add(this._ambientLight);
        this._camera.position.y = 75.0;

        hintTime++;
        if (hintTime > 3 && usedHint){
          this
        ._scene
        .remove(this._ambientLight);
        this._camera.position.y = 45.0;

        hintButton.style.display = "none";
        clearInterval(hinttimer);
        }
      }, 1000)
    });
    currentTime = 0;
    currentScore = 0;
    currentLevel = 1;
    //screen.orientation.lock("portrait");

    window.addEventListener("deviceorientation", this.handleOrientation, true);

    AudioManager.load("./media/ripped.mp3", (buffer : any) => {
      AudioManager
        .getAudio(0)
        .setBuffer(buffer);
      AudioManager
        .getAudio(0)
        .setLoop(true);
      AudioManager
        .getAudio(0)
        .setVolume(0.2);
      AudioManager
        .getAudio(0)
        .play();
    });

    AudioManager.load("./media/die.mp3", (buffer : any) => {
      AudioManager
        .getAudio(1)
        .setBuffer(buffer);
      AudioManager
        .getAudio(1)
        .setVolume(0.2);
    });

    AudioManager.load("./media/thunk.mp3", (buffer : any) => {
      
      console.log(buffer)
      AudioManager
        .getAudio(2)
        .setBuffer(buffer);
      AudioManager
        .getAudio(2)
        .setVolume(1.5);
    });

    this.render = this
      .render
      .bind(this);
    this.onWindowResize = this
      .onWindowResize
      .bind(this);

    this.initCanvas();

    this.timer = setInterval(() => {
      document.getElementById("timer").innerHTML = "Time: " + this.formatTime(currentTime);
      currentTime++;
    }, 1000)
  }

  private playCollisionSound() {
    console.log("collide")
    AudioManager
        .getAudio(2)
        .stop()

    AudioManager
        .getAudio(2)
        .play()
  }
  
  private handleOrientation(event){ 
    var x = event.gamma;
    var y = event.beta;
    var z = event.alpha;
	  xAxisOrientation = x;
    yAxisOrientation = y;
    zAxisOrientation = z;
  }

  private initCanvas() {
    console.log("Initializing canvas...");
    stats.showPanel(0);
    this._renderer = new WebGLRenderer({antialias: true});
    this
      ._renderer
      .setSize(window.innerWidth, window.innerHeight);
    this._renderer.setClearColor('#555') 
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = PCFSoftShadowMap; // default

    this._camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
    this._camera.position.y = 12;
    this
      ._camera
      .rotateX(-(Math.PI / 2));

    this.initScene();

    document
      .body
      .appendChild(stats.dom);
    document
      .body
      .appendChild(this._renderer.domElement);

    window.addEventListener('resize', this.onWindowResize, false);

    /* Effects */

    const renderPass = new RenderPass(this._scene, this._camera);
    renderPass.renderToScreen = false;

    const bloomPass = new EffectPass(this._camera, new BloomEffect({
      distinction: 0.1,
      kernelSize: KernelSize.LARGE,
      blendFunction: BlendFunction.SOFT_LIGHT,
    }));
    bloomPass.renderToScreen = true;

    this._composer = new EffectComposer(this._renderer);
    this._composer.addPass(renderPass);
    this._composer.addPass(bloomPass);
    //this._composer.addPass(normalPass);
    //this._composer.addPass(effectPass);

    /* Init level */

    this._ballShadows = []

    for (let index = 0; index < 20; index++) {
      let material = new MeshPhongMaterial({color: 0xf0f0f0, specular: 0xffffff, reflectivity: 0.8, shininess: 1.0});
      let geometry = new SphereBufferGeometry(1.0, 16, 4);

      let mesh: any = new Mesh(geometry, material);
      mesh.isAlive = false;

      this._ballShadows.push(mesh);
      this._scene.add(mesh)
    }


    this.createPlayer();
    this.initPhysics();
	
    this.render();
  }

  private initScene(){
    this._scene = new Scene();

    this
    ._scene
    .add(this._camera);

  if (this._nightMode)
    this._ambientLight = new AmbientLight(0x707070, 0.5); // soft white light
  else{
    this._ambientLight = new AmbientLight(0x707070, 2.5); // soft white light
    this._scene.add(this._ambientLight);
  }

  this._pointLight = new PointLight(0xffffff, 0.3, 100)
  this._pointLight.castShadow = true;
  this
    ._scene
    .add(this._pointLight);
  }
 

  private initPhysics() {
    this._world = new OIMO.World({
      timestep: 1 / 60,
      iterations: 8,
      broadphase: 2, // 1 brute force, 2 sweep and prune, 3 volume tree
      worldscale: 1, // scale full world
      random: true, // randomize sample
      info: false, // calculate statistic or not
      gravity: [0, -9.8, 0]
    });
    this._playerBody = this
      ._world
      .add({
        name: 'player',
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
    this.initLevel();
  }

  private initLevel() {

    this._bodies = [];
    var maze = new Maze(11, 11, 5, 5);
    const results : IMazeResults = MazeCreator.create(maze);
    const material = new MeshPhongMaterial({color: 0x1F85DE, specular: 0xffffff, reflectivity: 0.8, shininess: 1.0});
    const length = maze.cellHeight;
    const width = maze.cellWidth;

    document.getElementById("level").innerHTML = "Level: " + currentLevel;
    /* Generate Maze Floor */
    const floorGeometry = new BoxGeometry(width * maze.width, 0.25, length * maze.height);
    const floorMesh = new Mesh(floorGeometry, material);
    floorMesh.receiveShadow = true;
    this
      ._scene
      .add(floorMesh);
    this
      ._bodies
      .push([
        floorMesh,
        this
          ._world
          .add({
            type: 'box', // type of shape : sphere, box, cylinder
            size: [
              width * maze.width,
              0.25,
              length * maze.height
            ], // size of shape
            pos: [
              0, -3, -(length * maze.height / 2) + (length / 2)
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
          })
      ]);

    const wallMaterial = new MeshPhongMaterial({color: 0xFFFFFF, specular: 0xffffff, reflectivity: 0.8, shininess: 1.0});
    for (let object of results.objects) {
      for (let wall of object.walls) {
        let wallGeometry = new BoxGeometry(wall[0].x, wall[0].y * length, wall[0].z);
        let wallMesh = new Mesh(wallGeometry, wallMaterial);
        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;
        this
          ._scene
          .add(wallMesh);
        this
          ._bodies
          .push([
            wallMesh,
            this
              ._world
              .add({
                name: 'wall',
                type: 'box', // type of shape : sphere, box, cylinder
                size: [
                  wall[0].x, wall[0].y * length,
                  wall[0].z
                ], // size of shape
                posShape: [
                  wall[1].x, wall[1].y * -0.5,
                  wall[1].z
                ],
                move: false, // dynamic or statique
                density: 1,
                friction: 0.2,
                restitution: 0.2,
                belongsTo: 1, // The bits of the collision groups to which the shape belongs.
                collidesWith: 0xffffffff, // The bits of the collision groups with which the shape collides.
              })
          ]);
      }

      this._camera.position.z = -20.0;
      this._camera.position.y = 45.0;

    }
  }

  private createPlayer() {
    let material = new MeshPhongMaterial({color: 0xf0f0f0, specular: 0xffffff, reflectivity: 0.8, shininess: 1.0});
    let geometry = new SphereBufferGeometry(1.0, 32, 16);

    this._player = new Mesh(geometry, material);
    //this._player.castShadow = true;
    this._player.receiveShadow = true;
    this._player.name = "sphere";
    this
      ._player
      .add(AudioManager.listener);
    this
      ._scene
      .add(this._player);
  }

  private formatTime(val: number){
    var minutes = Math.floor(val / 60);
    var formattedMinutes = ("0" + minutes).slice(-2);
    var seconds = val % 60;
    var formattedSeconds = ("0" + seconds).slice(-2);
    return formattedMinutes + ":" + formattedSeconds;
  }

  public copyPhysicsProperties(target : Mesh, body : any) {
    target
      .position
      .copy(body.getPosition());
    target
      .quaternion
      .copy(body.getQuaternion());
  }

  private timeToSpawn = 0;

  private render() {

    const deltaTime = clock.getDelta();
    
    /*this
      ._renderer
      .render(this._scene, this._camera);*/

    this._composer.render(deltaTime);

    stats.update();

    this.copyPhysicsProperties(this._player, this._playerBody);
    for (const body of this._bodies) {
      this.copyPhysicsProperties(body[0], body[1]);
    }

    if (this._world.checkContact('player', 'wall') && this._hitWallFlag == false) {
      this._hitWallFlag = true;
      this.playCollisionSound();
    }
    if (this._world.checkContact('player', 'wall') == false) {
      this._hitWallFlag = false;
    }

    // Spawn a new shadow every 0.1 ms
    this.timeToSpawn += deltaTime;
    if (this.timeToSpawn > 0.1) {
      this.timeToSpawn = 0;

      for (let element of this._ballShadows) {
        if (!element.isAlive) {
          element.isAlive = true;
          element.scale.setScalar(1.0);
          element.timeAlive = 0.0;
          element.material.opacity = 1.0;
          element.position.set(this._player.position.x, this._player.position.y, this._player.position.z);
          break;
        }
      }
    }
    
    // Apply effects to each alive shadow
    this._ballShadows.forEach(element => {
      if (element.isAlive) {
        element.visible = true;
        element.material.transparent = true;
        element.material.opacity -= deltaTime
        element.scale.subScalar(deltaTime);
        element.timeAlive += deltaTime;

        if (element.timeAlive > 1.0) {
          element.isAlive = false;
        }
      } else {
        element.visible = false;
      }
    });

    const PLAYER_IMPULSE = 1.0;
   
    if (this._keys["ArrowUp"]) {
      this
        ._playerBody
        .awake();
      this
        ._playerBody
        .applyImpulse(new OIMO.Vec3(0, 0, 0), new OIMO.Vec3(0, 0, -PLAYER_IMPULSE));
    }

    else if (this._keys["ArrowDown"]) {
      this
        ._playerBody
        .awake();
      this
        ._playerBody
        .applyImpulse(new OIMO.Vec3(0, 0, 0), new OIMO.Vec3(0, 0, PLAYER_IMPULSE));
    }

    else if (this._keys["ArrowLeft"]) {
      this
        ._playerBody
        .awake();
      this
        ._playerBody
        .applyImpulse(new OIMO.Vec3(0, 0, 0), new OIMO.Vec3(-PLAYER_IMPULSE, 0, 0));
    }

    else if (this._keys["ArrowRight"]) {
      this
        ._playerBody
        .awake();
      this
        ._playerBody
        .applyImpulse(new OIMO.Vec3(0, 0, 0), new OIMO.Vec3(PLAYER_IMPULSE, 0, 0));
    }
    else{
      this
      ._playerBody
      .awake();
    this
      ._playerBody
      .applyImpulse(new OIMO.Vec3(0, 0, 0), new OIMO.Vec3(xAxisOrientation/10, 0, yAxisOrientation/10));
    }

    if (this._playerBody.position.y <= -25.0) {
      this
        ._playerBody
        .sleep();
      this._playerBody.position = new OIMO.Vec3(0, 0, 0);
      AudioManager
        .getAudio(1)
        .play();
      currentScore += currentTime;
      document.getElementById("score").innerHTML = "Score: " + currentScore;
      if (currentLevel == 10){
        window.alert("You win! Score: " + currentScore);
        window.location.reload();
      }
      if (this._nightMode)
        hintButton.style.display = "block";
      usedHint = false;
      currentLevel++;
      currentTime = 0;
      this.initScene();
      this.createPlayer();
      this.initPhysics();

    }

    this
      ._pointLight
      .position
      .set(this._playerBody.position.x, this._playerBody.position.y + 3.5, this._playerBody.position.z);

    this.updateCameraPosition();
    this
      ._world
      .step();
    requestAnimationFrame(this.render);
  }

  private updateCameraPosition() {
    this._camera.position.x = this._playerBody.position.x;
    this._camera.position.z = this._playerBody.position.z;
  }

  private onWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this
      ._camera
      .updateProjectionMatrix();
    this
      ._renderer
      .setSize(window.innerWidth, window.innerHeight);
  }
}