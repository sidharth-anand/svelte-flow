<script lang="ts">
  import { SvelteComponent, createEventDispatcher } from "svelte";

  import { store } from "../../store";

  import {
    ConnectionLineType,
    ConnectionMode,
    PanOnScrollMode,
    Node,
    Edge,
    DefaultEdgeOptions,
    KeyCode,
    CoordinateExtent,
    FitViewOptions,
    NodeTypes,
    EdgeTypes,
    NodeChange,
    EdgeChange,
  } from "../../types";

  import GraphView from "../graph/graphview.svelte";

  type EventTypes = {
    "nodes:change": NodeChange[];
    "edges:change": EdgeChange[];
  };

  export let nodes: Node[] = [];
  export let edges: Edge[] = [];

  export let defaultEdgeOptions: DefaultEdgeOptions = null;

  export let connectionMode: ConnectionMode = ConnectionMode.Strict;
  export let connectionLineType: ConnectionLineType = ConnectionLineType.Bezier;

  export let deleteKeyCode: KeyCode = "Backspace";
  export let selectionKeyCode: KeyCode = "Shift";
  export let multiSelectionKeyCode: KeyCode = "Meta";
  export let zoomActivationKeyCode: KeyCode = "Meta";

  export let snapToGrid: boolean = false;
  export let snapGrid: [number, number] = [15, 15];

  export let onlyRenderVisibleElements: boolean = false;

  export let nodesDraggable: boolean = true;
  export let selectNodesOnDrag: boolean = true;
  export let panOnDrag: boolean = true;

  export let minZoom: number = null;
  export let maxZoom: number = null;

  export let defaultZoom: number = 1;
  export let defaultPosition: [number, number] = [0, 0];

  export let translateExtent: CoordinateExtent = null;
  export let nodeExtent: CoordinateExtent = null;

  export let preventScrolling: boolean = true;

  export let defaultMarkerColor: string = "#b1b1b7";

  export let zoomOnScroll: boolean = true;
  export let zoomOnPinch: boolean = true;
  export let zoomOnDoubleClick: boolean = true;

  export let panOnScroll: boolean = true;
  export let panOnScrollSpeed: number = 0.5;
  export let panOnScrollMode: PanOnScrollMode = PanOnScrollMode.Free;

  export let edgeUpdaterRadius: number = 10;

  export let noPanClassName: string = "nopan";
  export let noDragClassName: string = "nodrag";
  export let noWheelClassName: string = "nowheel";

  export let fitView: boolean = false;
  export let fitViewOptions: FitViewOptions = null;

  export let connectOnClick: boolean = true;

  export let nodeTypes: NodeTypes = {};
  export let edgeTypes: EdgeTypes = {};

  export let connectionLineComponent: typeof SvelteComponent = null;

  const dispatch = createEventDispatcher();

  $: {
    const valuesToUpdate = {
      defaultEdgeOptions,
      connectionMode,
      snapToGrid,
      snapGrid,
      nodesDraggable,
      connectOnClick,
      fitViewOnInit: fitView,
      fitViewOnInitOptions: fitViewOptions,
    };

    Object.keys(valuesToUpdate).forEach((key) => {
      if (
        typeof valuesToUpdate[key] !== "undefined" &&
        valuesToUpdate[key] !== null
      ) {
        store.update((state) => ({
          ...state,
          [key]: valuesToUpdate[key],
        }));
      }
    });
  }

  $: {
    const valuesToSet = {
      nodes,
      edges,
      minZoom,
      maxZoom,
      translateExtent,
      nodeExtent,
    };

    console.log(nodes);

    Object.keys(valuesToSet).forEach((key) => {
      if (
        typeof valuesToSet[key] !== "undefined" &&
        valuesToSet[key] !== null
      ) {
        store[`set${key.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())}`](
          valuesToSet[key]
        );
      }
    });
  }

  function onNodesChange(event: CustomEvent<NodeChange[]>) {
    nodes = Array.from($store.nodeInternals.values());
    dispatch("nodes:change", event.detail);
  }

  function onEdgesChange(event: CustomEvent<EdgeChange>) {
    edges = $store.edges;
    dispatch('edges:change', event.detail);
  }
