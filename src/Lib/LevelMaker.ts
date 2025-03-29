import { Tile, TileMap, TileMapOptions, Random, Rectangle, Color, GraphicsGroup, Line, vec, Vector, Circle } from "excalibur";
import { UUID, UUIDGeneration } from "./UUID";
import { loadConfigFromFile } from "vite";

//#region graphics
const whiteTile = new Rectangle({ width: 16, height: 16, strokeColor: Color.White, color: Color.White });
const blackTile = new Rectangle({ width: 16, height: 16, strokeColor: Color.Black, color: Color.Black });

const verticalBlackLine = new Line({ start: vec(8, 0), end: vec(8, 16), color: Color.Black, thickness: 3 });
const horizontalBlackLine = new Line({ start: vec(0, -4), end: vec(16, -4), color: Color.Black, thickness: 3 });
const halfLineRight = new Line({ start: vec(8, -4), end: vec(16, -4), color: Color.Black, thickness: 3 });
const halfLineLeft = new Line({ start: vec(8, -4), end: vec(0, -4), color: Color.Black, thickness: 3 });
const halfLineUp = new Line({ start: vec(8, 0), end: vec(8, -8), color: Color.Black, thickness: 3 });
const halfLineDown = new Line({ start: vec(8, 0), end: vec(8, 8), color: Color.Black, thickness: 3 });
const blackCircle = new Circle({ radius: 5, color: Color.Transparent, strokeColor: Color.Black, lineWidth: 2 });

const verticalWhiteLine = new Line({ start: vec(8, 1), end: vec(8, 15), color: Color.White, thickness: 3 });
const horizontalWhiteLine = new Line({ start: vec(1, 8), end: vec(15, 8), color: Color.White, thickness: 3 });

const arrowHeadWhiteLineUpLeft = new Line({ start: vec(8, 1), end: vec(1, 8), color: Color.White, thickness: 2 });
const arrowHeadWhiteLineUpRight = new Line({ start: vec(8, 1), end: vec(15, 8), color: Color.White, thickness: 2 });
const arrowHeadWhiteLineDownLeft = new Line({ start: vec(8, 15), end: vec(1, 8), color: Color.White, thickness: 2 });
const arrowHeadWhiteLineDownRight = new Line({ start: vec(8, 15), end: vec(15, 8), color: Color.White, thickness: 2 });

const storeCross = new GraphicsGroup({
  useAnchor: true,
  members: [blackTile, verticalWhiteLine, horizontalWhiteLine],
});
const whiteArrowUp = new GraphicsGroup({
  useAnchor: true,
  members: [verticalWhiteLine, arrowHeadWhiteLineUpLeft, arrowHeadWhiteLineUpRight],
});
const whiteArrowDown = new GraphicsGroup({
  useAnchor: true,
  members: [verticalWhiteLine, arrowHeadWhiteLineDownLeft, arrowHeadWhiteLineDownRight],
});

//hallway paths

const hallwayHorizontalTile = horizontalBlackLine.clone();
const hallwayVerticalTile = verticalBlackLine.clone();
const hallwayTUp = new GraphicsGroup({
  useAnchor: true,
  members: [
    { graphic: whiteTile, offset: vec(0, -8) },
    { graphic: horizontalBlackLine, offset: vec(0, 0) },
    { graphic: halfLineUp, offset: vec(0, 0) },
  ],
});
const hallwayTDown = new GraphicsGroup({
  useAnchor: true,
  members: [
    { graphic: whiteTile, offset: vec(0, 0) },
    { graphic: horizontalBlackLine, offset: vec(0, 13) },
    { graphic: halfLineDown, offset: vec(0, 0) },
  ],
});
const hallwayTLeft = new GraphicsGroup({
  useAnchor: true,
  members: [verticalBlackLine, { graphic: halfLineLeft, offset: vec(0, 1) }],
});
const hallwayTRight = new GraphicsGroup({
  useAnchor: true,
  members: [verticalBlackLine, { graphic: halfLineRight, offset: vec(0, 1) }],
});

const stairUp = new GraphicsGroup({ useAnchor: true, members: [blackTile, whiteArrowUp] });
const stairDown = new GraphicsGroup({ useAnchor: true, members: [blackTile, whiteArrowDown] });

//#endregion graphics

const tileType = {
  ROOM: "ROOM",
  VHALLWAY: "VHALLWAY",
  HHALLWAY: "HHALLWAY",
  THALLWAYUP: "THALLWAYUP",
  THALLWAYDOWN: "THALLWAYDOWN",
  THALLWAYLEFT: "THALLWAYLEFT",
  THALLWAYRIGHT: "THALLWAYRIGHT",
  CROSSHALLWAY: "CROSSHALLWAY",
  STAIRUP: "STAIRUP",
  STAIRDOWN: "STAIRDOWN",
  FOUNTAIN: "FOUNTAIN",
  STORE: "STORE",
  EMPTY: "EMPTY",
  PHANTOM: "PHANTOM",
} as const;

type TileType = (typeof tileType)[keyof typeof tileType];
type MyTile = Tile & { type: TileType };

export class LevelMaker {
  static rng: Random = new Random();

