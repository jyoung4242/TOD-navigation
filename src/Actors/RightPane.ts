import { Canvas, Color, ScreenElement, TileMap, vec } from "excalibur";
import { GraphNetwork, Node, tileType } from "../Lib/LevelMaker";
import { Resources } from "../resources";

let drawRoomFlag: boolean = false;

const COLOR_CEILING = "#777";
const COLOR_FLOOR = "#555";
const COLOR_SIDEWALL = "#888";
const COLOR_ROOMWALL = "black";
const COLOR_LINES = "black";
const COLOR_DOOR = "#333";
const COLOR_HALLWAY = "white";

const drawingData = {
  currentCoords: { x: 0, y: 0 },
  directionFacing: "up" as "up" | "down" | "left" | "right",
  graph: null as GraphNetwork | null,
  roomType: null as keyof typeof tileType | null,
};

const zone4data = {
  coords: { x: 0, y: 0 },
  width: 0,
  height: 0,
  doorCoords: { x: 0, y: 0 },
  doorwidth: 0,
  doorheight: 0,
  fountainCoords: { x: 0, y: 0 },
  fountainwidth: 0,
  fountainheight: 0,
};

const zone3data = {
  coords: { x: 0, y: 0 },
  width: 0,
  height: 0,
  endingCoords: { x: 0, y: 0 },
  endingwidth: 0,
  endingheight: 0,
  doorCoords: { x: 0, y: 0 },
  doorwidth: 0,
  doorheight: 0,
  fountainCoords: { x: 0, y: 0 },
  fountainwidth: 0,
  fountainheight: 0,
};

const zone2data = {
  coords: { x: 0, y: 0 },
  width: 0,
  height: 0,
  doorCoords: { x: 0, y: 0 },
  doorwidth: 0,
  doorheight: 0,
  fountainCoords: { x: 0, y: 0 },
  fountainwidth: 0,
  fountainheight: 0,
  endingCoords: { x: 0, y: 0 },
  endingwidth: 0,
  endingheight: 0,
};

const zone1data = {
  coords: { x: 0, y: 0 },
  width: 0,
  height: 0,
  doorCoords: { x: 0, y: 0 },
  doorwidth: 0,
  doorheight: 0,
  fountainCoords: { x: 0, y: 0 },
  fountainwidth: 0,
  fountainheight: 0,
};

const zone0data = {
  coords: { x: 0, y: 0 },
  width: 0,
  height: 0,
  doorCoords: { x: 0, y: 0 },
  doorwidth: 0,
  doorheight: 0,
  fountainCoords: { x: 0, y: 0 },
  fountainwidth: 0,
  fountainheight: 0,
};

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
    const canvasCenterX = canvasWidth / 2;
    const canvasCenterY = canvasHeight / 2;

    setZoneDefaults(canvasCenterX, canvasCenterY, canvasWidth, canvasHeight);

    const threeDView = new Canvas({
      draw: (ctx: CanvasRenderingContext2D) => {
        //draw white background of size of canvas
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        if (drawRoomFlag) {
          //draw Room
          drawRoom(ctx, canvasWidth, canvasHeight);
        } else {
          let zone = 4;
          let { directionFacing, currentCoords, graph } = drawingData;
          if (!graph) {
            return;
          }

          // get target coordinates
          let zoneCoords = getTargetCoords(currentCoords, directionFacing, graph, zone);

          //check validity of new coords
          if (tileCoordsValid(graph, zoneCoords)) {
            const zoneData = drawZones(ctx, canvasWidth, canvasHeight);
            drawZone(ctx, zoneData, zoneCoords, graph);

            /*drawZone4(ctx, zoneCoords, graph);
            zone = 3;
            zoneCoords = getTargetCoords(currentCoords, directionFacing, graph, zone);
            drawZone3(ctx, zoneCoords, graph);
            drawZone2(ctx, zoneCoords, graph);
            drawZone1(ctx, zoneCoords, graph);
            drawZone0(ctx, zoneCoords, graph);*/
          }
        }
      },
      width: canvasWidth,
      height: canvasHeight,
    });

    this.graphics.use(threeDView);
  }
}

export function clearRoomFlag(
  directionFacing: "up" | "down" | "left" | "right",
  currentTile: { x: number; y: number },
  graph: GraphNetwork
) {
  drawRoomFlag = false;
  drawingData.directionFacing = directionFacing;
  drawingData.currentCoords = currentTile;
  drawingData.graph = graph;
  drawingData.roomType = null;
}

export function setRoomFlag(room: Node) {
  drawRoomFlag = true;
  drawingData.roomType = room.type;
}

