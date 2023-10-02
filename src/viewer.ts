import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import { Background, BackgroundType } from "./background";
import { ViewerSettings, defaultViewerSettings } from "./viewer-settings";

function createEngine(canvasId: string): BABYLON.Engine {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  const engine = new BABYLON.Engine(canvas);
  window.addEventListener("resize", function () {
    engine.resize();
  });
  return engine;
}

function createArcRotateCamera(scene: BABYLON.Scene): BABYLON.ArcRotateCamera {
  const canvas = scene.getEngine().getRenderingCanvas();
  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    0,
    0,
    1,
    BABYLON.Vector3.Zero(),
    scene
  );
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.attachControl(canvas, true);
  camera.lowerBetaLimit = -2 * Math.PI * 10;
  camera.upperBetaLimit = 2 * Math.PI * 10;
  camera.beta = Math.PI / 4;
  camera.wheelPrecision = 20;
  return camera;
}

function createLight(scene: BABYLON.Scene): BABYLON.Light[] {
  const directionalLight = new BABYLON.DirectionalLight(
    "DirectionalLight",
    new BABYLON.Vector3(0, -1, 0),
    scene
  );
  directionalLight.diffuse = new BABYLON.Color3(1, 1, 1);
  directionalLight.specular = new BABYLON.Color3(0, 1, 0);
  directionalLight.intensity = 3;

  const hemispheric = new BABYLON.HemisphericLight(
    "hemisphericLight",
    new BABYLON.Vector3(0, 0, 1),
    scene
  );
  hemispheric.intensity = 3;
  return [hemispheric, directionalLight];
}

class Viewer {
  private settings: ViewerSettings = defaultViewerSettings();
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private camera: BABYLON.Camera;
  private lights: BABYLON.Light[];

  constructor(private canvasId: string, private gltfUrl: string) {
    this.engine = createEngine(canvasId);
    this.scene = new BABYLON.Scene(this.engine);

    this.scene.debugLayer.show();

    this.setBackground(this.settings.background);

    this.camera = createArcRotateCamera(this.scene);
    this.lights = createLight(this.scene);
    BABYLON.SceneLoader.AppendAsync("./", this.gltfUrl, this.scene)
      .then(() => {
        const { min, max } = this.scene.getWorldExtends();
        const center = max.add(min).scale(0.5);
        const diagonalVector = max.subtract(min);
        const diagonalLength = diagonalVector.length();

        // setup camera
        const arcRotateCamera = this.camera as BABYLON.ArcRotateCamera;
        arcRotateCamera.radius = diagonalLength * 0.5;
        arcRotateCamera.setTarget(center);
        arcRotateCamera.lowerRadiusLimit = 0;
        console.log("model loaded");

        // create background
        const ground = BABYLON.MeshBuilder.CreateGround(
          "ground",
          {
            width: diagonalVector.x * 3,
            height: diagonalVector.z * 3,
          },
          this.scene
        );

        // - background position
        const groundMaterial = new BABYLON.StandardMaterial(
          "ground_mat",
          this.scene
        );
        groundMaterial.diffuseColor = BABYLON.Color3.Green();
        groundMaterial.backFaceCulling = false;
        ground.material = groundMaterial;
        const newGroundPosition = center.clone();
        newGroundPosition.y = min.y - diagonalVector.y * 0.5;
        ground.position = newGroundPosition;

        // - background material
        // TODO eliminate warning
        const backgroundMaterial = new BABYLON.BackgroundMaterial(
          "backgroundMaterial",
          this.scene
        );
        backgroundMaterial.diffuseTexture = new BABYLON.Texture(
          "https://assets.babylonjs.com/environments/backgroundGround.png",
          this.scene
        );
        backgroundMaterial.diffuseTexture.hasAlpha = true;
        backgroundMaterial.opacityFresnel = false;
        backgroundMaterial.shadowLevel = 1;

        var mirror = new BABYLON.MirrorTexture(
          "mirror",
          2048,
          this.scene,
          true
        );
        mirror.mirrorPlane = new BABYLON.Plane(0, -1, 0, ground.position.y);
        this.scene.meshes.forEach((mesh) => mirror.renderList?.push(mesh));
        backgroundMaterial.reflectionTexture = mirror;
        backgroundMaterial.reflectionFresnel = true;
        backgroundMaterial.reflectionStandardFresnelWeight = 0.8;

        ground.material = backgroundMaterial;
      })
      .catch(console.error);

    this.engine.runRenderLoop(() => {
      const arcRotateCamera = this.camera as BABYLON.ArcRotateCamera;
      this.lights.forEach((light) => {
        const calcLightDirection = () => {
          const cameraDirection = arcRotateCamera.target
            .subtract(arcRotateCamera.position)
            .normalize();
          const rotation = BABYLON.Matrix.RotationAxis(
            arcRotateCamera.upVector,
            (-10.0 * Math.PI) / 180.0
          );

          return BABYLON.Vector3.TransformCoordinates(
            cameraDirection,
            rotation
          );
        };

        if (light instanceof BABYLON.HemisphericLight) {
          const hemisphericLight = light as BABYLON.HemisphericLight;
          if (arcRotateCamera && hemisphericLight) {
            hemisphericLight.setDirectionToTarget(
              calcLightDirection().negate()
            );
          }
        } else if (light instanceof BABYLON.DirectionalLight) {
          const directionalLight = light as BABYLON.DirectionalLight;
          if (arcRotateCamera && directionalLight) {
            directionalLight.direction = calcLightDirection();
          }
        }
      });

      this.scene.getActiveMeshes().forEach((mesh) => {
        if (mesh.material instanceof BABYLON.ShaderMaterial) {
          mesh.material.setVector3("cameraPosition", arcRotateCamera.position);
        }
      });

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
