import { CoordinateExtent, SvelteFlowStore, ConnectionMode } from "../types";

export const infiniteExtent: CoordinateExtent = [
    [-Infinity, -Infinity],
    [Infinity, Infinity]    
];

const initialState: SvelteFlowStore = {
    width: 0,
    height: 0,
    transform: [0, 0, 1],
    nodeInternals: new Map(),
    edges: [],
    selectedNodesBbox: { x:0, y:0, width: 0, height: 0 },
    d3Zoom: null,
    d3Selection: null,
    d3ZoomHandler: undefined,
    minZoom: 0.5,
    maxZoom: 2,
    translateExtent: infiniteExtent,
    nodeExtent: infiniteExtent,
    nodesSelectionActive: false,
    usersSelectionActive: false,
    connectionNodeId: null, 
    connectionHandleId: null,
    connectionHandleType: null,
    connectionPosition: { x: 0, y: 0 },
    connectionMode: ConnectionMode.Strict,

    snapGrid: [15, 15],
    snapToGrid: false,

    nodesDraggable: true,
    nodesConnectable: true,
    elementsSelectable: true,
    fitViewOnInit: false,
    fitViewOnInitDone: false,
    fitViewOnInitOptions: undefined,

    multiSelectionActive: false,

    svelteFlowVersion: typeof __SVELTE_FLOW_VERSION__ !== 'undefined' ? __SVELTE_FLOW_VERSION__ : '-',

    connectionStartHandle: null,
    connectOnClick: true
};

export default initialState;