</script>

<div class="svelte-flow {$$props.class || ''}">
  <GraphView
    {connectionLineType}
    {selectionKeyCode}
    {defaultMarkerColor}
    {deleteKeyCode}
    {multiSelectionKeyCode}
    {zoomActivationKeyCode}
    {onlyRenderVisibleElements}
    {selectNodesOnDrag}
    {defaultZoom}
    {defaultPosition}
    {preventScrolling}
    {zoomOnScroll}
    {zoomOnPinch}
    {zoomOnDoubleClick}
    {panOnScroll}
    {panOnScrollSpeed}
    {panOnScrollMode}
    {panOnDrag}
    {edgeUpdaterRadius}
    {noDragClassName}
    {noPanClassName}
    {noWheelClassName}
    {nodeTypes}
    {edgeTypes}
    on:flow:init
    on:node:click
    on:edge:click
    on:node:mouseenter
    on:node:mouseleave
    on:node:contextmenu
    on:node:dblclick
    on:node:drag:start
    on:node:drag
    on:node:drag:end
    on:pane:move:start
    on:pane:move
    on:pane:move:end
    on:pane:click
    on:pane:scroll
    on:pane:contextmenu
    on:selection:drag:start
    on:selection:drag
    on:selection:drag:end
    on:selection:contextmenu
    on:edge:update:start
    on:edge:update
    on:edge:update:end
    on:edge:contextmenu
    on:edge:dblclick
    on:edge:mouseenter
    on:edge:mousemove
    on:edge:mouseleave
    on:nodes:change={onNodesChange}
    on:nodes:delete
    on:edges:change={onEdgesChange}
    on:edges:delete
  />
  <slot />
</div>

