import * as PIXI from 'pixi.js';

import { Sprite } from './base-sprite';

export class BBoxSprite {
    renderObject: PIXI.Container;

    constructor() {
        this.renderObject = new PIXI.Container();
    }

    addChild(sprite: PIXI.DisplayObject) {
        this.renderObject.addChild(sprite);
    }

    removeChild(sprite: Sprite) {
        this.renderObject.removeChild(sprite.renderObject);
    }
}
