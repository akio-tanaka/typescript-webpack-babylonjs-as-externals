import * as BABYLON from 'babylonjs';
import _ from "lodash";

export function testLodash(): void {
    const strs = [
        "test",
        "desu",
        "test-data",
        "desu"
    ];
    const result = _.filter(strs, (val) => val == "test");
    console.log(result);
}


export function testBabylon(): void {
    var canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    // Load the 3D engine
    var engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 2,
        Math.PI / 3.2,
        2,
        BABYLON.Vector3.Zero(),
        scene);

    camera.attachControl(canvas);

    const light = new BABYLON.HemisphericLight(
        "light",
        new BABYLON.Vector3(0, 1, 0),
        scene);
    const mesh = BABYLON.MeshBuilder.CreateGround("mesh", {}, scene);

    engine.runRenderLoop(() => {
        scene.render();
    });
}