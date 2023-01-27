import * as BABYLON from 'babylonjs';
import * as BABYLONGUI from 'babylonjs-gui';
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

    window.addEventListener('resize', () => {
        engine.resize();
    });

    // UI
    const createButton = (
        text: string,
        callback?: (eventData: BABYLONGUI.Vector2WithInfo, eventState: BABYLON.EventState) => void): BABYLONGUI.Button => {
        const button = BABYLONGUI.Button.CreateSimpleButton(text, text);
        button.width = 0.2;
        button.height = "40px";
        button.color = "white";
        button.background = "green";
        button.horizontalAlignment = BABYLONGUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        if (callback) {
            button.onPointerClickObservable.add(callback);
        }
        return button;
    };

    const advancedTexture = BABYLONGUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const panel = new BABYLONGUI.StackPanel();    
    advancedTexture.addControl(panel);
    panel.addControl(createButton("Click Me 1", () => {
        alert("press click me first");
    }))
    panel.addControl(createButton("Click Me 2", () => {
        alert("press click me second");
    }));
    panel.addControl(createButton("Click Me 3", () => {
        alert("press click me third");
    }));
}
