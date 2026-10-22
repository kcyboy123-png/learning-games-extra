window.STAR_HERO_ATLAS={"frames": [[{"rect": [114, 9, 132, 251]}, {"rect": [354, 8, 135, 252]}, {"rect": [586, 8, 130, 252]}, {"rect": [822, 9, 129, 251]}, {"rect": [1056, 8, 129, 252]}, {"rect": [1290, 8, 131, 252]}], [{"rect": [110, 262, 138, 249]}, {"rect": [349, 262, 132, 251]}, {"rect": [582, 262, 133, 251]}, {"rect": [816, 263, 132, 248]}, {"rect": [1054, 262, 131, 252]}, {"rect": [1285, 262, 136, 251]}], [{"rect": [101, 513, 148, 246]}, {"rect": [344, 515, 137, 244]}, {"rect": [584, 515, 120, 245]}, {"rect": [809, 513, 149, 246]}, {"rect": [1048, 516, 144, 246]}, {"rect": [1288, 515, 120, 246]}], [{"rect": [110, 762, 133, 248]}, {"rect": [352, 762, 131, 249]}, {"rect": [584, 762, 132, 242]}, {"rect": [815, 762, 142, 248]}, {"rect": [1058, 764, 134, 247]}, {"rect": [1289, 763, 133, 241]}]]};
// v16: rows 1-3 start 2px lower (same bottom edge). Each row previously began on the exact
// scanline where the row above ended, so the neighbouring frame's boot soles were cropped
// into the top of the sprite and showed as thin dark lines beside the head. Bitmap unchanged.
// v16 fix: back-facing frames 0, 1 and 3 start one more scanline lower (y 762) because the
// review found residual boot pixels (alpha 130-153, above alphaTest .5) on y 761 at
// x 205-208, 438-442 and 915-919. Frames 2, 4, 5 already begin at or below y 762.
