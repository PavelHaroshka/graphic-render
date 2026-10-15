export class Texture {
  constructor(width, height, pixels) {
    this.width = width;
    this.height = height;
    this.pixels = pixels;
    this.mipLevels = this.generateMipLevels();
  }

  getPixel(x, y) {
    const index = (y * this.width + x) * 4;
    return {
      x: this.pixels[index],
      y: this.pixels[index + 1],
      z: this.pixels[index + 2],
    };
  }

  clampUV(u, v) {
    return {
      u: Math.max(0, Math.min(1, u)),
      v: Math.max(0, Math.min(1, v)),
    };
  }

  sample(u, v) {
    ({ u, v } = this.clampUV(u, v));

    const x = Math.round(u * (this.width - 1));
    const y = Math.round(v * (this.height - 1));

    return this.getPixel(x, y);
  }

  sampleTrilinear(u, v, level = 0) {
    const maxLevel = this.mipLevels.length - 1;

    level = Math.max(0, Math.min(maxLevel, level));

    const lowerLevel = Math.floor(level);
    const upperLevel = Math.min(maxLevel, lowerLevel + 1);

    const blend = level - lowerLevel;

    const lowerColor = this.sampleLevelBilinear(u, v, lowerLevel);

    const upperColor = this.sampleLevelBilinear(u, v, upperLevel);

    return {
      x: lowerColor.x + (upperColor.x - lowerColor.x) * blend,
      y: lowerColor.y + (upperColor.y - lowerColor.y) * blend,
      z: lowerColor.z + (upperColor.z - lowerColor.z) * blend,
    };
  }

  sampleLevelBilinear(u, v, level = 0) {
    ({ u, v } = this.clampUV(u, v));

    const mip =
      this.mipLevels[
        Math.max(0, Math.min(this.mipLevels.length - 1, Math.floor(level)))
      ];

    const { width, height, pixels } = mip;

    const x = u * (width - 1);
    const y = v * (height - 1);

    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = Math.min(x0 + 1, width - 1);
    const y1 = Math.min(y0 + 1, height - 1);

    const s = x - x0;
    const t = y - y0;

    const getPixel = (px, py) => {
      const index = (py * width + px) * 4;

      return {
        x: pixels[index],
        y: pixels[index + 1],
        z: pixels[index + 2],
      };
    };

    const c00 = getPixel(x0, y0);
    const c10 = getPixel(x1, y0);
    const c01 = getPixel(x0, y1);
    const c11 = getPixel(x1, y1);

    const lerp = (a, b, amount) => a * (1 - amount) + b * amount;

    const top = {
      x: lerp(c00.x, c10.x, s),
      y: lerp(c00.y, c10.y, s),
      z: lerp(c00.z, c10.z, s),
    };

    const bottom = {
      x: lerp(c01.x, c11.x, s),
      y: lerp(c01.y, c11.y, s),
      z: lerp(c01.z, c11.z, s),
    };

    return {
      x: lerp(top.x, bottom.x, t),
      y: lerp(top.y, bottom.y, t),
      z: lerp(top.z, bottom.z, t),
    };
  }

  generateMipLevels() {
    const levels = [
      {
        width: this.width,
        height: this.height,
        pixels: this.pixels,
      },
    ];

    let current = levels[0];

    while (current.width > 1 || current.height > 1) {
      const width = Math.max(1, Math.ceil(current.width / 2));
      const height = Math.max(1, Math.ceil(current.height / 2));

      const pixels = new Uint8ClampedArray(width * height * 4);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const startX = x * 2;
          const startY = y * 2;

          const sums = [0, 0, 0, 0];
          let count = 0;

          for (let dy = 0; dy < 2; dy++) {
            for (let dx = 0; dx < 2; dx++) {
              const sourceX = startX + dx;
              const sourceY = startY + dy;

              if (sourceX >= current.width || sourceY >= current.height) {
                continue;
              }

              const sourceIndex = (sourceY * current.width + sourceX) * 4;

              for (let channel = 0; channel < 4; channel++) {
                sums[channel] += current.pixels[sourceIndex + channel];
              }

              count++;
            }
          }

          const targetIndex = (y * width + x) * 4;

          for (let channel = 0; channel < 4; channel++) {
            pixels[targetIndex + channel] = sums[channel] / count;
          }
        }
      }

      current = { width, height, pixels };
      levels.push(current);
    }

    return levels;
  }
}

export const loadTexture = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const ctx = canvas.getContext("2d", {
        willReadFrequently: true,
      });

      ctx.drawImage(image, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      resolve(new Texture(canvas.width, canvas.height, imageData.data));
    };

    image.onerror = () => reject(new Error(`Failed to load texture: ${src}`));
    image.src = src;
  });
