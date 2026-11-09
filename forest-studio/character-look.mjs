import {MathUtils} from './vendor/three.module.js';

// The Tripo atlas has one material. Smooth colour masks give skin, hair and cloth
// different responses without splitting the skinned mesh or adding draw calls.
export function refineCharacter(root, renderer) {
  root.traverse(object => {
    if (!object.isMesh) return;
    if (object.isSkinnedMesh && !object.userData.faceRefined) {
      const geometry = object.geometry.clone();
      geometry.computeBoundingBox();
      const positions = geometry.attributes.position, bounds = geometry.boundingBox;
      const height = bounds.max.y - bounds.min.y, smooth = MathUtils.smoothstep;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i), y = (positions.getY(i) - bounds.min.y) / height;
        const side = Math.abs(x), front = positions.getZ(i);
        // Only taper the lower cheek sides; keep eyes, lips, chin centre and rig intact.
        const weight = smooth(y, .75, .79) * (1 - smooth(y, .84, .88))
          * smooth(front, .025, .07) * smooth(side, .025, .065)
          * (1 - smooth(side, .10, .14));
        positions.setX(i, x * (1 - .025 * weight));
        const lipHollow = (1 - smooth(Math.abs(positions.getY(i) - 1.19), .003, .013))
          * (1 - smooth(side, .012, .028)) * smooth(front, .045, .065);
        positions.setZ(i, front + .0006 * lipHollow);
      }
      positions.needsUpdate = true;
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      object.geometry = geometry;
      object.userData.faceRefined = true;
    }
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (material.userData.characterLook) continue;
      material.userData.characterLook = true;
      for (const key of ['map', 'normalMap', 'roughnessMap']) {
        if (material[key]) material[key].anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      }
      material.onBeforeCompile = shader => {
        for (const chunk of ['map_fragment', 'roughnessmap_fragment', 'normal_fragment_maps']) {
          if (!shader.fragmentShader.includes(`#include <${chunk}>`)) throw new Error(`Character shader missing ${chunk}`);
        }
        shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
          #include <map_fragment>
          vec3 atlas = diffuseColor.rgb;
          float warmth = smoothstep(0.015, 0.075, atlas.r - atlas.g);
          float skin = warmth * smoothstep(0.11, 0.28, atlas.r) * smoothstep(0.035, 0.13, atlas.b);
          float hair = warmth * (1.0 - smoothstep(0.09, 0.24, atlas.r));
          float cloth = smoothstep(0.018, 0.06, atlas.g - atlas.b) * (1.0 - warmth) * smoothstep(0.03, 0.10, atlas.g) * (1.0 - skin);
          float linen = (1.0 - warmth) * smoothstep(0.35, 0.7, atlas.r) * (1.0 - cloth);
          // Slightly rose-neutral skin; keep the original painted eyes and freckles.
          diffuseColor.rgb = mix(atlas, atlas * vec3(1.04, 0.995, 1.035), skin);
          diffuseColor.rgb = mix(diffuseColor.rgb, atlas * vec3(0.86, 0.98, 1.08), cloth * 0.65);
          diffuseColor.rgb = mix(diffuseColor.rgb, atlas * vec3(0.98, 0.97, 0.94), linen * 0.35);
          diffuseColor.rgb = mix(diffuseColor.rgb, atlas * vec3(0.94, 0.96, 1.015), hair * 0.55);
        `).replace('#include <roughnessmap_fragment>', `
          #include <roughnessmap_fragment>
          roughnessFactor = mix(max(roughnessFactor, 0.78), 0.73, skin);
          roughnessFactor = mix(roughnessFactor, 0.55, hair);
        `).replace('#include <normal_fragment_maps>', `
          vec3 smoothSurfaceNormal = normal;
          #include <normal_fragment_maps>
          normal = normalize(mix(normal, smoothSurfaceNormal, min(0.85, skin * 0.82 + hair * 0.16 + cloth * 0.10)));
        `);
      };
      material.customProgramCacheKey = () => 'forest-character-skin-hair-cloth-v3';
      material.needsUpdate = true;
    }
  });
}
