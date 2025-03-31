// main.ts
import "./style.css";

import { UI } from "@peasy-lib/peasy-ui";
import { Engine, DisplayMode, vec, TileMapOptions } from "excalibur";
import { model, template } from "./UI/UI";
import { LevelMaker } from "./Lib/LevelMaker";
import { LeftPane } from "./Actors/LeftPane";
import { RightPane } from "./Actors/RightPane";
import { Party } from "./Actors/Party";
import { loader } from "./resources";

await UI.create(document.body, model, template).attached;

const game = new Engine({
  width: 800, // the width of the canvas
  height: 600, // the height of the canvas
  canvasElementId: "cnv", // the DOM canvas element ID, if you are providing your own
  displayMode: DisplayMode.FitScreen, // the display mode
  pixelArt: true,
  suppressPlayButton: true,
  pixelRatio: 2.0,
});

game.start(loader);

let tmConfig: TileMapOptions = { name: "test", columns: 35, rows: 25, tileHeight: 16, tileWidth: 16 };
const myGraphNetwork = LevelMaker.createLevel(tmConfig);
console.log("myGraphNetwork", myGraphNetwork);

let myTileMap = LevelMaker.createTileMap(myGraphNetwork, tmConfig);
const party = new Party(myTileMap, myGraphNetwork);
let leftPane = new LeftPane(game, myTileMap);
game.add(leftPane);
game.add(new RightPane(game, myTileMap));
leftPane.addParty(party);

let startingPoint = myGraphNetwork.getStartingTileData();
console.log("startingPoint", startingPoint);

if (startingPoint) {
  party.currentTile = { x: startingPoint.position.x, y: startingPoint.position.y };
}

game.currentScene.camera.pos = vec(275, 200);
game.currentScene.camera.zoom = 1.0;