  static createLevel(config: TileMapOptions): GraphNetwork {
    let graph = new GraphNetwork(config.columns, config.rows);

    //creating rooms
    const numObjects = LevelMaker.rng.integer(20, 28);
    const numTiles = config.columns * config.rows;
    const usedIndexes: number[] = [];
    const roomIndexes: number[] = [];
    const fountainIndexes: number[] = [];
    const stairIndexes: number[] = [];
    const storeIndexes: number[] = [];

    //#region buildingData

    // Build out level data
    for (let i = 0; i < numObjects - 1; i++) {
      let isRoomIndexClean = false;

      while (!isRoomIndexClean) {
        //console.log("index clean", isRoomIndexClean);

        const index = LevelMaker.rng.integer(0, numTiles - 1);
        //console.log("index", index);

        // test for unique index
        if (!usedIndexes.includes(index)) {
          //test for spacing and edge test
          if (isAtLeastOneAway(usedIndexes, config.columns, index) && !isEdgeIndex(index, config.columns, config.rows)) {
            //test for distance to center
            let tempX = index % config.columns;
            let tempY = Math.floor(index / config.columns);
            let tempDistance = Math.sqrt(Math.pow(tempX - config.columns / 2, 2) + Math.pow(tempY - config.rows / 2, 2));
            const maxDistance = Math.min(config.columns, config.rows) * 0.25; // 25% of the smaller dimension

            if (usedIndexes.length === 0 && LevelMaker.rng.bool()) {
              //if true, create a store on this level
              usedIndexes.push(index);
              storeIndexes.push(index);
              isRoomIndexClean = true;
              continue;
            }

            //test for stairs
            if (stairIndexes.length < 2 && tempDistance < maxDistance) {
              usedIndexes.push(index);
              stairIndexes.push(index);
              isRoomIndexClean = true;
              continue;
            } else if (stairIndexes.length < 2 && tempDistance > maxDistance) {
              isRoomIndexClean = false;
              continue;
            }

            //test for fountain
            if (fountainIndexes.length < 1 && tempDistance < maxDistance) {
              usedIndexes.push(index);
              fountainIndexes.push(index);
              isRoomIndexClean = true;
              continue;
            } else if (fountainIndexes.length < 1 && tempDistance > maxDistance) {
              isRoomIndexClean = false;
              continue;
            }

            usedIndexes.push(index);
            roomIndexes.push(index);
            isRoomIndexClean = true;
          }
        }
      }
    }

    console.log("roomIndexes", roomIndexes);
    console.log("stairIndexes", stairIndexes);
    console.log("fountainIndexes", fountainIndexes);
    console.log("storeIndexes", storeIndexes);
    //#endregion buildingData

    //#region addingNodes
    //build graph
    let x = 0,
      y = 0;

    //check for stores
    if (storeIndexes.length > 0) {
      let coords = getCoordsFromIndex(storeIndexes[0], config.columns);
      graph.addNode({ type: tileType.STORE, index: storeIndexes[0], x: coords[0], y: coords[1] });
    }

    //check for fountains
    if (fountainIndexes.length > 0) {
      let coords = getCoordsFromIndex(fountainIndexes[0], config.columns);
      graph.addNode({ type: tileType.FOUNTAIN, index: fountainIndexes[0], x: coords[0], y: coords[1] });
    }

    //check for stairs
    for (let i = 0; i < stairIndexes.length; i++) {
      let coords = getCoordsFromIndex(stairIndexes[i], config.columns);
      i == 0
        ? graph.addNode({ type: tileType.STAIRUP, index: stairIndexes[i], x: coords[0], y: coords[1] })
        : graph.addNode({ type: tileType.STAIRDOWN, index: stairIndexes[i], x: coords[0], y: coords[1] });
    }

    //check for rooms
    for (let i = 0; i < roomIndexes.length; i++) {
      let coords = getCoordsFromIndex(roomIndexes[i], config.columns);
      graph.addNode({ type: tileType.ROOM, index: roomIndexes[i], x: coords[0], y: coords[1] });
    }
    //#endregion addingNodes

    //#region verticalGroups
    //find vertical groups
    let verticalRoomGroups: Node[][] = [];
    for (let i = 0; i < usedIndexes.length; i++) {
      let node = graph.getNodeByIndex(usedIndexes[i]);
      let nodeCoords = node?.position ?? { x: 0, y: 0 };
      let tileX = nodeCoords.x;
      let tileY = nodeCoords.y;
      let isFound = false;

      for (let j = 0; j < verticalRoomGroups.length; j++) {
        let group = verticalRoomGroups[j];
        if (group[0].position.x === tileX) {
          isFound = true;
          verticalRoomGroups[j].push(node as Node);
          break;
        }
      }

      if (verticalRoomGroups.length === 0 || !isFound) {
        verticalRoomGroups.push([node as Node]);
      }
    }
    //console.log("verticalRoomGroups", verticalRoomGroups);
    const sortedVerticalRoomGroups = sortNodeGroupsByYDescending(verticalRoomGroups);
    console.log("sortedVerticalRoomGroups", sortedVerticalRoomGroups);
    //#endregion verticalGroups

    //#region addingVerticalEdges
    //add edges
    //iterate over vertical groups with more than length of 2, and set tiles between indexes as vertical hallways
    for (let i = 0; i < sortedVerticalRoomGroups.length; i++) {
      let group = sortedVerticalRoomGroups[i];
      if (group.length > 1) {
        for (let j = 0; j < group.length - 1; j++) {
          let nodeA = group[j];
          let nodeB = group[j + 1];
          graph.addEdge({ source: nodeA, target: nodeB });
        }
      }
    }
    //#endregion addingVerticalEdges

    //#region horizontalGroups

    //find horizontal groups
    let horizontalRoomGroups: Node[][] = [];
    for (let i = 0; i < usedIndexes.length; i++) {
      let node = graph.getNodeByIndex(usedIndexes[i]);
      let nodeCoords = node?.position ?? { x: 0, y: 0 };
      let tileX = nodeCoords.x;
      let tileY = nodeCoords.y;
      let isFound = false;

      for (let j = 0; j < horizontalRoomGroups.length; j++) {
        let group = horizontalRoomGroups[j];
        if (group[0].position.y === tileY) {
          isFound = true;
          horizontalRoomGroups[j].push(node as Node);
          break;
        }
      }

      if (horizontalRoomGroups.length === 0 || !isFound) {
        horizontalRoomGroups.push([node as Node]);
      }
    }
    //console.log("horizontalRoomGroups", horizontalRoomGroups);
    //sort groups by x
    const sortedHorizontalRoomGroups = sortNodeGroupsByXDescending(horizontalRoomGroups);
    console.log("sortedHorizontalRoomGroups", sortedHorizontalRoomGroups);
    //#endregion horizontalGroups

    //#region addingHorizontalEdges
    //add edges
    //iterate over horizontal groups with more than length of 2, and set tiles between indexes as horizontal hallways
    for (let i = 0; i < sortedHorizontalRoomGroups.length; i++) {
      let group = sortedHorizontalRoomGroups[i];
      if (group.length > 1) {
        for (let j = 0; j < group.length - 1; j++) {
          let nodeA = group[j];
          let nodeB = group[j + 1];
          graph.addEdge({ source: nodeA, target: nodeB });
        }
      }
    }
    //#endregion addingHorizontalEdges

    //#region addingUnconnectedRooms
    let connectingRoomLoops = 0;
    let unconnectedRooms: string[] = [];
    let roomsAreConnected = false;
    let lostRooms: Node[] = [];

    while (!roomsAreConnected && connectingRoomLoops < 10) {
      lostRooms = [];
      unconnectedRooms = getUnconnectedrooms(graph);
      console.log("unconnectedRooms", unconnectedRooms, "loops: ", connectingRoomLoops);

      for (let i = 0; i < unconnectedRooms.length; i++) {
        let currentRoom = graph.getNodeById(unconnectedRooms[i])!;
        let roomIndex = graph.getNodeById(unconnectedRooms[i])!.index;

        //find a node or edge that is near the unconnected room
        let bestTile = marchAndFindEdge(currentRoom, graph);
        //console.log("bestTile", bestTile);

        if (bestTile === null) continue;
        if (bestTile.distance < Infinity) {
          spliceNewNode(bestTile, graph, roomIndex);
        } else {
          console.log("no edge found for unconnected room");
          lostRooms.push(graph.getNodeByIndex(roomIndex)!);
        }
      }
      connectingRoomLoops++;
      if (unconnectedRooms.length === 0 && lostRooms.length === 0) roomsAreConnected = true;
    }

    //#endregion addingUnconnectedRooms

    //#region intersectingEdges

    let intersectingEdges = graph.findEdgeIntersections();
    console.log("intersectingEdges", intersectingEdges);

    for (const intersectingEdge of intersectingEdges) {
      findAndReplaceIntersectionWithCrossNode(graph, intersectingEdge[0], intersectingEdge[1], [
        intersectingEdge[2],
        intersectingEdge[3],
      ]);
    }

    //#endregion intersectingEdges

    let unconnectedGroups = graph.findConnectedComponents();

    //prune stray nodes
    unconnectedGroups.forEach(group => {
      if (group.length === 1) {
        console.log("pruning stray node: ", group[0]);
        graph.deleteNodeById(group[0].id);
      }
    });

    let numSplicingLoops = 0;
    while (unconnectedGroups.length > 1 && numSplicingLoops < 10) {
      console.log("unconnectedGroups", unconnectedGroups);
      if (unconnectedGroups.length > 1) {
        //iterate over unconnected groups and if there's only one node, delete it

        let closeNodes = findClosestNodesBetweenSeparateGroupos(unconnectedGroups[0], unconnectedGroups[1]);
        console.log("closeNodes", closeNodes);
        //closest Edge

        //let closeEdgeA = marchAndFindEdgeBetweenGroups(closeNodes.nodeA, unconnectedGroups[1], graph);
        let closeEdgeA = findEdgeInOtherGroupReturnTileDetails(closeNodes.nodeA, graph);

        console.log("closeEdgeA", closeEdgeA);

        //let closeEdgeB = marchAndFindEdgeBetweenGroups(closeNodes.nodeB, unconnectedGroups[0], graph);
        let closeEdgeB = findEdgeInOtherGroupReturnTileDetails(closeNodes.nodeB, graph);

        console.log("closeEdgeB", closeEdgeB);

        if (closeEdgeA != null && closeEdgeB == null) {
          console.log("splicing closeEdgeA");
          spliceNewNode(closeEdgeA, graph, closeNodes.nodeA.index);
        } else if (closeEdgeB != null && closeEdgeA == null) {
          console.log("splicing closeEdgeB");
          spliceNewNode(closeEdgeB, graph, closeNodes.nodeB.index);
        } else if (closeEdgeA != null && closeEdgeB != null) {
          if (closeEdgeA.distance < closeEdgeB.distance) {
            console.log("splicing closeEdgeA");
            spliceNewNode(closeEdgeA, graph, closeNodes.nodeA.index);
          } else {
            console.log("splicing closeEdgeB");
            spliceNewNode(closeEdgeB, graph, closeNodes.nodeB.index);
          }
        }
      }

      numSplicingLoops++;
      unconnectedGroups = graph.findConnectedComponents();
      console.log("numSplicingLoops", numSplicingLoops);
    }

    unconnectedGroups = graph.findConnectedComponents();
    console.log("unconnectedGroups", unconnectedGroups);
    console.log("Graph", graph);
    return graph;
  }

