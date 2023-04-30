import * as BABYLON from "@babylonjs/core";
import { Background, BackgroundType } from "./background";

export type ViewerSettings = {
  background: Background;
};

export function defaultViewerSettings(): ViewerSettings {
  return {
    background: {
      type: BackgroundType.SingleColor,
      color: new BABYLON.Color3(1, 1, 1),
    },
  };
}
