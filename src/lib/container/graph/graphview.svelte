<script lang="ts">
  import type { SvelteComponent } from "svelte";

  import { onInitHandler } from "../../store/oninithandler";

  import type {
    ConnectionLineType,
    KeyCode,
    PanOnScrollMode,
    OnInit,
    NodeTypes,
    EdgeTypes,
  } from "../../types";

  import FlowRenderer from "../flow/flowrenderer.svelte";
  import NodeRenderer from "../node/noderenderer.svelte";
  import EdgeRenderer from "../edge/edgerenderer.svelte";
  import Viewport from "../viewport/viewport.svelte";

  export let connectionLineType: ConnectionLineType;

  export let selectionKeyCode: KeyCode;
  export let deleteKeyCode: KeyCode;
  export let multiSelectionKeyCode: KeyCode;
  export let zoomActivationKeyCode: KeyCode;

  export let onlyRenderVisibleElements: boolean;

  export let selectNodesOnDrag: boolean;

  export let defaultPosition: [number, number];
  export let defaultZoom: number;

  export let preventScrolling: boolean;

  export let zoomOnScroll: boolean;
  export let zoomOnPinch: boolean;
  export let zoomOnDoubleClick: boolean;

  export let panOnScroll: boolean;
  export let panOnDrag: boolean;
  export let panOnScrollSpeed: number;
  export let panOnScrollMode: PanOnScrollMode;

  export let defaultMarkerColor: string;
  export let edgeUpdaterRadius: number;

  export let noDragClassName: string;
  export let noPanClassName: string;
  export let noWheelClassName: string;

  //TODO: onInit must be an event not a callback

  export let onInit: OnInit | null = null;

  export let nodeTypes: NodeTypes;
  export let edgeTypes: EdgeTypes;

  export let connectionLineComponent: typeof SvelteComponent = null;

  onInitHandler(onInit);
</script>

<FlowRenderer
  {selectionKeyCode}
  {deleteKeyCode}
  {multiSelectionKeyCode}
  {zoomActivationKeyCode}
  {zoomOnScroll}
  {zoomOnPinch}
  {zoomOnDoubleClick}
  {panOnScroll}
  {panOnScrollSpeed}
  {panOnScrollMode}
  {panOnDrag}
  {defaultPosition}
  {defaultZoom}
  {preventScrolling}
  {noPanClassName}
  {noWheelClassName}
  on:pane:click
  on:pane:contextmenu
  on:pane:scroll
  on:pane:move:start
  on:pane:move
  on:pane:move:end
  on:selection:drag:start
  on:selection:drag
  on:selection:drag:end
  on:selection:contextmenu
>
  <Viewport>
    <EdgeRenderer
      {connectionLineComponent}
      {connectionLineType}
      {onlyRenderVisibleElements}
      {defaultMarkerColor}
      {noPanClassName}
      {edgeUpdaterRadius}
      {edgeTypes}
      on:edge:click
      on:edge:dblclick
      on:edge:update:start
      on:edge:update
      on:edge:update:end
      on:edge:contextmenu
      on:edge:mouseenter
      on:edge:mousemove
      on:edge:mouseleave
    />
    <NodeRenderer
      {selectNodesOnDrag}
      {onlyRenderVisibleElements}
      {noPanClassName}
      {noDragClassName}
      {nodeTypes}
      on:node:click
      on:node:dblclick
      on:node:mouseenter
      on:node:mouseleave
      on:node:contextmenu
      on:node:drag:start
      on:node:drag
      on:node:drag:end
    />
  </Viewport>
</FlowRenderer>
