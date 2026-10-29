import * as THREE from 'three';
import { smoothstep } from './noise.js';

const unitBox = new THREE.BoxGeometry(1, 1, 1).toNonIndexed();
const tmpMatrix = new THREE.Matrix4();
const tmpQuat = new THREE.Quaternion();
const tmpEuler = new THREE.Euler();
const tmpColor = new THREE.Color();

// Merges static pieces into one vertex-colored mesh. Vertices near the ground are darkened
// so every object sits in a soft contact shadow, which the paint filter turns into a wash.
export class Batch {
  constructor(heightAt, rand) {
    this.heightAt = heightAt;
    this.rand = rand;
    this.positions = [];
    this.normals = [];
    this.colors = [];
  }

  add(geometry, matrix, color, jitter = 0.07) {
    const g = (geometry.index ? geometry.toNonIndexed() : geometry.clone()).applyMatrix4(matrix);
    const pos = g.attributes.position.array;
    const nor = g.attributes.normal.array;
    tmpColor.set(color);
    const k = 1 + (this.rand() - 0.5) * 2 * jitter;
    for (let i = 0; i < pos.length; i += 3) {
      const x = pos[i], y = pos[i + 1], z = pos[i + 2];
      const ao = 0.55 + 0.45 * smoothstep(0, 2.2, y - this.heightAt(x, z));
      this.positions.push(x, y, z);
      this.normals.push(nor[i], nor[i + 1], nor[i + 2]);
      this.colors.push(tmpColor.r * k * ao, tmpColor.g * k * ao, tmpColor.b * k * ao);
    }
    g.dispose();
  }

  box(x, y, z, w, h, d, color, rotY = 0, rotX = 0, rotZ = 0) {
    tmpQuat.setFromEuler(tmpEuler.set(rotX, rotY, rotZ, 'YXZ'));
    tmpMatrix.compose(new THREE.Vector3(x, y, z), tmpQuat, new THREE.Vector3(w, h, d));
    this.add(unitBox, tmpMatrix, color);
  }

  build(material) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(this.normals, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(this.colors, 3));
    geo.computeBoundingSphere();
    const mesh = new THREE.Mesh(geo, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }
}

// A local coordinate frame (position + yaw) for building structures in their own space.
export function frame(px, py, pz, yaw) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  return {
    yaw,
    toWorld(x, z) {
      return [px + x * c + z * s, pz - x * s + z * c];
    },
    box(batch, x, y, z, w, h, d, color, rotY = 0, rotX = 0, rotZ = 0) {
      const [wx, wz] = this.toWorld(x, z);
      batch.box(wx, py + y, wz, w, h, d, color, yaw + rotY, rotX, rotZ);
    },
    collider(x, z, hx, hz) {
      const [wx, wz] = this.toWorld(x, z);
      return { x: wx, z: wz, hx, hz, yaw };
    },
  };
}