  static createTileMap(graph: GraphNetwork, config: TileMapOptions): TileMap {
    const map = new TileMap(config);

    let tileIndex = 0;

    //map background
    for (const tile of map.tiles) {
      tile.addGraphic(whiteTile);
    }

    //loop through edges and draw lines
    let edges = graph.getEdges();

    for (const edge of edges) {
      const dir = edge.direction;
      const tiles = edge.tilesCrossed;
      for (const tile of tiles) {
        let x = tile[0];
        let y = tile[1];
        let tileIndex = y * config.columns + x;
        let tempTile = map.tiles[tileIndex];
        //console.log("tempTile", tempTile, x, y, map);

        dir == "horizontal" ? tempTile.addGraphic(horizontalBlackLine) : tempTile.addGraphic(verticalBlackLine);
      }
    }

    //Room features
    for (const tile of map.tiles) {
      let node = graph.getNodeByIndex(tileIndex);
      //console.log("node", node, "tileIndex", tileIndex);
      if (!node) {
        tileIndex++;
        continue;
      }

      switch (node.type) {
        case tileType.ROOM:
          tile.addGraphic(blackTile);
          break;
        case tileType.VHALLWAY:
          tile.addGraphic(verticalBlackLine);
          break;
        case tileType.HHALLWAY:
          tile.addGraphic(horizontalBlackLine);
          break;
        case tileType.THALLWAYUP:
          tile.clearGraphics();
          tile.addGraphic(whiteTile);
          tile.addGraphic(horizontalBlackLine);
          tile.addGraphic(halfLineUp);
          break;
        case tileType.THALLWAYDOWN:
          tile.clearGraphics();
          tile.addGraphic(whiteTile);
          tile.addGraphic(horizontalBlackLine);
          tile.addGraphic(halfLineDown);

          break;
        case tileType.THALLWAYLEFT:
          tile.clearGraphics();
          tile.addGraphic(whiteTile);
          tile.addGraphic(verticalBlackLine);
          tile.addGraphic(halfLineLeft);
          break;
        case tileType.THALLWAYRIGHT:
          tile.clearGraphics();
          tile.addGraphic(whiteTile);
          tile.addGraphic(verticalBlackLine);
          tile.addGraphic(halfLineRight);
          break;
        case tileType.CROSSHALLWAY:
          break;
        case tileType.STAIRUP:
          tile.addGraphic(stairUp);
          break;
        case tileType.STAIRDOWN:
          tile.addGraphic(stairDown);
          break;
        case tileType.FOUNTAIN:
          tile.clearGraphics();
          tile.addGraphic(whiteTile);
          tile.addGraphic(blackCircle);
          break;
        case tileType.STORE:
          tile.addGraphic(storeCross);
          break;
        default:
          break;
      }

      tileIndex++;
    }

    return map;
  }
}

