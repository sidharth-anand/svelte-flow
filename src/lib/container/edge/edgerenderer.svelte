<script lang="ts">
  import type { SvelteComponent } from "svelte";

  import { store } from "../../store";
  import { groupEdgesByZLevel, visibleEdges } from "../../store/visibleedges";

  import StraightEdge from "../../components/edges/straightedge.svelte";
  import BezierEdge from "../../components/edges/bezieredge.svelte";
  import StepEdge from "../../components/edges/stepedge.svelte";
  import SmoothStepEdge from "../../components/edges/smoothstepedge.svelte";
  import SimpleBezierEdge from "../../components/edges/simplebezieredge.svelte";
  import WrapEdge from "../../components/edges/wrapedge.svelte";

  import ConnectionLine from "../../components/connectionline/connectionline.svelte";
  import MarkerDefinition from "./markerdefinition.svelte";

  import { getEdgePositions, getHandle, getNodeData } from "./utils";

  import {
    Position,
    Edge,
    ConnectionLineType,
    ConnectionMode,
    EdgeTypes,
  } from "../../types";

  export let edgeTypes: EdgeTypes;
  export let connectionLineComponent: typeof SvelteComponent = null;
  export let connectionLineType: ConnectionLineType;
  export let onlyRenderVisibleElements: boolean;
  export let defaultMarkerColor: string;
  export let edgeUpdaterRadius: number;
  export let noPanClassName: string;

  const edges = visibleEdges(onlyRenderVisibleElements, $store.nodeInternals);
  $: edgeTree = groupEdgesByZLevel($edges, $store.nodeInternals);

  $: renderConnectionLine =
    $store.connectionNodeId && $store.connectionHandleType;

  type EdgeRenderProps = Edge & {
    skipRender: boolean;

    sourceX?: number;
    sourceY?: number;
    targetX?: number;
    targetY?: number;

    sourcePosition?: Position;
    targetPosition?: Position;
  };

  $: getEdgeRenderProps = (edge: Edge): EdgeRenderProps => {
    const [sourceNodeRect, sourceHandleBounds, sourceIsValid] = getNodeData(
      $store.nodeInternals,
      edge.source
    );
    const [targetNodeRect, targetHandleBounds, targetIsValid] = getNodeData(
      $store.nodeInternals,
      edge.target
    );

    if (!sourceIsValid || !targetIsValid) {
      return {
        ...edge,
        skipRender: true,
      };
    }

    const targetNodeHandles =
      $store.connectionMode === ConnectionMode.Strict
        ? targetHandleBounds!.target
        : targetHandleBounds!.target || targetHandleBounds!.source;

    const sourceHandle = getHandle(
      sourceHandleBounds!.source!,
      edge.sourceHandle || null
    );
    const targetHandle = getHandle(
      targetNodeHandles!,
      edge.targetHandle || null
    );

    const sourcePosition = sourceHandle?.position || Position.Bottom;
    const targetPosition = targetHandle?.position || Position.Top;

    if (!sourceHandle || !targetHandle) {
      return {
        ...edge,
        skipRender: true,
      };
    }

    const { sourceX, sourceY, targetX, targetY } = getEdgePositions(
      sourceNodeRect,
      sourceHandle,
      sourcePosition,
      targetNodeRect,
      targetHandle,
      targetPosition
    );

    return {
      ...edge,
      skipRender: false,
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    };
  };

  const EdgeTypes: EdgeTypes = {
    [ConnectionLineType.Straight]: StraightEdge,
    [ConnectionLineType.Bezier]: BezierEdge,
    [ConnectionLineType.Step]: StepEdge,
    [ConnectionLineType.SmoothStep]: SmoothStepEdge,
    [ConnectionLineType.SimpleBezier]: SimpleBezierEdge,
    ...edgeTypes,
  };

  //TODO: Add connection slot to ConnectionLine
</script>

{#each edgeTree as { level, edges, isMaxLevel } (level)}
  <svg
    style:z-index={level}
    width={$store.width}
    height={$store.height}
    class="svelte-flow__edges svelte-flow__container"
  >
    {#if isMaxLevel}
      <MarkerDefinition defaultColor={defaultMarkerColor} />
    {/if}

    <g>
      {#each edges.map(getEdgeRenderProps) as edge (edge.id)}
        {#if !edge.skipRender}
          <WrapEdge
            id={edge.id}
            type={edge.type ?? ConnectionLineType.Bezier}
            data={edge.data}
            class="{noPanClassName} {edge.class ?? ''}"
            selected={!!edge.selected}
            animated={!!edge.animated}
            source={edge.source}
            target={edge.target}
            sourceHandleId={edge.sourceHandle}
            targetHandleId={edge.targetHandle}
            sourceX={edge.sourceX}
            sourceY={edge.sourceY}
            targetX={edge.targetX}
            targetY={edge.targetY}
            sourcePosition={edge.sourcePosition}
            targetPosition={edge.targetPosition}
            elementsSelectable={$store.elementsSelectable}
            {edgeUpdaterRadius}
            markerStart={edge.markerStart}
            markerEnd={edge.markerEnd}
            on:edge:click
            on:edge:dblclick
            on:edge:contextmenu
            on:edge:mouseenter
            on:edge:mousemove
            on:edge:mouseleave
            on:edge:update:start
            on:edge:update
            on:edge:update:end
          >
            <svelte:fragment
              slot="edge"
              let:markerStart
              let:markerEnd
              let:id
              let:data
              let:sourceX
              let:sourceY
              let:targetX
              let:targetY
              let:sourcePosition
              let:targetPosition
              let:selected
              let:animated
            >
              <svelte:component
                this={EdgeTypes[edge.type]}
                slot="edge"
                label={edge.label}
                showLabelBg={edge.labelShowBg}
                labelBgPadding={edge.labelBgPadding}
                labelBgBorderRadius={edge.labelBgBorderRadius}
                {id}
                {data}
                {sourcePosition}
                {targetPosition}
                {sourceX}
                {sourceY}
                {targetX}
                {targetY}
                {markerStart}
                {markerEnd}
                {selected}
                {animated}
              />
            </svelte:fragment>
          </WrapEdge>
        {/if}
      {/each}
      {#if renderConnectionLine && isMaxLevel}
        {#if connectionLineComponent}
          <svelte:component
            this={connectionLineComponent}
            nodeId={$store.connectionNodeId}
            handleId={$store.connectionHandleId}
            handleType={$store.connectionHandleType}
            x={$store.connectionPosition.x}
            y={$store.connectionPosition.y}
            type={connectionLineType}
            isConnectable={$store.nodesConnectable}
          />
        {:else}
          <ConnectionLine
            nodeId={$store.connectionNodeId}
            handleId={$store.connectionHandleId}
            handleType={$store.connectionHandleType}
            x={$store.connectionPosition.x}
            y={$store.connectionPosition.y}
            type={connectionLineType}
            isConnectable={$store.nodesConnectable}
          />
        {/if}
      {/if}
    </g>
  </svg>
{/each}
