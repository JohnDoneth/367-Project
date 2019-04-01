/* These do NOT have Typescript implementations, so we must resolve to module names. */
import {
  AmbientLight, BoxGeometry,
  Mesh,
  MeshPhongMaterial, Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene, SphereBufferGeometry,
  SpotLight,
  WebGLRenderer
} from "three";
import AudioManager from "./AudioManager";
import MazeCreator, {IMazeResults} from "./MazeCreator";
import listen from "key-state";
import {MAZE_ONE} from "./models/Maze";

const stats = require("stats.js")();
const OIMO = require("oimo");

export default class Game {
  /* Elements for the scene */
  private _scene: Scene;
  private _camera: PerspectiveCamera;
  private _renderer: WebGLRenderer;
  private _ambientLight: AmbientLight;
  private _spotLight: SpotLight;
  private _player: Mesh;

  /* Physics objects */
  private _world: any;
  private _playerBody: any;
  private _bodies: any[];

  /* Player movement */
  private _keys: any;

  constructor() {
    this._keys = listen(window);

    AudioManager.load("./media/ripped.mp3", (buffer: any) => {
      AudioManager.getAudio(0).setBuffer(buffer);
      AudioManager.getAudio(0).setLoop(true);
      AudioManager.getAudio(0).setVolume(0.2);
      // AudioManager.getAudio(0).play();
    });

    AudioManager.load("./media/die.mp3", (buffer: any) => {
      AudioManager.getAudio(1).setBuffer(buffer);
      AudioManager.getAudio(1).setVolume(0.2);
    });

    this.render = this.render.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);

    this.initCanvas();
  }

  private initCanvas() {
    stats.showPanel(0);

    this._scene = new Scene();
    this._renderer = new WebGLRenderer({antialias: true});
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = PCFSoftShadowMap; // default

    this._camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this._camera.position.y = 12;
    this._camera.rotateX(-(Math.PI / 2));
    this._scene.add(this._camera);

    this._ambientLight = new AmbientLight(0x707070, 2.0); // soft white light
    this._scene.add(this._ambientLight);

    this._spotLight = new SpotLight(0xffffff);
    this._spotLight.castShadow = true;
    this._spotLight.intensity = 2.0;
    this._spotLight.distance = 200;

    this._spotLight.shadow.mapSize.width = 2048; // default
    this._spotLight.shadow.mapSize.height = 2048; // default
    this._spotLight.shadow.camera.near = 0.5; // default
    this._spotLight.shadow.camera.far = 1000; // default
    this._spotLight.shadow.radius = 1.5;
    this._spotLight.shadow.bias = 0.0001;
    // this._scene.add(this._spotLight);

    document.body.appendChild(stats.dom);
    document.body.appendChild(this._renderer.domElement);

    window.addEventListener('resize', this.onWindowResize, false);

    this.createPlayer();
    this.initPhysics();
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
    this._playerBody = this._world.add({
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
    const results: IMazeResults = MazeCreator.create(MAZE_ONE);
    const material = new MeshPhongMaterial({color: 0x1F85DE, specular: 0xffffff, reflectivity: 0.8, shininess: 1.0});
    const wallMaterial = new MeshPhongMaterial({color: 0xFFFFFF, specular: 0xffffff, reflectivity: 0.8, shininess: 1.0});
    const visitedMaterial = new MeshPhongMaterial({color: 0xFF00FF, specular: 0xffffff, reflectivity: 0.8, shininess: 1.0});
    for (let object of results.objects) {
      const length = MAZE_ONE.cellHeight;
      const width = MAZE_ONE.cellWidth;
      let planeGeometry = new BoxGeometry(width, 0.25, length);
      let planeMesh;
      if (object.cell.visited) {
        planeMesh = new Mesh(planeGeometry, visitedMaterial);
      } else {
        planeMesh = new Mesh(planeGeometry, material);
      }
      planeMesh.receiveShadow = true;
      this._bodies.push([planeMesh, this._world.add({
        type: 'box', // type of shape : sphere, box, cylinder
        size: [
          width, 0.25, length
        ], // size of shape
        pos: [
          width * object.position.x, -3 * object.position.y, -object.position.z * length
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

      for (let wall of object.walls) {
        let wallGeometry = new BoxGeometry(wall[0].x, wall[0].y * length, wall[0].z);
        let wallMesh = new Mesh(wallGeometry, wallMaterial);
        this._scene.add(wallMesh);
        this._bodies.push([wallMesh, this._world.add({
          type: 'box', // type of shape : sphere, box, cylinder
          size: [
            wall[0].x, wall[0].y * length, wall[0].z
          ], // size of shape
          posShape: [
            wall[1].x, wall[1].y * -0.5, wall[1].z
          ],
          move: false, // dynamic or statique
          density: 1,
          friction: 0.2,
          restitution: 0.2,
          belongsTo: 1, // The bits of the collision groups to which the shape belongs.
          collidesWith: 0xffffffff, // The bits of the collision groups with which the shape collides.
        })]);
      }

      this._scene.add(planeMesh);
    }
  }

  private createPlayer() {
    let material = new MeshPhongMaterial({color: 0xf0f0f0, specular: 0xffffff, reflectivity: 0.8, shininess: 1.0});
    let geometry = new SphereBufferGeometry(1.0, 32, 16);

    this._player = new Mesh(geometry, material);
    this._player.castShadow = true;
    this._player.receiveShadow = true;
    this._player.name = "sphere";
    this._player.add(AudioManager.listener);
    this._scene.add(this._player);

    this._spotLight.target = this._scene.getObjectByName('sphere') as Object3D;
  }

  public copyPhysicsProperties(target: Mesh, body: any) {
    target.position.copy(body.getPosition());
    target.quaternion.copy(body.getQuaternion());
  }

  private render() {
    this._renderer.render(this._scene, this._camera);
    stats.update();

    this.copyPhysicsProperties(this._player, this._playerBody);
    for (const body of this._bodies) {
      this.copyPhysicsProperties(body[0], body[1]);
    }

    if (this._keys["ArrowUp"]) {
      this._playerBody.awake();
      this._playerBody.applyImpulse(new OIMO.Vec3(0, 0, 0), new OIMO.Vec3(0, 0, -0.1));
    }

    if (this._keys["ArrowDown"]) {
      this._playerBody.awake();
      this._playerBody.applyImpulse(new OIMO.Vec3(0, 0, 0), new OIMO.Vec3(0, 0, 0.1));
    }

    if (this._keys["ArrowLeft"]) {
      this._playerBody.awake();
      this._playerBody.applyImpulse(new OIMO.Vec3(0, 0, 0), new OIMO.Vec3(-0.1, 0, 0));
    }

    if (this._keys["ArrowRight"]) {
      this._playerBody.awake();
      this._playerBody.applyImpulse(new OIMO.Vec3(0, 0, 0), new OIMO.Vec3(0.1, 0, 0));
    }

    if (this._playerBody.position.y <= -25.0) {
      this._playerBody.sleep();
      this._playerBody.position = new OIMO.Vec3(0, 0, 0);
      AudioManager.getAudio(1).play();
    }

    this.updateCameraPosition();
    this._world.step();
    requestAnimationFrame(this.render);
  }

  private updateCameraPosition() {
    this._camera.position.x = this._playerBody.position.x;
    this._camera.position.z = this._playerBody.position.z;
  }

  private onWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
  }
}