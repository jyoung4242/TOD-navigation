import { Actor, Color, Engine, KeyEvent, Keys, Rectangle, TileMap, vec } from "excalibur";
import { GraphNetwork } from "../Lib/LevelMaker";

export class Party extends Actor {
  private _currentTile: { x: number; y: number } = { x: 0, y: 0 };
  private _previousTile: { x: number; y: number } = { x: 0, y: 0 };
  private _tilemap: TileMap;
  private _graph: GraphNetwork;

  constructor(tilemap: TileMap, graph: GraphNetwork) {
    super({
      width: 16,
      height: 16,
      z: 5,
    });

    this._tilemap = tilemap;
    this._graph = graph;

    const mapBorder = new Rectangle({
      width: 16,
      height: 16,
      color: Color.Transparent,
      strokeColor: Color.Red,
      lineWidth: 5,
    });

    this.graphics.use(mapBorder);
  }

  onInitialize(engine: Engine): void {
    engine.input.keyboard.on("press", (event: KeyEvent) => {
      let currentTile = this.currentTile;
      let nextTile = getNextTile(currentTile, event);
      if (isViolatingEdgeOfMap(nextTile, this._tilemap)) return;
      if (!isNextTileClear(currentTile, nextTile, this._graph)) return;

      switch (event.key) {
        case Keys.ArrowUp:
          this.currentTile = { x: currentTile.x, y: currentTile.y - 1 };
          break;
        case Keys.ArrowDown:
          this.currentTile = { x: currentTile.x, y: currentTile.y + 1 };
          break;
        case Keys.ArrowLeft:
          this.currentTile = { x: currentTile.x - 1, y: currentTile.y };
          break;
        case Keys.ArrowRight:
          this.currentTile = { x: currentTile.x + 1, y: currentTile.y };
          break;
      }
    });
  }

  set currentTile(tile: { x: number; y: number }) {
    //gaurd condition for invalid tiles
    if (tile.x < 0 || tile.y < 0 || tile.x >= this._tilemap.columns || tile.y >= this._tilemap.rows) return;

    this._currentTile = tile;
    /*  console.log("this._currentTile", this._currentTile);
    console.log("this.pos", this.pos);
    console.log("this._tilemap.pos", this._tilemap.pos); */
  }

  get currentTile() {
    return this._currentTile;
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    if (this._currentTile.x !== this._previousTile.x || this._currentTile.y !== this._previousTile.y) {
      this._previousTile = this._currentTile;
      //get position of current tile
      const currentTileIndex = this._currentTile.x + this._currentTile.y * this._tilemap.columns;
      const currentTile = this._tilemap.tiles[currentTileIndex];
      console.log("currentTile", currentTile);
      this.pos = vec(currentTile.pos.x + 8 * this.scale.x, currentTile.pos.y + 8 * this.scale.y);
      console.log("this.pos", this.pos);
    }
  }
}

function isViolatingEdgeOfMap(nextTileCoords: { x: number; y: number }, tilemap: TileMap): boolean {
  const width = tilemap.columns;
  const height = tilemap.rows;
  return nextTileCoords.x < 0 || nextTileCoords.y < 0 || nextTileCoords.x >= width || nextTileCoords.y >= height;
}

function isNextTileClear(current: { x: number; y: number }, next: { x: number; y: number }, graph: GraphNetwork): boolean {
  const currentNode = graph.getNodeByCoords(current.x, current.y);
  const currentEdge = graph.findEdgesThatCoverTile([current.x, current.y]);

  const nextNode = graph.getNodeByCoords(next.x, next.y);
  const nextEdge = graph.findEdgesThatCoverTile([next.x, next.y]);

  console.log("currentNode", currentNode);
  console.log("currentEdge", currentEdge);
  console.log("nextNode", nextNode);
  console.log("nextEdge", nextEdge);

  //scenario one, current tile is an edge
  if (currentNode === undefined && currentEdge.length > 0) {
    if (!nextNode && nextEdge.length > 0) {
      //moving to a tile with an edge but no node
      //loop through both currentEdge and nextEdges and look for a common id, then return true
      for (const edge of nextEdge) {
        for (const edge2 of currentEdge) {
          console.log("edge.id", edge.id, "edge2.id", edge2.id);
          if (edge.id === edge2.id) return true;
        }
      }
      return false;
    }

    if (nextNode) {
      //moving to a tile with a node
      //check if nextNode is connected to currentEdges
      for (const edge of currentEdge) {
        if (edge.nodes.source.id === nextNode.id || edge.nodes.target.id === nextNode.id) return true;
      }
    }

    return false;
  }

  //scenario two, current tile is a node
  if (currentNode) {
    const edgeFound = graph.findEdgesThatCoverTile([next.x, next.y]);
    console.log("currentNode", currentNode);
    console.log("edgeFound", edgeFound);
    console.log("graph", graph);

    if (!currentNode) return false;
    if (edgeFound.length === 0) return false;

    for (const edge of edgeFound) {
      const connectingNode = edge.nodes.source.id == currentNode.id ? edge.nodes.target : edge.nodes.source;
      // if the connecting node is in the adjacency list, then return true;
      if (graph.adjacencyList[currentNode.id].has(connectingNode.id)) return true;
    }
    // if none of the edges cover the next tile, return false
  }
  return false;
}

function getNextTile(currentTile: { x: number; y: number }, direction: KeyEvent): { x: number; y: number } {
  switch (direction.key) {
    case Keys.ArrowUp:
      return { x: currentTile.x, y: currentTile.y - 1 };
    case Keys.ArrowDown:
      return { x: currentTile.x, y: currentTile.y + 1 };
    case Keys.ArrowLeft:
      return { x: currentTile.x - 1, y: currentTile.y };
    case Keys.ArrowRight:
      return { x: currentTile.x + 1, y: currentTile.y };
    default:
      return { x: currentTile.x, y: currentTile.y };
  }
}
