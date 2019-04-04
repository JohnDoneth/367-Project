/* These do NOT have Typescript implementations, so we must resolve to module names. */
import {
  AmbientLight,
  BoxGeometry,
  Mesh,
  MeshPhongMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  SphereBufferGeometry,
  WebGLRenderer,
  PointLight
} from "three";
import AudioManager from "./AudioManager";
import MazeCreator, {IMazeResults} from "./MazeCreator";
import listen from "key-state";
import {MAZE_ONE} from "./models/Maze";

const stats = require("stats.js")();
const OIMO = require("oimo");

export default class Game {
  /* Elements for the scene */
  private _scene : Scene;
  private _camera : PerspectiveCamera;
  private _renderer : WebGLRenderer;
  private _ambientLight : AmbientLight;
  private _player : Mesh;

  private _xAxisOrientation;
  private _yAxisOrientation;
  private _pointLight : PointLight;

  /* Physics objects */
  private _world : any;
  private _playerBody : any;
  private _bodies : any[];

  /* Player movement */
  private _keys : any;

  constructor() {
    this._keys = listen(window);

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

    this.render = this
      .render
      .bind(this);
    this.onWindowResize = this
      .onWindowResize
      .bind(this);

    this.initCanvas();
  }
  
  private handleOrientation(event){ 
	  var x = event.beta;
	  var y = event.gamma;
      console.log("x: " + x);
	  this._xAxisOrientation = x;
	  console.log("y: " + y);
	  this._yAxisOrientation = y;
  }

  private initCanvas() {
    console.log("Initializing canvas...");
    stats.showPanel(0);

	this._yAxisOrientation = 0;
	this._xAxisOrientation = 0;
    this._scene = new Scene();
    this._renderer = new WebGLRenderer({antialias: true});
    this
      ._renderer
      .setSize(window.innerWidth, window.innerHeight);
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = PCFSoftShadowMap; // default

    this._camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
    this._camera.position.y = 12;
    this
      ._camera
      .rotateX(-(Math.PI / 2));
    this
      ._scene
      .add(this._camera);

    this._ambientLight = new AmbientLight(0x707070, 2.50); // soft white light
    this
      ._scene
      .add(this._ambientLight);

    this._pointLight = new PointLight(0xffffff, 0.3, 100)
    this._pointLight.castShadow = true;
    this
      ._scene
      .add(this._pointLight);

    document
      .body
      .appendChild(stats.dom);
    document
      .body
      .appendChild(this._renderer.domElement);

    window.addEventListener('resize', this.onWindowResize, false);

    this.createPlayer();
    this.initPhysics();
		
	
	window.addEventListener("deviceorientation", this.handleOrientation, true);
	
    this.render();
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
    const results : IMazeResults = MazeCreator.create(MAZE_ONE);
    const material = new MeshPhongMaterial({color: 0x1F85DE, specular: 0xffffff, reflectivity: 0.8, shininess: 1.0});
    const length = MAZE_ONE.cellHeight;
    const width = MAZE_ONE.cellWidth;

    /* Generate Maze Floor */
    const floorGeometry = new BoxGeometry(width * MAZE_ONE.width, 0.25, length * MAZE_ONE.height);
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
              width * MAZE_ONE.width,
              0.25,
              length * MAZE_ONE.height
            ], // size of shape
            pos: [
              0, -3, -(length * MAZE_ONE.height / 2) + (length / 2)
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
      this._camera.position.y = 60.0;

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

  public copyPhysicsProperties(target : Mesh, body : any) {
    target
      .position
      .copy(body.getPosition());
    target
      .quaternion
      .copy(body.getQuaternion());
  }

  private render() {
    this
      ._renderer
      .render(this._scene, this._camera);
    stats.update();

    this.copyPhysicsProperties(this._player, this._playerBody);
    for (const body of this._bodies) {
      this.copyPhysicsProperties(body[0], body[1]);
    }

    const PLAYER_IMPULSE = 1.0;

    if (this._keys["ArrowUp"] || this._yAxisOrientation > 50) {
      this
        ._playerBody
        .awake();
      this
        ._playerBody
        .applyImpulse(new OIMO.Vec3(0, 0, 0), new OIMO.Vec3(0, 0, -PLAYER_IMPULSE));
    }

    if (this._keys["ArrowDown"] || this._yAxisOrientation < -50) {
      this
        ._playerBody
        .awake();
      this
        ._playerBody
        .applyImpulse(new OIMO.Vec3(0, 0, 0), new OIMO.Vec3(0, 0, PLAYER_IMPULSE));
    }

    if (this._keys["ArrowLeft"]) {
      this
        ._playerBody
        .awake();
      this
        ._playerBody
        .applyImpulse(new OIMO.Vec3(0, 0, 0), new OIMO.Vec3(-PLAYER_IMPULSE, 0, 0));
    }

    if (this._keys["ArrowRight"]) {
      this
        ._playerBody
        .awake();
      this
        ._playerBody
        .applyImpulse(new OIMO.Vec3(0, 0, 0), new OIMO.Vec3(PLAYER_IMPULSE, 0, 0));
    }

    if (this._playerBody.position.y <= -25.0) {
      this
        ._playerBody
        .sleep();
      this._playerBody.position = new OIMO.Vec3(0, 0, 0);
      AudioManager
        .getAudio(1)
        .play();
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