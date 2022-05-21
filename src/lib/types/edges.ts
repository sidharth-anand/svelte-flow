import type { Connection } from "./general";
import type { HandleElement, HandleType } from "./handles";
import type { Node } from "./node";
import type { Position } from "./geometry";

export enum MarkerType {
    Arrow = 'arrow',
    ArrowClosed = 'arrowclosed'
};

export interface EdgeMarker {
    type: MarkerType;
    color?: string;
    width?: number;
    height?: number;
    markerUnits?: string;
    orient?: string;
    strokeWidth?: number;
};

export type EdgeMarkerType = string | EdgeMarker;

export interface Edge<T = any> {
    id: string;
    type?: string;
    class?: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    label?: string;
    labelShowBg?: boolean;
    labelBgPadding?: [number, number];
    labelBgBorderRadius?: number;
    animated?: boolean;
    hidden?: boolean;
    data?: T;
    sourceNode?: Node;
    targetNode?: Node;
    selected?: boolean;
    markerStart?: EdgeMarkerType;
    markerEnd?: EdgeMarkerType;
    zIndex?: number;
}

export type DefaultEdgeOptions = Omit<
    Edge,
    'id' | 'source' | 'target' | 'sourceHandle' | 'targetHandle' | 'sourceNode' | 'targetNode'
>;

export type EdgeMouseHandler = (event: MouseEvent, edge: Edge) => void;

export type OnEdgeUpdateFunction<T = any> = (oldEdge: Edge<T>, newConnection: Connection) => void;

export enum ConnectionLineType {
    Bezier = 'default',
    Straight = 'straight',
    Step = 'step',
    SmoothStep = 'smoothstep',
    SimpleBezier = 'simplebezier'
};