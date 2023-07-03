import * as Y from 'yjs';
import { Brush } from '../elements/Brush';
import { v4 as uuidv4 } from 'uuid';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { Element } from '../elements/Element';

export declare type onNewElementCallback = (element: Element) => void;

export class WhiteBoard {
    ID: string;
    private _yjsProvider: HocuspocusProvider | undefined = undefined;

    private _origin: string;
    private _doc: Y.Doc | undefined = undefined;
    private _yElementMap: Y.Map<unknown> | undefined = undefined;
    private _elementMap: Map<string, Element> = new Map();
    private _callback: onNewElementCallback | undefined = undefined;
    private _sendFlag = 0;

    constructor() {
        this.ID = '';
        this._origin = uuidv4();
    }

    join(roomID: string) {
        this.ID = roomID;
        this._yjsProvider = new HocuspocusProvider({
            url: 'ws://47.119.150.226:3000',
            name: roomID,
        });
        this._doc = this._yjsProvider.document;
        this._yElementMap = this._doc.getMap('elements');
        this._yElementMap.observe((_event, transaction) => {
            if (transaction.origin !== this._origin) {
                transaction.changed.forEach((value, _key) => {
                    value.forEach((value) => {
                        let element = this._elementMap.get(value!);
                        if (!element) {
                            const yElement = this.yElementMap.get(value!)! as Y.Map<unknown>;
                            if (yElement.get('type') === 'brush') {
                                element = new Brush(value!);
                                this._yToBrush(yElement, element as Brush);
                            }
                            this._yToElement(yElement, element!);
                            this._elementMap.set(element!.id, element!);
                            this._callback?.(element!);
                            console.log('map updated', transaction.origin, this._origin);
                        }
                    });
                });
            }
        });
    }

    addElement(element: Element) {
        this._elementMap.set(element.id, element);
        this.doc.transact(() => {
            const yElement = new Y.Map();
            this._elementToY(element, yElement);
            if (element instanceof Brush) {
                this._brushToY(element, yElement);
            }
            yElement.observe((_event, transaction) => {
                if (transaction.origin !== this._origin) {
                    console.log('element updated', transaction.origin, this._origin);
                    // const data = new Map();
                    // this._YMapToMap(this._yElementMap.get(element.id) as Y.Map<unknown>, data);
                    // element.importData(data);
                }
            });
            this.yElementMap.set(element.id, yElement);
        }, this._origin);
    }

    updateElement(element: Brush, force: boolean) {
        // const yElement = this._yElementMap.get(element.id) as Y.Map<unknown>;
        // if (force || this._sendFlag++ % 10 === 0) {
        //     this._doc.transact(() => {
        //         this._mapToYMap(element.exportData(), yElement);
        //     }, this._origin);
        // }
    }

    onNewElement(cb: onNewElementCallback) {
        this._callback = cb;
    }

    private _elementToY(element: Element, y: Y.Map<unknown>) {
        y.set('id', element.id);
        y.set('left', element.sprite.position.x);
        y.set('top', element.sprite.position.y);
    }

    private _brushToY(element: Brush, y: Y.Map<unknown>) {
        y.set('type', 'brush');
        y.set('color', element.color);
        y.set('weight', element.weight);
        const points = [];
        for (const point of element.points) {
            const yPoint = new Y.Map();
            yPoint.set('x', point.x);
            yPoint.set('y', point.y);
            points.push(yPoint);
        }
        const yPoints = new Y.Array<Y.Map<unknown>>();
        yPoints.push(points);
        y.set('points', yPoints);
    }

    private _yToElement(y: Y.Map<unknown>, element: Element) {}

    private _yToBrush(y: Y.Map<unknown>, element: Brush) {}

    private get doc() {
        return this._doc!;
    }

    private get yElementMap() {
        return this._yElementMap!;
    }
}
