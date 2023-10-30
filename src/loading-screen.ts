import * as BABYLON from "@babylonjs/core";

export class LoadingScreen implements BABYLON.ILoadingScreen {
  // reference: https://doc.babylonjs.com/features/featuresDeepDive/scene/customLoadingScreen
  loadingUIBackgroundColor: string = "#000000";
  private _loadingDiv: HTMLDivElement;
  private _logoDiv?: HTMLDivElement;

  constructor(public loadingUIText: string) {
    const loadingUICss = document.createElement("style");
    loadingUICss.type = "text/css";
    loadingUICss.innerHTML = `
      #loadingDiv{
        position: fixed;
        display: block;
        width: 100%;
        height: 100%;
        color: black;
        font-size: 50px;
        text-align: center;
        // background-color: #ffffff;
        top: 0;
        left: 0;
        // right: 0;
        // bottom: 0;
        background-color: rgba(0,0,0,0.5);
        z-index: 9999;
      }
      #loadingDiv img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translateX(-50%) translateY(-50%);
      }
      `;
    document.getElementsByTagName("head")[0].appendChild(loadingUICss);

    // set up div element
    this._loadingDiv = document.createElement("div");
    this._loadingDiv.id = "loadingDiv";

    // set up img element
    // Fix me to set width and height automatically
    const img = document.createElement("img");
    img.src = "./assets/logo.png";
    img.alt = "Core Concept Technologies Inc.";
    img.width = 960;
    img.height = 196;
    this._loadingDiv.appendChild(img);

    document.body.appendChild(this._loadingDiv);
  }

  displayLoadingUI() {
    this._loadingDiv.style.display = "block";
  }

  public hideLoadingUI() {
    this._loadingDiv.style.display = "none";
  }
}