function drawZone2(ctx: CanvasRenderingContext2D, coords: { x: number; y: number }, graph: GraphNetwork) {
  function drawWall(ctx: CanvasRenderingContext2D) {}
  function drawDoor(ctx: CanvasRenderingContext2D) {}
  function drawFountain(ctx: CanvasRenderingContext2D) {}
  function drawHallway(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "black";
    ctx.strokeStyle = "red";
    ctx.moveTo(zone2data.coords.x, zone2data.coords.y);
    ctx.lineTo(zone2data.endingCoords.x, zone2data.endingCoords.y);
    /* ctx.moveTo(zone2data.coords.x + zone2data.width, zone2data.coords.y);
    ctx.lineTo(zone2data.endingCoords.x + zone2data.endingwidth, zone2data.endingCoords.y);
    ctx.moveTo(zone2data.coords.x, zone2data.coords.y + zone2data.height);
    ctx.lineTo(zone2data.endingCoords.x, zone2data.endingCoords.y + zone2data.endingheight);
    ctx.moveTo(zone2data.coords.x + zone2data.width, zone2data.coords.y + zone2data.height);
    ctx.lineTo(zone2data.endingCoords.x + zone2data.endingwidth, zone2data.endingCoords.y + zone2data.endingheight); */
    ctx.stroke();
  }
  function drawHallLeft(ctx: CanvasRenderingContext2D) {}
  function drawHallRight(ctx: CanvasRenderingContext2D) {}

  drawHallway(ctx);
}

function drawZone1(ctx: CanvasRenderingContext2D, coords: { x: number; y: number }, graph: GraphNetwork) {}

function drawZone0(ctx: CanvasRenderingContext2D, coords: { x: number; y: number }, graph: GraphNetwork) {}

function drawRoom(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
  const inset = 0.1; // 10% inset
  const borderWidth = 5; // Adjust for thickness

  const x = canvasWidth * inset;
  const y = canvasHeight * inset;
  const width = canvasWidth * (1 - inset * 2);
  const height = canvasHeight * (1 - inset * 2) - borderWidth; // Adjust for border

  // Draw filled rectangle
  ctx.fillStyle = "white";
  ctx.fillRect(x, y, width, height);

  // Draw border
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = "black";
  ctx.strokeRect(x, y, width, height);
}

function tileCoordsValid(graph: GraphNetwork, tilecoords: { x: number; y: number }): boolean {
  return tilecoords.x > 0 || tilecoords.y > 0 || tilecoords.x < graph.width || tilecoords.y < graph.height;
}

function getTargetCoords(
  coords: { x: number; y: number },
  directionFacing: "up" | "down" | "left" | "right",
  graph: GraphNetwork,
  distance: number
): { x: number; y: number } {
  switch (directionFacing) {
    case "up":
      return { x: coords.x, y: coords.y - distance };
    case "down":
      return { x: coords.x, y: coords.y + distance };
    case "left":
      return { x: coords.x - distance, y: coords.y };
    case "right":
      return { x: coords.x + distance, y: coords.y };
  }
}

function setZoneDefaults(canvasCenterX: number, canvasCenterY: number, canvasWidth: number, canvasHeight: number) {
  zone4data.coords = { x: canvasCenterX - canvasWidth / 24, y: canvasCenterY - canvasHeight / 24 };
  zone4data.width = canvasWidth / 12;
  zone4data.height = canvasHeight / 12;
  zone4data.doorCoords = { x: canvasCenterX - canvasWidth / 96, y: canvasCenterY - canvasHeight / 96 };
  zone4data.doorwidth = canvasWidth / 48;
  zone4data.doorheight = canvasHeight / 12;
  zone4data.fountainCoords = { x: canvasCenterX - 8, y: canvasCenterY - 3 };
  zone4data.fountainwidth = 16;
  zone4data.fountainheight = 16;

  zone3data.coords = { x: canvasCenterX - 48, y: canvasCenterY - 48 };
  zone3data.width = 96;
  zone3data.height = 96;
  zone3data.doorCoords = { x: canvasCenterX - canvasWidth / 96, y: canvasCenterY - canvasHeight / 96 };
  zone3data.doorwidth = canvasWidth / 48;
  zone3data.doorheight = canvasHeight / 12;
  zone3data.fountainCoords = { x: canvasCenterX - 8, y: canvasCenterY - 3 };
  zone3data.fountainwidth = 16;
  zone3data.fountainheight = 16;
  zone3data.endingCoords = { x: zone4data.coords.x, y: zone4data.coords.y };
  zone3data.endingwidth = canvasWidth / 12;
  zone3data.endingheight = canvasHeight / 12;

  zone2data.coords = { x: canvasCenterX - 96, y: canvasCenterY - 96 };
  zone2data.width = 96 * 2;
  zone2data.height = 96 * 2;
  zone2data.doorCoords = { x: canvasCenterX - canvasWidth / 96, y: canvasCenterY - canvasHeight / 96 };
  zone2data.doorwidth = canvasWidth / 48;
  zone2data.doorheight = canvasHeight / 12;
  zone2data.fountainCoords = { x: canvasCenterX - 8, y: canvasCenterY - 3 };
  zone2data.fountainwidth = 16;
  zone2data.fountainheight = 16;
  zone2data.endingCoords = { x: zone3data.coords.x, y: zone3data.coords.y };
  zone2data.endingwidth = canvasWidth / 12;
  zone2data.endingheight = canvasHeight / 12;
}