function getUnconnectedrooms(graph: GraphNetwork): string[] {
  let unconnectedRooms: string[] = [];
  //console.log("graph.list", graph.adjacencyList);
  unconnectedRooms = Object.entries(graph.adjacencyList)
    .filter(entry => entry[1].size === 0)
    .map(entry => entry[0]);
  // console.log("unconnectedRooms", unconnectedRooms, "length", unconnectedRooms.length);
  return unconnectedRooms;
}

// removing config and use graph network width instead, breaking change
function spliceNewNode(
  bestTile: { x: number; y: number; distance: number; edge: Edge; direction: "up" | "down" | "left" | "right" },
  graph: GraphNetwork,
  roomIndex: number
) {
  // need to phantom node, splice existing edge, add new edges
  let phantomIndex = bestTile.y * graph.width + bestTile.x;
  let phantomType;
  switch (bestTile.direction) {
    case "up":
      phantomType = tileType.THALLWAYDOWN;
      break;
    case "down":
      phantomType = tileType.THALLWAYUP;
      break;
    case "left":
      phantomType = tileType.THALLWAYRIGHT;
      break;
    case "right":
      phantomType = tileType.THALLWAYLEFT;
      break;
    default:
      phantomType = tileType.THALLWAYRIGHT;
  }

  let nConfig: NodeConfig = {
    index: phantomIndex,
    x: bestTile.x,
    y: bestTile.y,
    type: phantomType,
  };
  let pNode = graph.addNode(nConfig);

  let edgeNodes = (bestTile.edge as Edge).nodes;
  let nodeA = edgeNodes.source;
  let nodeB = edgeNodes.target;
  //delete edge
  graph.deleteEdgeByID((bestTile.edge as Edge).id);

  //add new edges
  graph.addEdge({ source: nodeA, target: pNode });
  graph.addEdge({ source: pNode, target: nodeB });

  let unconnectedRoomNode = graph.getNodeByIndex(roomIndex)!;
  // test unconnectedRoomNode for if its a hallway node, and you may need to replace it
  let unconnectedRoomNodeType = unconnectedRoomNode.type;
  console.warn("unconnectedRoomNodeType", unconnectedRoomNodeType);

  switch (unconnectedRoomNodeType) {
    case tileType.THALLWAYUP:
    case tileType.THALLWAYDOWN:
    case tileType.THALLWAYLEFT:
    case tileType.THALLWAYRIGHT:
      console.log("changing room type from ", unconnectedRoomNodeType, "to", tileType.CROSSHALLWAY);
      unconnectedRoomNode.type = tileType.CROSSHALLWAY;
      break;
    default:
      //do nothing

      break;
  }
  graph.addEdge({ source: unconnectedRoomNode, target: pNode });
}

