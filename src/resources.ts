// resources.ts
import { ImageSource, Loader, Sprite, SpriteSheet } from "excalibur";
import fountainImage from "./Assets/fountain.png"; // replace this

export const Resources = {
  fountain: new ImageSource(fountainImage),
};

export const loader = new Loader();

for (let res of Object.values(Resources)) {
  loader.addResource(res);
}