function drawZones(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number
): {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
}[] {
  // Vanishing point (center of the canvas)
  const VP = { x: canvasWidth / 2, y: canvasHeight / 2 };

  // Corner points
  const corners = [
    { x: 0, y: 0 }, // Top-left
    { x: canvasWidth, y: 0 }, // Top-right
    { x: canvasWidth, y: canvasHeight }, // Bottom-right
    { x: 0, y: canvasHeight }, // Bottom-left
  ];

  const ZONES = 5; // Number of depth zones

  function interpolatePoint(start: { x: number; y: number }, end: { x: number; y: number }, t: number) {
    return {
      x: start.x + (end.x - start.x) * t,
      y: start.y + (end.y - start.y) * t,
    };
  }

  // Function to get the zone points
  function getZones() {
    let zones: { topLeft: any; topRight: any; bottomRight: any; bottomLeft: any }[] = [];

    for (let i = 0; i <= ZONES; i++) {
      const t = i / ZONES;
      zones.push({
        topLeft: interpolatePoint(corners[0], VP, t),
        topRight: interpolatePoint(corners[1], VP, t),
        bottomRight: interpolatePoint(corners[2], VP, t),
        bottomLeft: interpolatePoint(corners[3], VP, t),
      });
    }
    return zones;
  }

  const zones = getZones();

  for (let i = 0; i < ZONES; i++) {
    const { topLeft, topRight, bottomRight, bottomLeft } = zones[i];
    const { topLeft: nextTL, topRight: nextTR, bottomRight: nextBR, bottomLeft: nextBL } = zones[i + 1];

    // Alternate colors for clarity
    /* ctx.fillStyle = i % 2 === 0 ? "#555" : "#777";

    ctx.beginPath();
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.lineTo(topRight.x, topRight.y);
    ctx.lineTo(nextTR.x, nextTR.y);
    ctx.lineTo(nextTL.x, nextTL.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(bottomLeft.x, bottomLeft.y);
    ctx.lineTo(bottomRight.x, bottomRight.y);
    ctx.lineTo(nextBR.x, nextBR.y);
    ctx.lineTo(nextBL.x, nextBL.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke(); */
  }

  return zones;
}

type DrawingBoundingBox = {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
};

function drawZone3(
  ctx: CanvasRenderingContext2D,
  coords: { x: number; y: number },
  graph: GraphNetwork,
  zone4data: {
    bottomLeft: { x: number; y: number };
    bottomRight: { x: number; y: number };
    topLeft: { x: number; y: number };
    topRight: { x: number; y: number };
  },
  zone5data: {
    bottomLeft: { x: number; y: number };
    bottomRight: { x: number; y: number };
    topLeft: { x: number; y: number };
    topRight: { x: number; y: number };
  }
) {
  function drawWall(ctx: CanvasRenderingContext2D) {}
  function drawDoor(ctx: CanvasRenderingContext2D) {}
  function drawFountain(ctx: CanvasRenderingContext2D) {}
  function drawHallway(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";
    ctx.moveTo(zone3data.coords.x, zone3data.coords.y);
    ctx.lineTo(zone3data.endingCoords.x, zone3data.endingCoords.y);
    ctx.moveTo(zone3data.coords.x + zone3data.width, zone3data.coords.y);
    ctx.lineTo(zone3data.endingCoords.x + zone3data.endingwidth, zone3data.endingCoords.y);
    ctx.moveTo(zone3data.coords.x, zone3data.coords.y + zone3data.height);
    ctx.lineTo(zone3data.endingCoords.x, zone3data.endingCoords.y + zone3data.endingheight);
    ctx.moveTo(zone3data.coords.x + zone3data.width, zone3data.coords.y + zone3data.height);
    ctx.lineTo(zone3data.endingCoords.x + zone3data.endingwidth, zone3data.endingCoords.y + zone3data.endingheight);
    //ctx.stroke();
  }
  function drawHallLeft(ctx: CanvasRenderingContext2D) {}
  function drawHallRight(ctx: CanvasRenderingContext2D) {}

  drawHallway(ctx);
}

function drawZone4(
  ctx: CanvasRenderingContext2D,
  coords: { x: number; y: number },
  graph: GraphNetwork,
  zone4data: {
    bottomLeft: { x: number; y: number };
    bottomRight: { x: number; y: number };
    topLeft: { x: number; y: number };
    topRight: { x: number; y: number };
  },
  zone5data: {
    bottomLeft: { x: number; y: number };
    bottomRight: { x: number; y: number };
    topLeft: { x: number; y: number };
    topRight: { x: number; y: number };
  }
) {
  /*
  function drawWall(ctx: CanvasRenderingContext2D) {
    console.log("zone4data", zone4data);
    const wallwidth = zone4data.topRight.x - zone4data.topLeft.x;
    const wallheight = zone4data.bottomLeft.y - zone4data.topLeft.y;
    console.log("wallwidth", wallwidth, "wallheight", wallheight);

    ctx.fillStyle = COLOR_ROOMWALL;
    ctx.fillRect(zone4data.topLeft.x, zone4data.topLeft.y, wallwidth, wallheight);
  }
  function drawDoor(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = COLOR_DOOR;
    const doorwidth = 16;
    const doorheight = 32;
    const doorCoords = {
      x: zone4data.topLeft.x + (zone4data.topRight.x - zone4data.topLeft.x) / 2 - doorwidth / 2,
      y: zone4data.bottomLeft.y - doorheight,
    };

    ctx.fillRect(doorCoords.x, doorCoords.y, doorwidth, doorheight);
  }
 
  function drawFountain(ctx: CanvasRenderingContext2D) {
    let fountainwidth = 24;
    let fountainheight = 24;
    let fountainCoords = {
      x: zone4data.topLeft.x + (zone4data.topRight.x - zone4data.topLeft.x) / 2 - fountainwidth / 2,
      y: zone4data.bottomLeft.y + 2 - fountainheight,
    };
    ctx.drawImage(Resources.fountain.image, 0, 0, 24, 24, fountainCoords.x, fountainCoords.y, fountainwidth, fountainheight);
  }
*/
  function isFountainDeadEnd(node: Node): boolean {
    return node.numberEdges == 1 && node.type == tileType.FOUNTAIN;
  }

  // first determine if wall

  let isWall = graph.getNodeByCoords(coords.x, coords.y);
  if (
    isWall &&
    (isWall.type == tileType.ROOM ||
      isWall.type == tileType.STAIRDOWN ||
      isWall.type == tileType.STAIRUP ||
      isWall.type == tileType.STORE)
  ) {
    drawWall(ctx, zone4data, zone5data);
    drawDoor(ctx, zone4data, zone5data);
  } else if (isWall && isFountainDeadEnd(isWall)) {
    drawWall(ctx, zone4data, zone5data);
    drawFountain(ctx, zone4data, zone5data);
  } else {
    //hallway
    //drawHallLeft(ctx, zone4data, zone5data);
    //drawHallway(ctx, zone4data, zone5data);
    //drawHallRight(ctx, zone4data, zone5data);
    drawCross(ctx, zone4data, zone5data);
  }
}

