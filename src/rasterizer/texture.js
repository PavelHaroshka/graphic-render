export class Texture {
  constructor(width, height, pixels) {
    this.width = width;
    this.height = height;
    this.pixels = pixels;
  }

  sample(u, v) {
    u = Math.max(0, Math.min(1, u));
    v = Math.max(0, Math.min(1, v));

    const x = Math.min(this.width - 1, Math.floor(u * this.width));
    const y = Math.min(this.height - 1, Math.floor(v * this.height));

    const index = (y * this.width + x) * 4;

    return {
      x: this.pixels[index],
      y: this.pixels[index + 1],
      z: this.pixels[index + 2],
    };
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
