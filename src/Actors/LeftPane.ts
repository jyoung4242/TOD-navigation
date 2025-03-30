import { ScreenElement, TileMap, vec, Screen, Actor, Vector } from "excalibur";

export class LeftPane extends ScreenElement {
  tilemap: TileMap;
  tilemapScale: Vector = vec(1, 1);
  constructor(engine: ex.Engine, tilemap: TileMap) {
    let sceneWidth = engine.screen.width; //The width of the scene.
    let sceneHeight = engine.screen.height; //The height of the scene.

    super({
      x: 0,
      y: 0,
      width: sceneWidth / 2,
      height: sceneHeight,
      anchor: vec(0, 0),
    });
    this.tilemap = tilemap;
    this.addChild(this.tilemap);
    this.tilemapScale = scaleTileMapToFit(this.tilemap, engine.screen);
    this.tilemap.pos = vec(0, sceneHeight / 4);
  }

  addParty(party: Actor) {
    this.addChild(party);
    party.scale = this.tilemapScale;
  }
}

function scaleTileMapToFit(tilemap: TileMap, screen: Screen): Vector {
  let tileMapWidth = tilemap.tileWidth * tilemap.columns;
  let screenWidth = screen.width;

  // reduce tilemap width to fit screen width
  let scale = tileMapWidth / screenWidth;
  tilemap.scale = vec(scale, scale);
  return tilemap.scale;
}
