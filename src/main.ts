// main.ts
import "./style.css";

import { UI } from "@peasy-lib/peasy-ui";
import { Engine, DisplayMode, vec, TileMap, TileMapOptions } from "excalibur";
import { model, template } from "./UI/UI";
import { LevelMaker } from "./Lib/LevelMaker";
import { LeftPane } from "./Actors/LeftPane";
import { RightPane } from "./Actors/RightPane";

await UI.create(document.body, model, template).attached;

const game = new Engine({
  width: 800, // the width of the canvas
  height: 600, // the height of the canvas
  canvasElementId: "cnv", // the DOM canvas element ID, if you are providing your own
  displayMode: DisplayMode.FitScreen, // the display mode
  pixelArt: true,
});

await game.start();

let tmConfig: TileMapOptions = { name: "test", columns: 35, rows: 25, tileHeight: 16, tileWidth: 16 };
const myGraphNetwork = LevelMaker.createLevel(tmConfig);
let myTileMap = LevelMaker.createTileMap(myGraphNetwork, tmConfig);

game.add(new LeftPane(game, myTileMap));
game.add(new RightPane(game, myTileMap));
game.currentScene.camera.pos = vec(275, 200);
game.currentScene.camera.zoom = 1.0;
