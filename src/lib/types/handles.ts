import type { XYPosition, Position, Dimensions } from "./geometry";

export type HandleType = 'source' | 'target';

export interface HandleElement extends XYPosition, Dimensions {
    id: string;
    position: Position;
};

export interface StartHandle {
    nodeId: string;
    type: HandleType;
    handleId: string | null;
};