function tilesCrossed(Edge: Edge): Array<number[]> {
  const tiles: number[][] = [];

  const { source, target } = Edge.nodes;
  let x0 = Math.floor(source.position.x);
  let y0 = Math.floor(source.position.y);
  const x1 = Math.floor(target.position.x);
  const y1 = Math.floor(target.position.y);

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (x0 !== x1 || y0 !== y1) {
    //console.log("tilesCrossed", x0, y0, x1, y1);

    tiles.push([x0, y0]);
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
  tiles.push([x1, y1]);

  //remove the first and last element of tiles because they are the start and end of the edge
  //tiles.shift();
  //tiles.pop();

  return tiles;
}

function sortNodeGroupsByYDescending(nodeGroups: Node[][]): Node[][] {
  return nodeGroups.map(group => group.sort((a, b) => a.position.y - b.position.y));
}

function sortNodeGroupsByXDescending(nodeGroups: Node[][]): Node[][] {
  return nodeGroups.map(group => group.sort((a, b) => a.position.x - b.position.x));
}

function isAtLeastOneAway(flatIndexes: number[], width: number, targetIndex: number): boolean {
  const to2D = (index: number) => [Math.floor(index / width), index % width];

  const [targetRow, targetCol] = to2D(targetIndex);

  for (const index of flatIndexes) {
    if (index === targetIndex) continue;

    const [row, col] = to2D(index);
    const distX = Math.abs(col - targetCol);
    const distY = Math.abs(row - targetRow);

    // If they are adjacent or the same, return false
    if (distX <= 2 && distY <= 2) {
      return false;
    }
  }

  return true;
}

function isEdgeIndex(index: number, width: number, height: number): boolean {
  return (
    index < width || // Top edge
    index >= width * (height - 1) || // Bottom edge
    index % width === 0 || // Left edge
    index % width === width - 1 // Right edge
  );
}

class Node {
  private _type: keyof typeof tileType;
  private _id: UUID;
  private _index: number;
  private _x: number;
  private _y: number;
  private _numEdges: number;

  constructor(nodeConfig: NodeConfig) {
    this._type = nodeConfig.type;
    this._id = UUIDGeneration.generateUUID();
    this._index = nodeConfig.index;
    this._x = nodeConfig.x;
    this._y = nodeConfig.y;
    this._numEdges = 0;
  }

  get type() {
    return this._type;
  }

  set type(type: keyof typeof tileType) {
    this._type = type;
  }

  get position(): Vector {
    return vec(this._x, this._y);
  }

  get index() {
    return this._index;
  }

  get id() {
    return this._id;
  }

  get numberEdgest() {
    return this._numEdges;
  }

  incNumberEdges() {
    this._numEdges++;
  }

  decNumberEdges() {
    this._numEdges--;
  }
}

interface NodeConfig {
  type: keyof typeof tileType;
  index: number;
  x: number;
  y: number;
}

interface EdgeConfig {
  source: Node;
  target: Node;
}

class Edge {
  private _id: UUID;
  private _source: Node;
  private _target: Node;
  private _distance: number;
  private _tilesCrossed: number[][];
  private _direction: "horizontal" | "vertical" | "none" | "mixed";

  constructor(source: Node, target: Node) {
    this._id = UUIDGeneration.generateUUID();
    this._source = source;
    this._target = target;
    this._distance = calculateEdgeDistance(source, target);
    this._tilesCrossed = tilesCrossed(this);
    this._direction = getTileDirection(this._tilesCrossed);
  }

  get direction() {
    return this._direction;
  }

  get distance() {
    return this._distance;
  }

  get id() {
    return this._id;
  }

  get nodes() {
    return { source: this._source, target: this._target };
  }

  get tilesCrossed() {
    return this._tilesCrossed;
  }

  intersectsWith(other: Edge): boolean {
    const tileSet = new Set(this._tilesCrossed.map(([x, y]) => `${x},${y}`));
    return other._tilesCrossed.some(([x, y]) => tileSet.has(`${x},${y}`));
  }
}

class GraphNetwork {
  nodes: Node[] = [];
  edges: Edge[] = [];
  private _adjacencyList: Record<UUID, Set<UUID>>;
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this._adjacencyList = {};
  }
  addNode(node: NodeConfig): Node {
    //create node
    let tempNode = new Node(node);

    this.nodes.push(tempNode);
    this.adjacencyList[tempNode.id] = new Set<UUID>();

    return tempNode;
  }

  deleteNodeById(id: UUID) {
    //gaurd condition for invalid node uid
    if (!this.nodes.find(node => node.id === id)) return;

    //remove from adjacency list
    const node = this.nodes.find(node => node.id === id);
    if (!node) return;
    delete this._adjacencyList[node.id];

    //remove edges
    this.edges = this.edges.filter(edge => edge.nodes.source.id !== id && edge.nodes.target.id !== id);

    //remove node
    this.nodes = this.nodes.filter(node => node.id !== id);
  }

  get adjacencyList(): Record<UUID, Set<UUID>> {
    return this._adjacencyList;
  }

  getNodeById(id: UUID): Node | undefined {
    return this.nodes.find(node => node.id === id);
  }

  getNodeByIndex(index: number): Node | undefined {
    return this.nodes.find(node => node.index === index);
  }

  getEdges() {
    return this.edges;
  }

  addEdge(edgeConfig: EdgeConfig) {
    //create edge
    const edge = new Edge(edgeConfig.source, edgeConfig.target);
    edgeConfig.source.incNumberEdges();
    edgeConfig.target.incNumberEdges();
    this.edges.push(edge);

    //add edge to adjacency list
    this._adjacencyList[edgeConfig.source.id].add(edgeConfig.target.id);
    this._adjacencyList[edgeConfig.target.id].add(edgeConfig.source.id);
  }

  deleteEdgeByID(uid: UUID) {
    //gaurd condition for invalid edge uid
    if (!this.edges.find(edge => edge.id === uid)) return;
    const edgeID = this.edges.findIndex(edge => edge.id === uid);
    //remove edge from adjacency list
    const { source, target } = this.edges[edgeID].nodes;
    source.decNumberEdges();
    target.decNumberEdges();
    this.adjacencyList[source.id].delete(target.id);
    this.adjacencyList[target.id].delete(source.id);
    this.edges = this.edges.filter(edge => edge.id !== uid);
  }

  findConnectedComponents(): Node[][] {
    const visited = new Set<Node>();
    const components: Node[][] = [];

    for (let node of this.nodes) {
      if (!visited.has(node)) {
        const component: Node[] = [];
        this.dfs(node, visited, component);
        components.push(component);
      }
    }
    return components;
  }

  private dfs(node: Node, visited: Set<Node>, component: Node[]) {
    visited.add(node);
    component.push(node);
    for (let neighbor of this.adjacencyList[node.id] || []) {
      if (!visited.has(this.getNodeById(neighbor)!)) {
        this.dfs(this.getNodeById(neighbor)!, visited, component);
      }
    }
  }

  findEdgeIntersections(): [Edge, Edge, number, number][] {
    const edges = this.edges;
    const intersections: [Edge, Edge, number, number][] = [];

    for (let i = 0; i < edges.length; i++) {
      for (let j = i + 1; j < edges.length; j++) {
        if (edges[i].intersectsWith(edges[j])) {
          // Find the common tile
          const commonTile = edges[i].tilesCrossed.find(([x, y]) => edges[j].tilesCrossed.some(([tx, ty]) => x === tx && y === ty));

          //test if commonTile is a node

          if (commonTile) {
            const [x, y] = commonTile;
            const node = this.getNodeByIndex(x + y * this.width);
            if (!node) {
              intersections.push([edges[i], edges[j], x, y]);
            }
          }
        }
      }
    }

    return intersections;
  }

  findEdgesThatCoverTile(tile: [number, number]): Edge[] {
    const edges = this.edges;
    const foundEdges = [];
    for (let edge of edges) {
      if (edge.tilesCrossed.some(([x, y]) => x === tile[0] && y === tile[1])) foundEdges.push(edge);
    }

    return foundEdges;
  }

  isConnected(nodeA: Node, nodeB: Node): boolean {
    if (!this._adjacencyList[nodeA.id] || !this._adjacencyList[nodeB.id]) {
      return false; // One or both nodes don't exist in the graph
    }

    const visited = new Set<UUID>();
    const stack = [nodeA.id];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === nodeB.id) {
        return true; // Found a connection
      }

      if (!visited.has(current)) {
        visited.add(current);
        for (const neighbor of this._adjacencyList[current]) {
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
          }
        }
      }
    }

    return false; // No path found
  }
}

