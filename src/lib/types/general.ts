import type { SvelteComponent } from "svelte";
import type { Selection as D3Selection, ZoomBehavior } from "d3";

import type { Rect, XYPosition, Transform, CoordinateExtent } from "./geometry";
import type { NodeChange, EdgeChange } from "./changes";
import type { Node, NodeInternals, NodeDimensionUpdate, NodeDiffUpdate } from "./node";
import type { Edge, DefaultEdgeOptions } from "./edges";
import type { HandleType, StartHandle } from "./handles";
import type { SvelteFlowInstance } from "./instance";

export type NodeTypes = {[key: string]: typeof SvelteComponent}
export type EdgeTypes = NodeTypes;

export type Project = (position: XYPosition) => XYPosition;

export type OnNodesChange = (nodes: NodeChange[]) => void;
export type OnEdgesChange = (edges: EdgeChange[]) => void;

export type OnNodesDelete = (nodes: Node[]) => void;
export type OnEdgesDelete = (edges: Edge[]) => void;

export type Viewport = {
    x: number;
    y: number;
    zoom: number;
};

export type OnMove = (event: MouseEvent | TouchEvent, viewport: Viewport) => void;
export type OnMoveStart = OnMove;
export type OnMoveEnd = OnMove;

export type ViewportHelperFunctionOptions = {
    duration?: number;
};

export type SetCenterOptions = ViewportHelperFunctionOptions & {
    zoom?: number;
};

export type FitBoundsOptions = ViewportHelperFunctionOptions & {
    padding?: number;
};

export type FitViewOptions = {
    padding?: number;
    includeHiddenNodes?: boolean;
    minZoom?: number;
    maxZoom?: number;
    duration?: number;
};

export type ZoomInOut = (options?: ViewportHelperFunctionOptions) => void;
export type ZoomTo = (zoomLevel: number, options?: ViewportHelperFunctionOptions) => void;
export type GetZoom = () => number;
export type GetViewport = () => Viewport;
export type SetViewport = (viewport: Viewport, options?: ViewportHelperFunctionOptions) => void;
export type SetCenter = (x: number, y: number, options?: SetCenterOptions) => void;
export type FitView = (options?: FitViewOptions) => void;
export type FitBounds = (bounds: Rect, options?: FitBoundsOptions) => void;

export type OnInit<NodeData = any, EdgeData = any> = (svelteFlowInstance: SvelteFlowInstance<NodeData, EdgeData>) => void;

export interface Connection {
    source: string | null;
    target: string | null;
    sourceHandle: string | null;
    targetHandle: string | null; 
};

export enum ConnectionMode {
    Strict = 'strict',
    Loose = 'loose'
};

export type OnConnectStartParams = {
    nodeId: string | null;
    handleId: string | null;
    handleType: HandleType | null;
};

export type OnConnect = (connection: Connection) => void;
export type OnConnectStart = (event: MouseEvent, params: OnConnectStartParams) => void;
export type OnConnectStop = (event: MouseEvent) => void;
export type OnConnectEnd = (event: MouseEvent) => void;

export enum BackgroundVariant {
    Lines = 'lines',
    Dots = 'dots'
};

export type KeyCode = string | Array<string>;

export type SnapGrid = [number, number];

export enum PanOnScrollMode {
    Free = 'free',
    Horizontal = 'horizontal',
    Vertical = 'vertical',
};

export interface ViewportHelperFunctions {
    zoomIn: ZoomInOut;
    zoomOut: ZoomInOut;
    zoomTo: ZoomTo;
    getZoom: GetZoom;
    getViewport: GetViewport;
    setViewport: SetViewport;   
    fitView: FitView;
    setCenter: SetCenter;
    fitBounds: FitBounds;
    project: Project;
    initialized: boolean;
};

export type SvelteFlowStore = {
    width: number;
    height: number;
    transform: Transform;
    nodeInternals: NodeInternals;
    edges: Edge[];
    selectedNodesBbox: Rect;

    d3Zoom: ZoomBehavior<Element, unknown> | null;
    d3Selection: D3Selection<Element, unknown, null, undefined> | null;
    d3ZoomHandler: ((this: Element, event: any, d: unknown) => void) | undefined;
    minZoom: number;
    maxZoom: number;
    translateExtent: CoordinateExtent;
    nodeExtent: CoordinateExtent;

    nodesSelectionActive: boolean;
    usersSelectionActive: boolean;

    connectionNodeId: string | null;
    connectionHandleId: string | null;
    connectionHandleType: HandleType | null;
    connectionPosition: XYPosition;
    connectionMode: ConnectionMode;

    snapToGrid: boolean;
    snapGrid: SnapGrid;

    nodesDraggable: boolean;
    nodesConnectable: boolean;
    elementsSelectable: boolean;

    multiSelectionActive: boolean;

    svelteFlowVersion: string;

    connectionStartHandle: StartHandle | null;

    connectOnClick: boolean;
    defaultEdgeOptions?: DefaultEdgeOptions;

    fitViewOnInit: boolean;
    fitViewOnInitDone: boolean;
    fitViewOnInitOptions: FitViewOptions | undefined;
};

export type SvelteFlowActions = {
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    updateNodeDimensions: (updates: NodeDimensionUpdate[]) => NodeChange[];
    updateNodePosition: (update: NodeDiffUpdate) => NodeChange[];
    resetSelectedElements: () => [NodeChange[], EdgeChange[]];
    unselectNodesAndEdges: () => [NodeChange[], EdgeChange[]];
    addSelectedNodes: (nodeIds: string[]) => NodeChange[];
    addSelectedEdges: (edgeIds: string[]) => [NodeChange[], EdgeChange[]];
    setMinZoom: (minZoom: number) => void;
    setMaxZoom: (maxZoom: number) => void;
    setTranslateExtent: (translateExtent: CoordinateExtent) => void;
    setNodeExtent: (nodeExtent: CoordinateExtent) => void;
    reset: () => void;
};

export type SvelteFlowState = SvelteFlowStore & SvelteFlowActions;

export type UpdateNodeInternals = (nodeId: string) => void;

export type OnSelectionChangeParams = {
    node: Node[];
    edge: Edge[];
};
 
export type OnSelectionChangegFunction = (params: OnSelectionChangeParams) => void;