//zone, index, zoneCoords, graph
function drawZone(ctx: CanvasRenderingContext2D, zonedata: any, zoneCoords: any, graph: GraphNetwork) {
  //zone 0 is outer bounding box
  //zone 1 is closest to player
  //zone 2 is one tile away
  //zone 3 is two tiles away
  //zone 4 is three tiles away
  //zone 5 is vanishing point

  drawZone4(ctx, zoneCoords, graph, zonedata[4], zonedata[5]);
  drawZone3(ctx, zoneCoords, graph, zonedata[3], zonedata[4]);
}

//discrete drawing utility functions
function drawHallway(ctx: CanvasRenderingContext2D, start: DrawingBoundingBox, end: DrawingBoundingBox) {
  //draw upper triangle
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR_LINES;
  ctx.beginPath();
  ctx.moveTo(start.topLeft.x, start.topLeft.y);
  ctx.lineTo(end.topLeft.x, end.topLeft.y);
  ctx.lineTo(end.topRight.x, end.topRight.y);
  ctx.lineTo(start.topRight.x, start.topRight.y);
  ctx.closePath();
  ctx.fillStyle = COLOR_CEILING;
  ctx.fill();
  ctx.stroke();

  // Stroke the third line separately with COLOR_CEILING
  ctx.strokeStyle = COLOR_CEILING;
  ctx.beginPath();
  ctx.moveTo(start.topLeft.x, start.topLeft.y);
  ctx.lineTo(start.topRight.x, start.topRight.y);
  ctx.stroke();

  //draw lower triangle
  ctx.strokeStyle = COLOR_LINES;
  ctx.beginPath();
  ctx.moveTo(start.bottomLeft.x, start.bottomLeft.y);
  ctx.lineTo(end.bottomLeft.x, end.bottomLeft.y);
  ctx.lineTo(end.bottomRight.x, end.bottomRight.y);
  ctx.lineTo(start.bottomRight.x, start.bottomRight.y);
  ctx.lineTo(start.bottomLeft.x, start.bottomLeft.y);
  ctx.closePath();
  ctx.fillStyle = COLOR_FLOOR;
  ctx.fill();
  ctx.stroke();

  // Stroke the third line separately with COLOR_FLOOR
  ctx.strokeStyle = COLOR_FLOOR;
  ctx.beginPath();
  ctx.moveTo(start.bottomLeft.x, start.bottomLeft.y);
  ctx.lineTo(start.bottomRight.x, start.bottomRight.y);
  ctx.closePath();
  ctx.stroke();
}
function drawHallLeft(ctx: CanvasRenderingContext2D, start: DrawingBoundingBox, end: DrawingBoundingBox) {
  const overallW = start.bottomRight.x - start.bottomLeft.x;
  const overallH = start.bottomRight.y - start.topRight.y;
  const oneThirdW = overallW / 3;
  const oneSixthW = overallW / 6;
  const oneThirdH = overallH / 3;
  const oneSixthH = overallH / 6;

  const hallwayBoundingBox = {
    topleft: { x: start.topLeft.x + oneSixthW, y: start.topLeft.y + oneThirdH },
    topright: { x: start.topLeft.x + oneThirdW, y: start.topLeft.y + oneThirdH },
    bottomleft: { x: start.topLeft.x + oneSixthW, y: start.topLeft.y + oneThirdH + oneThirdH },
    bottomright: { x: start.topLeft.x + oneThirdW, y: start.topLeft.y + oneThirdH + oneThirdH },
    width: oneSixthW,
    height: oneThirdH,
  };

  const nearHallwayBoundingBox = {
    topleft: { x: start.topLeft.x, y: start.topLeft.y },
    topright: { x: start.topLeft.x + oneSixthW, y: start.topLeft.y + oneSixthH },
    bottomleft: { x: start.bottomLeft.x, y: start.bottomLeft.y },
    bottomright: { x: start.topLeft.x + oneSixthW, y: start.bottomLeft.y - oneSixthH },
  };

  //draw far hall box
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR_LINES;
  ctx.fillStyle = COLOR_SIDEWALL;
  ctx.fillRect(hallwayBoundingBox.topleft.x, hallwayBoundingBox.topleft.y, hallwayBoundingBox.width, hallwayBoundingBox.height);
  ctx.strokeRect(hallwayBoundingBox.topleft.x, hallwayBoundingBox.topleft.y, hallwayBoundingBox.width, hallwayBoundingBox.height);

  //draw near hall trapezoid
  ctx.beginPath();
  ctx.moveTo(nearHallwayBoundingBox.topleft.x, nearHallwayBoundingBox.topleft.y);
  ctx.lineTo(nearHallwayBoundingBox.topright.x, nearHallwayBoundingBox.topright.y);
  ctx.lineTo(nearHallwayBoundingBox.bottomright.x, nearHallwayBoundingBox.bottomright.y);
  ctx.lineTo(nearHallwayBoundingBox.bottomleft.x, nearHallwayBoundingBox.bottomleft.y);
  ctx.lineTo(nearHallwayBoundingBox.topleft.x, nearHallwayBoundingBox.topleft.y);
  ctx.closePath();
  ctx.fillStyle = COLOR_HALLWAY;
  ctx.fill();
  ctx.stroke();

  //draw left side triangle
  ctx.beginPath();
  ctx.moveTo(hallwayBoundingBox.topright.x, hallwayBoundingBox.topright.y);
  ctx.lineTo(end.topLeft.x, end.topLeft.y);
  ctx.lineTo(end.bottomLeft.x, end.bottomLeft.y);
  ctx.lineTo(hallwayBoundingBox.bottomright.x, hallwayBoundingBox.bottomright.y);
  ctx.lineTo(hallwayBoundingBox.topright.x, hallwayBoundingBox.topright.y);
  ctx.closePath();
  ctx.fillStyle = COLOR_HALLWAY;
  ctx.fill();
  ctx.stroke();

  //draw right side triangle
  ctx.beginPath();
  ctx.moveTo(start.topRight.x, start.topRight.y);
  ctx.lineTo(end.topRight.x, end.topRight.y);
  ctx.lineTo(end.bottomRight.x, end.bottomRight.y);
  ctx.lineTo(start.bottomRight.x, start.bottomRight.y);
  ctx.lineTo(start.topRight.x, start.topRight.y);
  ctx.closePath();
  ctx.fillStyle = COLOR_HALLWAY;
  ctx.fill();
  ctx.stroke();

  //draw upper triangle
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR_LINES;
  ctx.beginPath();
  ctx.moveTo(start.topLeft.x, start.topLeft.y);
  ctx.lineTo(start.topRight.x, start.topRight.y);
  ctx.lineTo(end.topRight.x, end.topRight.y);
  ctx.lineTo(end.topLeft.x, end.topLeft.y);
  ctx.lineTo(hallwayBoundingBox.topright.x, hallwayBoundingBox.topright.y);
  ctx.lineTo(hallwayBoundingBox.topleft.x, hallwayBoundingBox.topleft.y);
  ctx.lineTo(nearHallwayBoundingBox.topright.x, nearHallwayBoundingBox.topright.y);
  ctx.lineTo(start.topLeft.x, start.topLeft.y);
  ctx.closePath();
  ctx.fillStyle = COLOR_CEILING;
  ctx.fill();
  ctx.stroke();

  //draw floor

  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR_LINES;
  ctx.beginPath();
  ctx.moveTo(start.bottomLeft.x, start.bottomLeft.y);
  ctx.lineTo(start.bottomRight.x, start.bottomRight.y);
  ctx.lineTo(end.bottomRight.x, end.bottomRight.y);
  ctx.lineTo(end.bottomLeft.x, end.bottomLeft.y);
  ctx.lineTo(hallwayBoundingBox.bottomright.x, hallwayBoundingBox.bottomright.y);
  ctx.lineTo(hallwayBoundingBox.bottomleft.x, hallwayBoundingBox.bottomleft.y);
  ctx.lineTo(nearHallwayBoundingBox.bottomright.x, nearHallwayBoundingBox.bottomright.y);
  ctx.lineTo(start.bottomLeft.x, start.bottomLeft.y);
  ctx.closePath();
  ctx.fillStyle = COLOR_FLOOR;
  ctx.fill();
  ctx.stroke();
}
function drawHallRight(ctx: CanvasRenderingContext2D, start: DrawingBoundingBox, end: DrawingBoundingBox) {
  const overallW = start.bottomRight.x - start.bottomLeft.x;
  const overallH = start.bottomRight.y - start.topRight.y;
  const oneThirdW = overallW / 3;
  const oneSixthW = overallW / 6;
  const oneThirdH = overallH / 3;
  const oneSixthH = overallH / 6;

  const hallwayBoundingBox = {
    topleft: { x: start.topRight.x - oneThirdW, y: start.topRight.y + oneThirdH },
    topright: { x: start.topRight.x - oneSixthW, y: start.topRight.y + oneThirdH },
    bottomleft: { x: start.bottomRight.x - oneThirdW, y: start.bottomRight.y - oneThirdH },
    bottomright: { x: start.bottomRight.x - oneSixthW, y: start.bottomRight.y - oneThirdH },
    width: oneSixthW,
    height: oneThirdH,
  };

  const nearHallwayBoundingBox = {
    topleft: { x: start.topRight.x - oneSixthW, y: start.topRight.y + oneSixthH },
    topright: { x: start.topRight.x, y: start.topRight.y },
    bottomleft: { x: start.bottomRight.x - oneSixthW, y: start.bottomRight.y - oneSixthH },
    bottomright: { x: start.topRight.x, y: start.bottomRight.y },
  };

  //draw far hall box
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR_LINES;
  ctx.fillStyle = COLOR_SIDEWALL;
  ctx.fillRect(hallwayBoundingBox.topleft.x, hallwayBoundingBox.topleft.y, hallwayBoundingBox.width, hallwayBoundingBox.height);
  ctx.strokeRect(hallwayBoundingBox.topleft.x, hallwayBoundingBox.topleft.y, hallwayBoundingBox.width, hallwayBoundingBox.height);

  //draw near hall trapezoid

  ctx.beginPath();
  ctx.moveTo(nearHallwayBoundingBox.topright.x, nearHallwayBoundingBox.topright.y);
  ctx.lineTo(nearHallwayBoundingBox.topleft.x, nearHallwayBoundingBox.topleft.y);
  ctx.lineTo(nearHallwayBoundingBox.bottomleft.x, nearHallwayBoundingBox.bottomleft.y);
  ctx.lineTo(nearHallwayBoundingBox.bottomright.x, nearHallwayBoundingBox.bottomright.y);
  ctx.lineTo(nearHallwayBoundingBox.topright.x, nearHallwayBoundingBox.topright.y);
  ctx.closePath();
  ctx.fillStyle = COLOR_HALLWAY;
  ctx.fill();
  ctx.stroke();

  //draw left side triangle
  ctx.beginPath();
  ctx.moveTo(hallwayBoundingBox.topleft.x, hallwayBoundingBox.topleft.y);
  ctx.lineTo(end.topLeft.x, end.topLeft.y);
  ctx.lineTo(end.bottomLeft.x, end.bottomLeft.y);
  ctx.lineTo(hallwayBoundingBox.bottomleft.x, hallwayBoundingBox.bottomleft.y);
  ctx.lineTo(hallwayBoundingBox.topleft.x, hallwayBoundingBox.topleft.y);
  ctx.closePath();
  ctx.fillStyle = COLOR_HALLWAY;
  ctx.fill();
  ctx.stroke();

  //draw right side triangle
  ctx.beginPath();
  ctx.moveTo(start.topLeft.x, start.topLeft.y);
  ctx.lineTo(end.topLeft.x, end.topLeft.y);
  ctx.lineTo(end.bottomLeft.x, end.bottomLeft.y);
  ctx.lineTo(start.bottomLeft.x, start.bottomLeft.y);
  ctx.lineTo(start.topLeft.x, start.topLeft.y);
  ctx.closePath();
  ctx.fillStyle = COLOR_HALLWAY;
  ctx.fill();
  ctx.stroke();

  //draw upper triangle
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR_LINES;
  ctx.beginPath();
  ctx.moveTo(start.topRight.x, start.topRight.y);
  ctx.lineTo(start.topLeft.x, start.topLeft.y);
  ctx.lineTo(end.topLeft.x, end.topLeft.y);
  ctx.lineTo(end.topRight.x, end.topRight.y);
  ctx.lineTo(hallwayBoundingBox.topleft.x, hallwayBoundingBox.topleft.y);
  ctx.lineTo(hallwayBoundingBox.topright.x, hallwayBoundingBox.topright.y);
  ctx.lineTo(nearHallwayBoundingBox.topleft.x, nearHallwayBoundingBox.topleft.y);
  ctx.lineTo(start.topRight.x, start.topRight.y);
  ctx.closePath();
  ctx.fillStyle = COLOR_CEILING;
  ctx.fill();
  ctx.stroke();

  //draw floor

  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR_LINES;
  ctx.beginPath();
  ctx.moveTo(start.bottomRight.x, start.bottomRight.y);
  ctx.lineTo(start.bottomLeft.x, start.bottomLeft.y);
  ctx.lineTo(end.bottomLeft.x, end.bottomLeft.y);
  ctx.lineTo(end.bottomRight.x, end.bottomRight.y);
  ctx.lineTo(hallwayBoundingBox.bottomleft.x, hallwayBoundingBox.bottomleft.y);
  ctx.lineTo(hallwayBoundingBox.bottomright.x, hallwayBoundingBox.bottomright.y);
  ctx.lineTo(nearHallwayBoundingBox.bottomleft.x, nearHallwayBoundingBox.bottomleft.y);
  ctx.lineTo(start.bottomRight.x, start.bottomRight.y);
  ctx.closePath();
  ctx.fillStyle = COLOR_FLOOR;
  ctx.fill();
  ctx.stroke();
}
function drawCross(ctx: CanvasRenderingContext2D, start: DrawingBoundingBox, end: DrawingBoundingBox) {
  const overallW = start.bottomRight.x - start.bottomLeft.x;
  const overallH = start.bottomRight.y - start.topRight.y;
  const oneThirdW = overallW / 3;
  const oneSixthW = overallW / 6;
  const oneThirdH = overallH / 3;
  const oneSixthH = overallH / 6;

  const rightHallwayBoundingBox = {
    topleft: { x: start.topRight.x - oneThirdW, y: start.topRight.y + oneThirdH },
    topright: { x: start.topRight.x - oneSixthW, y: start.topRight.y + oneThirdH },
    bottomleft: { x: start.bottomRight.x - oneThirdW, y: start.bottomRight.y - oneThirdH },
    bottomright: { x: start.bottomRight.x - oneSixthW, y: start.bottomRight.y - oneThirdH },
    width: oneSixthW,
    height: oneThirdH,
  };

  const rightNearHallwayBoundingBox = {
    topleft: { x: start.topRight.x - oneSixthW, y: start.topRight.y + oneSixthH },
    topright: { x: start.topRight.x, y: start.topRight.y },
    bottomleft: { x: start.bottomRight.x - oneSixthW, y: start.bottomRight.y - oneSixthH },
    bottomright: { x: start.topRight.x, y: start.bottomRight.y },
  };

  const leftHallwayBoundingBox = {
    topleft: { x: start.topLeft.x + oneSixthW, y: start.topLeft.y + oneThirdH },
    topright: { x: start.topLeft.x + oneThirdW, y: start.topLeft.y + oneThirdH },
    bottomleft: { x: start.topLeft.x + oneSixthW, y: start.topLeft.y + oneThirdH + oneThirdH },
    bottomright: { x: start.topLeft.x + oneThirdW, y: start.topLeft.y + oneThirdH + oneThirdH },
    width: oneSixthW,
    height: oneThirdH,
  };

  const leftNearHallwayBoundingBox = {
    topleft: { x: start.topLeft.x, y: start.topLeft.y },
    topright: { x: start.topLeft.x + oneSixthW, y: start.topLeft.y + oneSixthH },
    bottomleft: { x: start.bottomLeft.x, y: start.bottomLeft.y },
    bottomright: { x: start.topLeft.x + oneSixthW, y: start.bottomLeft.y - oneSixthH },
  };

  //draw far hall box
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR_LINES;
  ctx.fillStyle = COLOR_SIDEWALL;
  ctx.fillRect(
    rightHallwayBoundingBox.topleft.x,
    rightHallwayBoundingBox.topleft.y,
    rightHallwayBoundingBox.width,
    rightHallwayBoundingBox.height
  );
  ctx.strokeRect(
    rightHallwayBoundingBox.topleft.x,
    rightHallwayBoundingBox.topleft.y,
    rightHallwayBoundingBox.width,
    rightHallwayBoundingBox.height
  );

  //draw near hall trapezoid

  ctx.beginPath();
  ctx.moveTo(rightNearHallwayBoundingBox.topright.x, rightNearHallwayBoundingBox.topright.y);
  ctx.lineTo(rightNearHallwayBoundingBox.topleft.x, rightNearHallwayBoundingBox.topleft.y);
  ctx.lineTo(rightNearHallwayBoundingBox.bottomleft.x, rightNearHallwayBoundingBox.bottomleft.y);
  ctx.lineTo(rightNearHallwayBoundingBox.bottomright.x, rightNearHallwayBoundingBox.bottomright.y);
  ctx.lineTo(rightNearHallwayBoundingBox.topright.x, rightNearHallwayBoundingBox.topright.y);
  ctx.closePath();
  ctx.fillStyle = COLOR_HALLWAY;
  ctx.fill();
  ctx.stroke();

  //draw right side triangle
  ctx.beginPath();
  ctx.moveTo(rightHallwayBoundingBox.topleft.x, rightHallwayBoundingBox.topleft.y);
  ctx.lineTo(end.topLeft.x, end.topLeft.y);
  ctx.lineTo(end.bottomLeft.x, end.bottomLeft.y);
  ctx.lineTo(rightHallwayBoundingBox.bottomleft.x, rightHallwayBoundingBox.bottomleft.y);
  ctx.lineTo(rightHallwayBoundingBox.topleft.x, rightHallwayBoundingBox.topleft.y);
  ctx.closePath();
  ctx.fillStyle = COLOR_HALLWAY;
  ctx.fill();
  ctx.stroke();

  //draw left far hall box
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR_LINES;
  ctx.fillStyle = COLOR_SIDEWALL;
  ctx.fillRect(
    leftHallwayBoundingBox.topleft.x,
    leftHallwayBoundingBox.topleft.y,
    leftHallwayBoundingBox.width,
    leftHallwayBoundingBox.height
  );
  ctx.strokeRect(
    leftHallwayBoundingBox.topleft.x,
    leftHallwayBoundingBox.topleft.y,
    leftHallwayBoundingBox.width,
    leftHallwayBoundingBox.height
  );

  //draw near left hall trapezoid
  ctx.beginPath();
  ctx.moveTo(leftNearHallwayBoundingBox.topleft.x, leftNearHallwayBoundingBox.topleft.y);
  ctx.lineTo(leftNearHallwayBoundingBox.topright.x, leftNearHallwayBoundingBox.topright.y);
  ctx.lineTo(leftNearHallwayBoundingBox.bottomright.x, leftNearHallwayBoundingBox.bottomright.y);
  ctx.lineTo(leftNearHallwayBoundingBox.bottomleft.x, leftNearHallwayBoundingBox.bottomleft.y);
  ctx.lineTo(leftNearHallwayBoundingBox.topleft.x, leftNearHallwayBoundingBox.topleft.y);
  ctx.closePath();
  ctx.fillStyle = COLOR_HALLWAY;
  ctx.fill();
  ctx.stroke();

  //draw left side triangle
  ctx.beginPath();
  ctx.moveTo(leftHallwayBoundingBox.topright.x, leftHallwayBoundingBox.topright.y);
  ctx.lineTo(end.topRight.x, end.topRight.y);
  ctx.lineTo(end.bottomRight.x, end.bottomRight.y);
  ctx.lineTo(leftHallwayBoundingBox.bottomright.x, leftHallwayBoundingBox.bottomright.y);
  ctx.lineTo(leftHallwayBoundingBox.topright.x, leftHallwayBoundingBox.topright.y);
  ctx.closePath();
  ctx.fillStyle = COLOR_HALLWAY;
  ctx.fill();
  ctx.stroke();

  //draw upper triangle
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR_LINES;
  ctx.beginPath();
  ctx.moveTo(start.topRight.x, start.topRight.y);
  ctx.lineTo(start.topLeft.x, start.topLeft.y);
  ctx.lineTo(leftNearHallwayBoundingBox.topright.x, leftNearHallwayBoundingBox.topright.y);
  ctx.lineTo(leftHallwayBoundingBox.topleft.x, leftHallwayBoundingBox.topleft.y);
  ctx.lineTo(leftHallwayBoundingBox.topright.x, leftHallwayBoundingBox.topright.y);
  ctx.lineTo(end.topLeft.x, end.topLeft.y);
  ctx.lineTo(end.topRight.x, end.topRight.y);
  ctx.lineTo(rightHallwayBoundingBox.topleft.x, rightHallwayBoundingBox.topleft.y);
  ctx.lineTo(rightHallwayBoundingBox.topright.x, rightHallwayBoundingBox.topright.y);
  ctx.lineTo(rightNearHallwayBoundingBox.topleft.x, rightNearHallwayBoundingBox.topleft.y);
  ctx.lineTo(start.topRight.x, start.topRight.y);
  ctx.closePath();
  ctx.fillStyle = COLOR_CEILING;
  ctx.fill();
  ctx.stroke();

  //draw floor

  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR_LINES;
  ctx.beginPath();
  ctx.moveTo(start.bottomRight.x, start.bottomRight.y);
  ctx.lineTo(start.bottomLeft.x, start.bottomLeft.y);
  ctx.lineTo(leftNearHallwayBoundingBox.bottomright.x, leftNearHallwayBoundingBox.bottomright.y);
  ctx.lineTo(leftHallwayBoundingBox.bottomleft.x, leftHallwayBoundingBox.bottomleft.y);
  ctx.lineTo(leftHallwayBoundingBox.bottomright.x, leftHallwayBoundingBox.bottomright.y);
  ctx.lineTo(end.bottomLeft.x, end.bottomLeft.y);
  ctx.lineTo(end.bottomRight.x, end.bottomRight.y);
  ctx.lineTo(rightHallwayBoundingBox.bottomleft.x, rightHallwayBoundingBox.bottomleft.y);
  ctx.lineTo(rightHallwayBoundingBox.bottomright.x, rightHallwayBoundingBox.bottomright.y);
  ctx.lineTo(rightNearHallwayBoundingBox.bottomleft.x, rightNearHallwayBoundingBox.bottomleft.y);
  ctx.lineTo(start.bottomRight.x, start.bottomRight.y);
  ctx.closePath();
  ctx.fillStyle = COLOR_FLOOR;
  ctx.fill();
  ctx.stroke();
}
function drawWall(ctx: CanvasRenderingContext2D, start: DrawingBoundingBox, end: DrawingBoundingBox) {
  const wallwidth = start.topRight.x - start.topLeft.x;
  const wallheight = start.bottomLeft.y - start.topLeft.y;

  ctx.fillStyle = COLOR_ROOMWALL;
  ctx.fillRect(start.topLeft.x, start.topLeft.y, wallwidth, wallheight);
}
function drawDoor(ctx: CanvasRenderingContext2D, start: DrawingBoundingBox, end: DrawingBoundingBox) {
  const wallwidth = start.topRight.x - start.topLeft.x;
  const wallheight = start.bottomLeft.y - start.topLeft.y;
  ctx.fillStyle = COLOR_DOOR;
  const doorwidth = wallwidth / 4;
  const doorheight = wallheight / 2;
  const doorCoords = {
    x: start.topLeft.x + (start.topRight.x - start.topLeft.x) / 2 - doorwidth / 2,
    y: start.bottomLeft.y - doorheight,
  };

  ctx.fillRect(doorCoords.x, doorCoords.y, doorwidth, doorheight);
}

function drawFountain(ctx: CanvasRenderingContext2D, start: DrawingBoundingBox, end: DrawingBoundingBox) {
  const wallwidth = start.topRight.x - start.topLeft.x;
  const wallheight = start.bottomLeft.y - start.topLeft.y;
  let fountainwidth = wallwidth / 3;
  let fountainheight = wallheight / 2;
  let fountainCoords = {
    x: start.topLeft.x + wallwidth / 2 - fountainwidth / 2,
    y: start.bottomLeft.y + 2 - fountainheight,
  };
  ctx.drawImage(Resources.fountain.image, 0, 0, 24, 24, fountainCoords.x, fountainCoords.y, fountainwidth, fountainheight);
}

function isFountainDeadEnd(node: Node): boolean {
  return node.numberEdges == 1 && node.type == tileType.FOUNTAIN;
}
