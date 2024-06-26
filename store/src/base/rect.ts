export class Rect {
    left: number = 0;
    top: number = 0;
    right: number = 0;
    bottom: number = 0;

    constructor(l?: number, t?: number, r?: number, b?: number) {
        this.left = l ?? 0;
        this.top = t ?? 0;
        this.right = r ?? 0;
        this.bottom = b ?? 0;
    }

    static fromLTWH(l: number, t: number, w: number, h: number) {
        return new Rect(l, t, l + w, t + h);
    }

    get width() {
        return this.right - this.left;
    }

    get height() {
        return this.bottom - this.top;
    }
}