function getTileDirection(tiles: number[][]): "horizontal" | "vertical" | "none" | "mixed" {
  if (tiles.length < 2) return "none";
  const allSameX = tiles.every(tile => tile[0] === tiles[0][0]);
  const allSameY = tiles.every(tile => tile[1] === tiles[0][1]);
  if (allSameX) return "vertical";
  if (allSameY) return "horizontal";
  return "mixed";
}

function getCoordsFromIndex(index: number, width: number): [number, number] {
  // console.log(index, width);
  // console.log(Math.floor(index / width), index % width);

  return [index % width, Math.floor(index / width)];
}

function calculateEdgeDistance(nodeA: Node, nodeB: Node): number {
  const nodeAPosition = nodeA.position;
  const nodeBPosition = nodeB.position;
  const dx = nodeBPosition.x - nodeAPosition.x;
  const dy = nodeBPosition.y - nodeAPosition.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function marchAndFindEdge(
  node: Node,
  graph: GraphNetwork
): { edge: Edge; distance: number; x: number; y: number; direction: "up" | "down" | "left" | "right" } | null {
  //tile march, march in 4 directions and find nearest edge that intersects with the unconnected room

  let roomX = node.position.x;
  let roomY = node.position.y;
  let tempEdges = graph.getEdges();
  let bestTile = {
    x: roomX,
    y: roomY,
    distance: Infinity,
    edge: null as Edge | null,
    direction: null as "up" | "down" | "left" | "right" | null,
  };

  let directions = {
    up: [0, -1],
    down: [0, 1],
    left: [-1, 0],
    right: [1, 0],
  };

  for (const direction of Object.keys(directions)) {
    let currentDirection = directions[direction as keyof typeof directions];
    let hasFoundMapEdge = false;
    let hasFoundGraphEdge = false;

    let marchingX = roomX;
    let marchingY = roomY;

    //filter edges by direction... horizontal or vertical
    let filteredEdges: Edge[] = [];
    if (direction === "up" || direction === "down") filteredEdges = tempEdges.filter(edge => edge.direction === "horizontal");
    if (direction === "left" || direction === "right") filteredEdges = tempEdges.filter(edge => edge.direction === "vertical");

    while (!hasFoundGraphEdge && !hasFoundMapEdge) {
      //console.log("marchingX", marchingX, "marchingY", marchingY);

      marchingX += currentDirection[0];
      marchingY += currentDirection[1];

      for (const edge of filteredEdges) {
        let edgeTiles = edge.tilesCrossed;
        for (const tile of edgeTiles) {
          let tileX = tile[0];
          let tileY = tile[1];
          if (tileX === marchingX && tileY === marchingY) {
            //pythagorean theorem
            let distance = Math.sqrt(Math.pow(marchingX - roomX, 2) + Math.pow(marchingY - roomY, 2));
            if (distance < bestTile.distance) {
              bestTile.x = marchingX;
              bestTile.y = marchingY;
              bestTile.distance = distance;
              bestTile.edge = edge;
              bestTile.direction = direction as "up" | "down" | "left" | "right";
            }
          }
        }
      }

      hasFoundMapEdge = marchingX <= 0 || marchingX >= graph.width - 1 || marchingY <= 0 || marchingY >= graph.height - 1;
      hasFoundGraphEdge = bestTile.distance < Infinity;
    }
  }
  //console.log("bestTile", bestTile);
  return {
    x: bestTile.x,
    y: bestTile.y,
    distance: bestTile.distance,
    edge: bestTile.edge as Edge,
    direction: bestTile.direction as "up" | "down" | "left" | "right",
  };
}

//{ edge: Edge; distance: number; x: number; y: number; direction: "up" | "down" | "left" | "right" } | null
function marchAndFindEdgeBetweenGroups(
  node: Node,
  groupNodes: Node[],
  graph: GraphNetwork
): { x: number; y: number; distance: number; direction: "up" | "down" | "left" | "right"; edge: Edge } | null {
  function getBlockedDirections(node: Node, graph: GraphNetwork): "up" | "down" | "left" | "right"[] {
    let list = graph.adjacencyList[node.id];
    console.log("list", list);

    const directionTests = {
      up: (node: Node, otherNode: Node): boolean => {
        return node.position.y > otherNode.position.y;
      },
      down: (node: Node, otherNode: Node): boolean => {
        return node.position.y < otherNode.position.y;
      },
      left: (node: Node, otherNode: Node): boolean => {
        return node.position.x > otherNode.position.x;
      },
      right: (node: Node, otherNode: Node): boolean => {
        return node.position.x < otherNode.position.x;
      },
    };

    let availableDirections: ("up" | "down" | "left" | "right")[] = [];
    for (const direction of Object.keys(directionTests)) {
      let directionFunction = directionTests[direction as keyof typeof directionTests];
      for (const otherNode of list) {
        if (directionFunction(node, graph.getNodeById(otherNode)!)) {
          //@ts-ignore
          availableDirections.push(direction);
        }
      }
    }
    //@ts-ignore
    return availableDirections;
  }

  let blockedDirections = getBlockedDirections(node, graph);
  console.log(`node:`, node, "blocked directions: ", blockedDirections);

  let marchingDirections: ("up" | "down" | "left" | "right")[] = ["up", "down", "left", "right"];
  //remove blocked directions
  for (const blockedDirection of blockedDirections) {
    //@ts-ignore
    let index = marchingDirections.indexOf(blockedDirection);
    if (index > -1) {
      marchingDirections.splice(index, 1);
    }
  }
  console.log("remaining directions", marchingDirections);

  //for remaining directions, march and find edge
  let bestTile: { x: number; y: number; distance: number; edge: Edge; direction: "up" | "down" | "left" | "right" } | null = null;
  for (const direction of marchingDirections) {
    let dirVectors = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0],
    };

    let currentDirection = dirVectors[direction as keyof typeof dirVectors];
    let marchingX = node.position.x;
    let marchingY = node.position.y;
    let hasFoundMapEdge = false;
    let hasFoundGraphEdge = false;

    while (!hasFoundMapEdge && !hasFoundGraphEdge) {
      marchingX += currentDirection[0];
      marchingY += currentDirection[1];

      hasFoundMapEdge = marchingX <= 0 || marchingX >= graph.width - 1 || marchingY <= 0 || marchingY >= graph.height - 1;

      if (hasFoundMapEdge) break;
      let tileCoors: [number, number] = [marchingX, marchingY];
      const edgesFound = graph.findEdgesThatCoverTile(tileCoors);

      if (edgesFound.length > 1) {
        bestTile = {
          x: marchingX,
          y: marchingY,
          distance: 0,
          edge: edgesFound[0],
          direction: direction as "up" | "down" | "left" | "right",
        };

        //splice a new node at this tile coordinate and correctly replace node type
        hasFoundGraphEdge = true;
        let distanceToNode = Math.max(Math.abs(marchingX - node.position.x), Math.abs(marchingY - node.position.y));
        return { x: marchingX, y: marchingY, direction, edge: edgesFound[0], distance: distanceToNode };
      }
    }
  }

  return null;
}

