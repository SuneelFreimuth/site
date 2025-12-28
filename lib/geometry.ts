export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface LineSegment {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
}

export interface Point {
    x: number;
    y: number;
}

export interface Ellipse {
    cx: number;
    cy: number;
    rx: number;
    ry: number;
}

export function rectContains(rect: Rect, point: Point): boolean {
    return (
        point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height
    );
}
