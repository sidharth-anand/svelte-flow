import type { XYPosition, Position, CoordinateExtent } from "./geometry";
import type { HandleElement } from "./handles";
import type { SnapGrid } from "./general";

export type NodeHandleBounds = {
    source: HandleElement[] | null;
    target: HandleElement[] | null;
};

export interface Node<T = any> {
    id: string;
    position: XYPosition;
    data: T;
    type?: string;
    class?: string;
    targetPosition?: Position;
    sourcePosition?: Position;
    hidden?: boolean;
    selected?: boolean;
    dragging?: boolean;
    draggable?: boolean;
    selectable?: boolean;
    connectable?: boolean;
    dragHandle?: string;
    width?: number | null;
    height?: number | null;
    parentNode?: string;
    zIndex?: number;
    extent?: string | CoordinateExtent;
    expandParent?: boolean;

    //Internal
    positionAbsolute?: XYPosition;
    z?: number;
    handleBounds?: NodeHandleBounds;
    isParent?: boolean;
};

export type NodeMouseHandler = (event: MouseEvent, node: Node) => void;

export type NodeDiffUpdate = {
    id?: string;
    diff?: XYPosition;
    dragging?: boolean;
};

export type NodeDimensionUpdate = {
    id: string;
    nodeElement: HTMLDivElement;
    forceUpdate?: boolean;
};

export type NodeInternals = Map<string, Node>;

export type NodeBounds = XYPosition & {
    width: number | null;
    height: number | null;
};