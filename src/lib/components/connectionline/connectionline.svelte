<script lang="ts">
  import { store } from "../../store";

  import { ConnectionLineType, HandleType, Position } from "../../types";

  import { getBezierPath } from "../edges/bezier";
  import { getSmoothStepPath } from "../edges/smoothstep";
  import { getSimpleBezierPath } from "../edges/simplebezier";

  export let nodeId: string;
  export let handleId: string | null = null;
  export let handleType: HandleType;
  export let x: number;
  export let y: number;
  export let isConnectable: boolean = true;
  export let type: ConnectionLineType = ConnectionLineType.Bezier;

  $: fromNode = $store.nodeInternals.get(nodeId);

  $: skipRender =
    !fromNode || !isConnectable || !fromNode.handleBounds?.[handleType];

  $: handleBound = fromNode.handleBounds?.[handleType];
  $: fromHandle = handleId
    ? handleBound?.find((d) => d.id === handleId)
    : handleBound?.[0];

  $: fromHandleX = fromHandle
    ? fromHandle.x + fromHandle.width / 2
    : (fromNode?.width ?? 0) / 2;
  $: fromHandleY = fromHandle
    ? fromHandle.y + fromHandle.height / 2
    : (fromNode?.height ?? 0) / 2;

  $: fromX = (fromNode.positionAbsolute?.x || 0) + fromHandleX;
  $: fromY = (fromNode.positionAbsolute?.y || 0) + fromHandleY;

  $: toX = (x - $store.transform[0]) / $store.transform[2];
  $: toY = (y - $store.transform[1]) / $store.transform[2];

  $: fromPosition = fromHandle?.position;
  let toPosition: Position | undefined;

  $: {
    switch (fromPosition) {
      case Position.Left:
        toPosition = Position.Right;
        break;
      case Position.Right:
        toPosition = Position.Left;
        break;
      case Position.Top:
        toPosition = Position.Bottom;
        break;
      case Position.Bottom:
        toPosition = Position.Top;
        break;
    }
  }

  let sourceX: number;
  let sourceY: number;
  let sourcePosition: Position | undefined;

  let targetX: number;
  let targetY: number;
  let targetPosition: Position | undefined;

  $: {
    switch (handleType) {
      case "source":
        sourceX = fromX;
        sourceY = fromY;
        sourcePosition = fromPosition;
        targetX = toX;
        targetY = toY;
        targetPosition = toPosition;
        break;

      case "target":
        sourceX = toX;
        sourceY = toY;
        sourcePosition = toPosition;
        targetX = fromX;
        targetY = fromY;
        targetPosition = fromPosition;
        break;
    }
  }

  let path: string = "";

  $: pathParams = {
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  };

  $: {
    if (type === ConnectionLineType.Bezier) {
      path = getBezierPath(pathParams);
    } else if (type === ConnectionLineType.Step) {
      path = getSmoothStepPath({
        ...pathParams,
        borderRadius: 0,
      });
    } else if (type === ConnectionLineType.SmoothStep) {
      path = getSmoothStepPath(pathParams);
    } else if (type === ConnectionLineType.SimpleBezier) {
      path = getSimpleBezierPath(pathParams);
    } else {
      path = `M${sourceX},${sourceY} ${targetX},${targetY}`;
    }
  }
</script>

{#if !skipRender}
  <g class="svelte-flow__connection">
    {#if $$slots.connection}
      <slot
        name="connection"
        {sourceX}
        {sourceY}
        {sourcePosition}
        {targetX}
        {targetY}
        {targetPosition}
        {type}
        {fromNode}
        {fromHandle}
      />
    {:else}
      <path d={path} class="svelte-flow__connection-path" />
    {/if}
  </g>
{/if}
