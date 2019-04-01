import {Audio, AudioListener, AudioLoader} from "three";

class AudioManager {
  private static _instance: AudioManager;

  public static getInstance(): AudioManager {
    if (typeof AudioManager._instance === "undefined") {
      AudioManager._instance = new AudioManager();
    }
    return AudioManager._instance;
  }

  private _listener: AudioListener;
  private _loader: AudioLoader;

  private _bgMusic: Audio;
  private _deathSound: Audio;

  private constructor() {
    this._listener = new AudioListener();
    this._loader = new AudioLoader();

    this._bgMusic = new Audio(this._listener);
    this._deathSound = new Audio(this._listener);
  }

  public load(url: string, onLoad: Function, onProgress?: Function, onError?: Function) {
    this._loader.load(url, onLoad, onProgress, onError);
  }

  public getAudio(id: number): Audio {
    switch (id) {
      case 0:
        return this._bgMusic;
      case 1:
        return this._deathSound;
      default:
        return new Audio(this._listener);
    }
  }

  public get listener(): AudioListener {
    return this._listener;
  }

}

export default AudioManager.getInstance();