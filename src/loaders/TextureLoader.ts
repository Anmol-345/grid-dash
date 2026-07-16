// Texture Loader wrapper
import * as THREE from 'three';

export default class TextureLoader {
  loader: THREE.TextureLoader;
  constructor() {
    this.loader = new THREE.TextureLoader();
  }
  load(url: string): THREE.Texture {
    return this.loader.load(url);
  }
}