function findEdgeInOtherGroupReturnTileDetails(
  node: Node,
  graph: GraphNetwork
): {
  x: number;
  y: number;
  edge: Edge;
  direction: "up" | "down" | "left" | "right";
  distance: number;
} | null {
  let directions: ("up" | "down" | "left" | "right")[] = ["up", "down", "left", "right"];
  let direcitonVectors = {
    up: [0, -1],
    down: [0, 1],
    left: [-1, 0],
    right: [1, 0],
  };

  // march through each direction until you find an edge that is in the other group using adjacency list?
  for (const direction of directions) {
    let hasHitEdge = false;
    let hasHitMapEdge = false;
    let marchingX = node.position.x;
    let marchingY = node.position.y;

    console.log("inner loop of findingedge: ", node, direction);

    while (!hasHitEdge && !hasHitMapEdge) {
      let currentDirection = direcitonVectors[direction as keyof typeof direcitonVectors];
      marchingX += currentDirection[0];
      marchingY += currentDirection[1];
      hasHitMapEdge = marchingX <= 0 || marchingX >= graph.width - 1 || marchingY <= 0 || marchingY >= graph.height - 1;

      if (hasHitMapEdge) {
        console.error("hit map edge: ", marchingX, marchingY);
        break;
      }

      // check if marching tile has an edge
      let tileCoors: [number, number] = [marchingX, marchingY];
      console.log("tileCoors: ", tileCoors);

      const edgesFound = graph.findEdgesThatCoverTile(tileCoors);
      console.log("edgesFound: ", edgesFound);

      if (edgesFound.length > 0) {
        console.log("found edge: ", edgesFound);
        hasHitEdge = true;
        //check each edge for a node that is connected to the other group
        for (const edge of edgesFound) {
          console.log("edge: ", edge);

          let { source, target } = edge.nodes;

          // using graph.isConnected see if the node is connected to the other group
          if (graph.isConnected(node, target) || graph.isConnected(node, source)) {
            // bad edge
            console.warn("bad edge: ", edge);

            break;
          } else {
            console.log("good edge: ", edge);

            // you have found an edge in other group, return tile details
            return {
              x: marchingX,
              y: marchingY,
              edge: edge,
              direction: direction as "up" | "down" | "left" | "right",
              distance: Math.max(Math.abs(marchingX - node.position.x), Math.abs(marchingY - node.position.y)),
            };
          }
        }
      }
    }
  }
  return null;
}

