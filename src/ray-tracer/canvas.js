export class Canvas {
  ctx = null;
  config = null;

  constructor(config) {
    this.config = config;

    const element = document.getElementById(config.elementId);
    console.log(element)
    this.ctx = element.getContext("2d");

    element.height = config.screenHeight;
    element.width = config.screenWidth;
  }

  clear() {
    this.ctx.fillStyle = "rgb(0,0,0)";
    this.ctx.fillRect(0, 0, this.config.screenHeight, this.config.screenWidth);
  }
}
