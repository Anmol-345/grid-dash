// Main scene setup
import * as THREE from "three";
import Light from "@/objects/Light";
import Target from "@/objects/Target";
import type { PhysicsSystem } from "@/features/game/physics";
import { TargetManager } from "@/features/game/targets";

export default class MainScene extends THREE.Scene {
  public targets: Target[] = []; // Legacy array kept for compatibility
  public targetManager: TargetManager; // New optimized target management
  private physicsSystem?: PhysicsSystem;
  private isEditorMode: boolean = false;
  private currentGroundCollider: { min: THREE.Vector3; max: THREE.Vector3 } | null = null;
  private currentRoomMesh: THREE.Group | null = null;

  private static roomPrototype = (() => {
    const group = new THREE.Group();

    // Add a solid prism for the ground: top face stays at y=0, volume extrudes downward
    const prismDepth = 50; // world units; extrude downward to make side faces 20x50
    const groundGeometry = new THREE.BoxGeometry(1, prismDepth, 1);
    // Use basic material for maximum performance (no lighting calculations)
    const groundMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff
    });
    const groundPrism = new THREE.Mesh(groundGeometry, groundMaterial);
    // Align top face with previous square ground level (world y ≈ -2)
    // room.position.y = -0.5, so local top must be -1.5
    // For a box centered at its position, topLocal = position.y + prismDepth/2
    // Solve position.y = topLocal - prismDepth/2 = -1.5 - prismDepth/2
    groundPrism.position.y = -1.5 - prismDepth / 2;
    groundPrism.castShadow = true;  // Enable shadow casting
    groundPrism.receiveShadow = true;
    group.add(groundPrism);

    return group;
  })();

  constructor(targets: Target[], physicsSystem?: PhysicsSystem, isEditorMode: boolean = false) {
    super();
    const white = new THREE.Color(0xffffff);
    this.background = white;
    this.targets = targets; // Legacy array kept for compatibility
    this.physicsSystem = physicsSystem;
    this.isEditorMode = isEditorMode;
    
    // Initialize target manager for optimized target generation
    this.targetManager = new TargetManager(this);
    
    const light = new Light();
    this.add(light);
  }

  public initPlayerRoom(x: number, z: number) {
    this.generateRoom(x, z);
  }

  private generateRoom(x: number, z: number) {
    // Skip room generation in editor mode
    if (this.isEditorMode) {
      console.log("[MainScene] Skipping generateRoom in editor mode");
      return;
    }
    console.log("[MainScene] Generating room at:", x, z);
    
    // Remove old room mesh if it exists
    if (this.currentRoomMesh) {
      console.log("[MainScene] 🗑️ Removing old room mesh");
      this.remove(this.currentRoomMesh);
    }
    
    const room = MainScene.roomPrototype.clone();
    room.position.set(x, -0.5, z);
    room.scale.set(20, 1, 20);
    this.add(room);
    this.currentRoomMesh = room;
    
    // Add physics collider for the ground (matches visual mesh position)
    if (this.physicsSystem) {
      // Remove old ground collider if it exists
      if (this.currentGroundCollider) {
        console.log("[MainScene] 🗑️ Removing old ground collider");
        this.physicsSystem.removeCollider(this.currentGroundCollider);
      }
      
      // Visual mesh is at Y:-0.5 with scale 1, so it goes from Y:-1 to Y:0
      const floorY = 0; // Top of the ground plane (matches visual ground surface)
      const floorThickness = 1; // Matches visual mesh thickness
      const floorSize = 20; // 20x20 room
      
      const groundCollider = {
        min: new THREE.Vector3(x - floorSize / 2, floorY - floorThickness, z - floorSize / 2),
        max: new THREE.Vector3(x + floorSize / 2, floorY, z + floorSize / 2),
      };
      
      this.physicsSystem.addCollider(groundCollider);
      this.currentGroundCollider = groundCollider;
      console.log("[MainScene] ✅ Ground physics added at (X:", x, "Z:", z, ") - top Y:", floorY);
    }
  }

  /**
   * Load scenario with optimized target generation
   * @param targetCount - Number of targets to spawn
   * @param halfSize - Use half-size targets (0.2 scale)
   * @param playerYaw - Player's yaw rotation in radians (targets spawn in front of player)
   */
  public loadScenario(targetCount: number, halfSize: boolean = false, playerYaw?: number) {
    const amount = Math.max(1, Math.floor(targetCount));
    const scale = halfSize ? 0.2 : 0.4;
    
    // Reset previous targets
    this.targetManager.resetAllTargets();
    
    // Generate new targets using optimized manager
    const roomX = 0;
    const roomZ = 0;
    
    const newTargets = this.targetManager.generateTargets(
      amount,
      roomX,
      roomZ,
      scale,
      undefined,
      playerYaw
    );
    
    // Update legacy targets array for compatibility with existing code
    this.targets = newTargets;
    
    console.log(`[MainScene] Loaded scenario with ${newTargets.length} targets`);
  }

  /**
   * Legacy method kept for backwards compatibility
   * @deprecated Use loadScenario() instead
   */
  public generateCubes(amount: number, roomCoordX: number, roomCoordZ: number, halfSize: boolean = false) {
    console.warn('[MainScene] generateCubes is deprecated, use loadScenario instead');
    this.loadScenario(amount, halfSize);
  }

  public update() {
    // No neighbors to update anymore
  }
}

