// reference: https://doc.babylonjs.com/features/featuresDeepDive/environment/backgroundMaterial
import * as BABYLON from "@babylonjs/core";

export enum BackgroundType {
  SingleColor = "single_color",
  Gradient = "gradient",
}

export type SingleColor = {
  type: BackgroundType.SingleColor;
  color: BABYLON.Color3;
};

export type GradientColors = {
  type: BackgroundType.Gradient;
  bottomColor: BABYLON.Color3;
  topColor: BABYLON.Color3;
};

export type Background = SingleColor | GradientColors;
