import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";

class ToolBarSettings {
  constructor(public iconSize: string = "32px", public scale_f: number = 4.0) {}
}

/**
 * FIXME: make it singleton
 */
export class ToolBar {
  private _panel: GUI.StackPanel;
  private _settings = new ToolBarSettings();

  constructor(private _parent: GUI.AdvancedDynamicTexture) {
    this._panel = new GUI.StackPanel("toolbar");
    this._panel.isVertical = false;
    this._panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    this._panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    this._parent.addControl(this._panel);
  }

  addItem(name: string, iconUrl: string) {
    const button = GUI.Button.CreateImageOnlyButton(name, iconUrl);
    button.width = this._settings.iconSize;
    button.height = this._settings.iconSize;
    if (button.children[0] instanceof GUI.Image) {
      const img = button.children[0];
      const scale_f = this._settings.scale_f;
      img.onSVGAttributesComputedObservable.add(() => {
        button.width = String(img.sourceWidth * scale_f) + "px";
        button.height = String(img.sourceHeight * scale_f) + "px";
      });
      button.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      button.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
      this._panel.addControl(button);
    } else {
      console.error(
        `failed to add item into toolbar (name = ${name}, url = ${iconUrl})`
      );
    }
  }
}
