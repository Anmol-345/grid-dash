import { GUI } from "lil-gui";

export default class MainGUI {
  gui: GUI;
  constructor() {
    this.gui = new GUI();
    this.gui.addFolder("Camera");
  }
}
