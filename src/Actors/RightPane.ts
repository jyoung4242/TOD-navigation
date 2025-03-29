import { Canvas, Color, ScreenElement, TileMap, vec } from "excalibur";

export class RightPane extends ScreenElement {
  tilemap: TileMap;
  constructor(engine: ex.Engine, tilemap: TileMap) {
    super({
      x: engine.screen.width / 2,
      y: engine.screen.height / 4,
      width: engine.screen.width / 2,
      height: engine.screen.height,
      anchor: vec(0, 0),
    });
    this.tilemap = tilemap;
    const canvasWidth = engine.screen.width / 2;
    const canvasHeight = this.tilemap.height;

    const threeDView = new Canvas({
      draw: (ctx: CanvasRenderingContext2D) => {
        //draw white background of size of canvas
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      },
      width: canvasWidth,
      height: canvasHeight,
    });

    this.graphics.use(threeDView);
  }
}