<style lang="scss" global>
  .svelte-flow {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
  }

  .svelte-flow__container {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  .svelte-flow__pane {
    z-index: 1;
  }

  .svelte-flow__viewport {
    transform-origin: top left;
    z-index: 2;
    pointer-events: none;
  }

  .svelte-flow__renderer {
    z-index: 4;
  }

  .svelte-flow__selectionpane {
    z-index: 5;
  }

  .svelte-flow .svelte-flow__edges {
    pointer-events: none;
    overflow: visible;
  }

  .svelte-flow__edge {
    pointer-events: visibleStroke;

    &.inactive {
      pointer-events: none;
    }
  }

  @keyframes dashdraw {
    from {
      stroke-dashoffset: 10;
    }
  }

  .svelte-flow__edge-path {
    fill: none;
  }

  .svelte-flow__edge-textwrapper {
    pointer-events: all;
  }

  .svelte-flow__edge-text {
    pointer-events: none;
    user-select: none;
  }

  .svelte-flow__connection {
    pointer-events: none;

    .animated {
      stroke-dasharray: 5;
      animation: dashdraw 0.5s linear infinite;
    }
  }

  .svelte-flow__connection-path {
    fill: none;
  }

  .svelte-flow__nodes {
    pointer-events: none;
    transform-origin: 0 0;
  }

  .svelte-flow__node {
    position: absolute;
    user-select: none;
    pointer-events: all;
    transform-origin: 0 0;
    box-sizing: border-box;
  }

  .svelte-flow__nodesselection {
    z-index: 3;
    transform-origin: left top;
    pointer-events: none;

    &-rect {
      position: absolute;
      pointer-events: all;
      cursor: grab;
      width: var(--width) !important;
      height: var(--height) !important;
    }
  }

  .svelte-flow__handle {
    pointer-events: none;

    &.connectable {
      pointer-events: all;
    }
  }

  .svelte-flow__handle-bottom {
    top: auto;
    left: 50%;
    bottom: -4px;
    transform: translate(-50%, 0);
  }

  .svelte-flow__handle-top {
    left: 50%;
    top: -4px;
    transform: translate(-50%, 0);
  }

  .svelte-flow__handle-left {
    top: 50%;
    left: -4px;
    transform: translate(0, -50%);
  }

  .svelte-flow__handle-right {
    right: -4px;
    top: 50%;
    transform: translate(0, -50%);
  }

  .svelte-flow__edgeupdater {
    cursor: move;
    pointer-events: all;
  }

  .svelte-flow__edge {
    &.selected {
      .svelte-flow__edge-path {
        stroke: #555;
      }
    }

    &.animated path {
      stroke-dasharray: 5;
      animation: dashdraw 0.5s linear infinite;
    }

    &.updating {
      .svelte-flow__edge-path {
        stroke: #777;
      }
    }
  }

  .svelte-flow__edge-path {
    stroke: #b1b1b7;
    stroke-width: 1;
  }

  .svelte-flow__edge-text {
    font-size: 10px;
  }

  .svelte-flow__edge-textbg {
    fill: white;
  }

  .svelte-flow__connection-path {
    stroke: #b1b1b7;
    stroke-width: 1;
  }

  .svelte-flow__node {
    cursor: grab;
  }

  .svelte-flow__node-default,
  .svelte-flow__node-input,
  .svelte-flow__node-output,
  .svelte-flow__node-group {
    padding: 10px;
    border-radius: 3px;
    width: 150px;
    font-size: 12px;
    color: #222;
    text-align: center;
    border-width: 1px;
    border-style: solid;
    background: #fff;
    border-color: #1a192b;

    &.selected,
    &.selected:hover {
      box-shadow: 0 0 0 0.5px #1a192b;
    }

    .svelte-flow__handle {
      background: #1a192b;
    }
  }

  .svelte-flow__node-default.selectable,
  .svelte-flow__node-input.selectable,
  .svelte-flow__node-output.selectable,
  .svelte-flow__node-group.selectable {
    &:hover {
      box-shadow: 0 1px 4px 1px rgba(0, 0, 0, 0.08);
    }
  }

  .svelte-flow__node-group {
    background: rgba(240, 240, 240, 0.25);
    border-color: #1a192b;

    &.selected,
    &.selected:hover {
      box-shadow: 0 0 0 0.5px #1a192b;
    }
  }

  .svelte-flow__nodesselection-rect,
  .svelte-flow__selection {
    background: rgba(0, 89, 220, 0.08);
    border: 1px dotted rgba(0, 89, 220, 0.8);
  }

  .svelte-flow__handle {
    position: absolute;
    width: 6px;
    height: 6px;
    background: #555;
    border: 1px solid white;
    border-radius: 100%;

    &.connectable {
      cursor: crosshair;
    }
  }

  .svelte-flow__minimap {
    background-color: #fff;
  }

  .svelte-flow__controls {
    box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.08);

    &-button {
      background: #fefefe;
      border-bottom: 1px solid #eee;
      box-sizing: content-box;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 16px;
      height: 16px;
      cursor: pointer;
      user-select: none;
      padding: 5px;

      svg {
        max-width: 12px;
        max-height: 12px;
      }

      &:hover {
        background: #f4f4f4;
      }
    }
  }

  .svelte-flow__controls {
    position: absolute;
    z-index: 5;
    bottom: 20px;
    left: 15px;

    &-button {
      width: 24px;
      height: 24px;
      border: none;
      margin-bottom: 0;

      svg {
        width: 100%;
      }
    }
  }

  .svelte-flow__minimap {
    position: absolute;
    z-index: 5;
    bottom: 20px;
    right: 15px;

    &-node {
      stroke: #555;
      color: #fff;
      border-radius: 5px;
      stroke-width: 2px;
    }
  }

  .svelte-flow__attribution {
    font-size: 10px;
    position: absolute;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.5);
    padding: 2px 3px;
    color: #999;

    a {
      color: #555;
      text-decoration: none;
    }

    &.top {
      top: 0;
    }

    &.bottom {
      bottom: 0;
    }

    &.left {
      left: 0;
    }

    &.right {
      right: 0;
    }

    &.center {
      left: 50%;
      transform: translateX(-50%);
    }
  }
</style>
