import * as PIXI from 'pixi.js';

import { Editor } from '../../core/editor';
import { Plugin } from '../../core/plugin';
import { useEditorStore } from '../../core/store';
import { BBoxSprite } from '../sprites/bbox-sprite';
import { ViewportSprite } from '../sprites/viewport-sprite';

type EventType = 'hovering' | 'click';

export class HoveringSelectPlugin implements Plugin {
    name: string = 'hover-plugin';

    private _viewport: ViewportSprite;
    private _container: BBoxSprite;
    private _hoverBox: PIXI.Graphics = new PIXI.Graphics();
    private _selectBox: Map<string, PIXI.Graphics> = new Map();

    constructor(viewport: ViewportSprite, container: BBoxSprite) {
        this._viewport = viewport;
        this._container = container;
        this._hoverBox.visible = false;
        this._container.addChild(this._hoverBox);
    }

    private _handleEvent(event: { x: number; y: number }, type: EventType) {
        const store = useEditorStore();
        if (store.mouseType !== 'select') {
            return;
        }
        for (const child of this._viewport.children) {
            const bounds = child.renderObject.getBounds();
            if (bounds.contains(event.x, event.y)) {
                if (type === 'click') {
                    if (!this._selectBox.has(child.element.id)) {
                        const box = new PIXI.Graphics();
                        box.lineStyle(2, 0x1e90ff, 1);
                        box.drawRect(0, 0, bounds.width + 2, bounds.height + 2);
                        box.position.x = bounds.left - 1;
                        box.position.y = bounds.top - 1;
                        this._container.addChild(box);
                        this._selectBox.set(child.element.id, box);
                        store.editor.selectElement(child.element);
                    }
                } else if (this._selectBox.has(child.element.id)) {
                    break;
                } else {
                    this._hoverBox.clear();
                    this._hoverBox.lineStyle(2, 0x61b7cf, 1);
                    this._hoverBox.drawRect(0, 0, bounds.width + 2, bounds.height + 2);
                    this._hoverBox.position.x = bounds.left - 1;
                    this._hoverBox.position.y = bounds.top - 1;
                    this._hoverBox.visible = true;
                }
                return;
            }
        }
        this._hoverBox.visible = false;
    }

    mount(editor: Editor): void {
        editor.events.hovering.subscribe((event) => {
            this._handleEvent(event, 'hovering');
        });
        editor.events.click.subscribe((event) => {
            this._handleEvent(event, 'click');
        });
    }

    unmount(editor: Editor): void {
        throw new Error('Method not implemented.');
    }
}
