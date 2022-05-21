<script lang="ts">
  import BaseEdge from "./baseedge.svelte";

  import { Position } from "../../types";

  import { getSimpleBezierPath, getSimpleBezierCenter } from "./simplebezier";

  export let sourceX: number;
  export let sourceY: number;
  export let targetX: number;
  export let targetY: number;

  export let label: string = "";
  export let showLabelBg: boolean = true;
  export let labelBgPadding: Array<number> = [2, 4];
  export let labelBgBorderRadius: number = 2;

  export let sourcePosition: Position = Position.Bottom;
  export let targetPosition: Position = Position.Top;

  export let markerStart: string = null;
  export let markerEnd: string = null;

  $: params = {
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  };

  $: path = getSimpleBezierPath(params);
  $: [centerX, centerY] = getSimpleBezierCenter(params);
</script>

<BaseEdge
  {path}
  {centerX}
  {centerY}
  {label}
  {showLabelBg}
  {labelBgPadding}
  {labelBgBorderRadius}
  {markerStart}
  {markerEnd}
/>