function findAndReplaceIntersectionWithCrossNode(graph: GraphNetwork, edgeA: Edge, edgeB: Edge, tileCoors: [number, number]) {
  //first create new Crossnode
  let newNodeIndex = tileCoors[0] * graph.width + tileCoors[1];
  let nodeconfig: NodeConfig = { index: newNodeIndex, x: tileCoors[0], y: tileCoors[1], type: tileType.CROSSHALLWAY };
  let newNode = graph.addNode(nodeconfig);

  // find all connecting nodes
  let { source, target } = edgeA.nodes;
  const nodeA = source;
  const nodeB = target;
  ({ source, target } = edgeB.nodes);
  const nodeC = source;
  const nodeD = target;

  //remove all edges
  graph.deleteEdgeByID(edgeA.id);
  graph.deleteEdgeByID(edgeB.id);

  //add new edges
  graph.addEdge({ source: nodeA, target: newNode });
  graph.addEdge({ source: newNode, target: nodeB });
  graph.addEdge({ source: nodeC, target: newNode });
  graph.addEdge({ source: newNode, target: nodeD });
}

function findClosestNodesBetweenSeparateGroupos(nodeGroupA: Node[], nodeGroupB: Node[]): { nodeA: Node; nodeB: Node } {
  //iterate over both node groups and find closest nodes
  let closestNodes: { nodeA: Node; nodeB: Node } = { nodeA: nodeGroupA[0], nodeB: nodeGroupB[0] };
  let closestDistance = Infinity;
  for (const nodeA of nodeGroupA) {
    for (const nodeB of nodeGroupB) {
      let distance = Math.sqrt(Math.pow(nodeA.position.x - nodeB.position.x, 2) + Math.pow(nodeA.position.y - nodeB.position.y, 2));
      if (distance < closestDistance) {
        closestDistance = distance;
        closestNodes.nodeA = nodeA;
        closestNodes.nodeB = nodeB;
      }
    }
  }
  return closestNodes;
}
