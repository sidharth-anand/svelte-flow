<script lang="ts">
  import type { SvelteComponent } from "svelte";

  import { onInitHandler } from "../../store/oninithandler";

  import {
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

  //TODO: add support for custom node and edge types

  export let connectionLineType: ConnectionLineType;

  export let selectionKeyCode: KeyCode | null = null;
  export let deleteKeyCode: KeyCode | null = null;
  export let multiSelectionKeyCode: KeyCode | null = null;
  export let zoomActivationKeyCode: KeyCode | null = null;

  export let onlyRenderVisibleElements: boolean = true;

  export let selectNodesOnDrag: boolean;

  export let defaultPosition: [number, number] = [0, 0];
  export let defaultZoom: number = 1;

  export let preventScrolling: boolean = true;

  export let zoomOnScroll: boolean = true;
  export let zoomOnPinch: boolean = true;
  export let zoomOnDoubleClick: boolean = true;

  export let panOnScroll: boolean = false;
  export let panOnDrag: boolean = true;
  export let panOnScrollSpeed: number = 0.5;
  export let panOnScrollMode: PanOnScrollMode = PanOnScrollMode.Free;

  export let defaultMarkerColor: string;
  export let edgeUpdaterRadius: number;

  export let noDragClassName: string;
  export let noPanClassName: string;
  export let noWheelClassName: string;

  export let onInit: OnInit | null = null;

  export let nodeTypes: NodeTypes = {};
  export let edgeTypes: EdgeTypes = {};
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
