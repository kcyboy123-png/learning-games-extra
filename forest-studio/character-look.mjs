// The Tripo atlas has one material. Smooth colour masks give skin, hair and cloth
// different responses without splitting the skinned mesh or adding draw calls.
export function refineCharacter(root, renderer) {
  root.traverse(object => {
    if (!object.isMesh) return;
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
          // Slightly rose-neutral skin; keep the original painted eyes and freckles.
          diffuseColor.rgb = mix(atlas, atlas * vec3(1.035, 0.985, 1.025), skin);
        `).replace('#include <roughnessmap_fragment>', `
          #include <roughnessmap_fragment>
          roughnessFactor = mix(max(roughnessFactor, 0.78), 0.57, skin);
          roughnessFactor = mix(roughnessFactor, 0.43, hair);
        `).replace('#include <normal_fragment_maps>', `
          vec3 smoothSurfaceNormal = normal;
          #include <normal_fragment_maps>
          normal = normalize(mix(normal, smoothSurfaceNormal, skin * 0.55));
        `);
      };
      material.customProgramCacheKey = () => 'forest-character-skin-hair-cloth-v1';
      material.needsUpdate = true;
    }
  });
}
