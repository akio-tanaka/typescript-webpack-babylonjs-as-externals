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
  const camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 1, BABYLON.Vector3.Zero(), scene);
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.attachControl(canvas, true);
  camera.lowerBetaLimit = -2 * Math.PI * 10;
  camera.upperBetaLimit = 2 * Math.PI * 10;
  camera.beta = Math.PI / 4;
  camera.wheelPrecision = 20;
  return camera;
}

function createLight(scene: BABYLON.Scene): BABYLON.Light[] {
  const directionalLight = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(0, -1, 0), scene);
  directionalLight.diffuse = new BABYLON.Color3(1, 1, 1);
  directionalLight.specular = new BABYLON.Color3(0, 1, 0);
  directionalLight.intensity = 1.5;

  const hemispheric = new BABYLON.HemisphericLight("hemisphericLight", new BABYLON.Vector3(0, 0, 1), scene);
  hemispheric.intensity = 0.5;
  return [hemispheric, directionalLight];
}

function createShaderMaterial(scene: BABYLON.Scene) {
  const pbr = new BABYLON.PBRMetallicRoughnessMaterial("pbr", scene);
  // pbr.baseColor = new BABYLON.Color3(1.0, 0.766, 0.336);
  pbr.metallic = 1.0;
  pbr.roughness = 0.5;
  return pbr;

  BABYLON.Effect.ShadersStore["customVertexShader"] = `
      precision highp float;

      // Attributes
      attribute vec3 position;
      attribute vec3 normal;
      attribute vec3 color;
      
      // Uniforms
      uniform mat4 worldViewProjection;
      
      // Varying
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec3 vColor;
      
      void main(void) {
          vec4 outPosition = worldViewProjection * vec4(position, 1.0);
          gl_Position = outPosition;
      
          vPosition = position;
          vNormal = normal;
          vColor = color;
      }
    `;

  BABYLON.Effect.ShadersStore["customFragmentShader"] = `
        precision highp float;

        // Varying
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vColor;
        
        // Uniforms
        uniform mat4 world;
        
        // Refs
        uniform vec3 cameraPosition;
        
        void main(void) {
            vec3 vLightPosition = vec3(0,20,10);
        
            // World values
            vec3 vPositionW = vec3(world * vec4(vPosition, 1.0));
            vec3 vNormalW = normalize(vec3(world * vec4(vNormal, 0.0)));
            vec3 viewDirectionW = normalize(cameraPosition - vPositionW);
        
            // Light
            vec3 lightVectorW = normalize(vLightPosition - vPositionW);
            vec3 color = vColor;
        
            // diffuse
            float ndl = max(0., dot(vNormalW, lightVectorW));
        
            // Specular
            vec3 angleW = normalize(viewDirectionW + lightVectorW);
            float specComp = max(0., dot(vNormalW, angleW));
            specComp = pow(specComp, max(1., 64.)) * 2.;
        
            gl_FragColor = vec4(color * ndl + vec3(specComp), 1.);
        }
    `;

  return new BABYLON.ShaderMaterial("custom", scene, "custom", {
    attributes: ["position", "normal", "color"],
    uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"],
  });
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
        this.scene.meshes.forEach((mesh) => (mesh.material = createShaderMaterial(this.scene)));

        const { min, max } = this.scene.getWorldExtends();
        const center = max.add(min).scale(0.5);
        const diagonalLength = 0.5 * max.subtract(min).length();

        // setup camera
        const arcRotateCamera = this.camera as BABYLON.ArcRotateCamera;
        arcRotateCamera.radius = diagonalLength * 0.5;

        console.log(`arcRotateCamera.radius=${arcRotateCamera.radius}`);
        arcRotateCamera.setTarget(center);
        arcRotateCamera.lowerRadiusLimit = 0;
        console.log("model loaded");
      })
      .catch(console.error);

    this.engine.runRenderLoop(() => {
      const arcRotateCamera = this.camera as BABYLON.ArcRotateCamera;
      this.lights.forEach((light) => {
        const calcLightDirection = () => {
          const cameraDirection = arcRotateCamera.target.subtract(arcRotateCamera.position).normalize();
          const rotation = BABYLON.Matrix.RotationAxis(arcRotateCamera.upVector, (-60.0 * Math.PI) / 180.0);

          // console.log(`arcRotateCamera.position=${arcRotateCamera.position}`);
          // console.log(`arcRotateCamera.target=${arcRotateCamera.target}`);

          return BABYLON.Vector3.TransformCoordinates(cameraDirection, rotation);
        };

        if (light instanceof BABYLON.HemisphericLight) {
          const hemisphericLight = light as BABYLON.HemisphericLight;
          if (arcRotateCamera && hemisphericLight) {
            hemisphericLight.setDirectionToTarget(calcLightDirection().negate());
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
        this.scene.clearColor = new BABYLON.Color4(background.color.r, background.color.g, background.color.b);
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
