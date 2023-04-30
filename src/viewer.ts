import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import { Background, BackgroundType } from "./background";
import { ViewerSettings, defaultViewerSettings } from "./viewer-settings";

function createEngine(canvasId: string): BABYLON.Engine {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  const engine = new BABYLON.Engine(canvas, true);
  window.addEventListener("resize", function () {
    engine.resize();
  });
  return engine;
}

function createCamera(scene: BABYLON.Scene): BABYLON.Camera {
  const arcRotateCamera = new BABYLON.ArcRotateCamera(
    "camera",
    Math.PI / 2,
    0,
    0.2,
    BABYLON.Vector3.Zero(),
    scene
  );
  arcRotateCamera.target = BABYLON.Vector3.Zero();
  arcRotateCamera.attachControl(true);
  arcRotateCamera.minZ = 0;
  return arcRotateCamera;
}

function createLight(scene: BABYLON.Scene): BABYLON.Light {
  const directionalLight = new BABYLON.DirectionalLight(
    "light",
    new BABYLON.Vector3(-1, -3, -1.5),
    scene
  );
  directionalLight.intensity = 1.0;
  return directionalLight;
}

class Viewer {
  private settings: ViewerSettings = defaultViewerSettings();
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private camera: BABYLON.Camera;
  private light: BABYLON.Light;

  constructor(private canvasId: string, private gltfUrl: string) {
    this.engine = createEngine(canvasId);
    this.scene = new BABYLON.Scene(this.engine);

    this.setBackground(this.settings.background);

    this.camera = createCamera(this.scene);
    this.light = createLight(this.scene);
    BABYLON.SceneLoader.AppendAsync("./", this.gltfUrl, this.scene)
      .then(() => {
        console.log("model loaded");
      })
      .catch(console.error);
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  setBackground(background: Background): void {
    switch (background.type) {
      case BackgroundType.SingleColor:
        this.scene.clearColor = new BABYLON.Color4(
          background.color.r,
          background.color.g,
          background.color.b
        );
        break;
      case BackgroundType.Gradient:
        throw new Error("not implemented: BackgroundType.Gradient");
      default:
        throw new Error("invalid BackgroundType");
    }
  }
}

export function create(canvasId: string, gltfUrl: string): Viewer {
  return new Viewer(canvasId, gltfUrl);
}
