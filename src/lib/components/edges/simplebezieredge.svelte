<script lang="ts">
  import BaseEdge from "./baseedge.svelte";

  import type { Position } from "../../types";

  import { getSimpleBezierPath, getSimpleBezierCenter } from "./simplebezier";

  export let sourceX: number;
  export let sourceY: number;
  export let targetX: number;
  export let targetY: number;

  export let label: string;
  export let showLabelBg: boolean;
  export let labelBgPadding: Array<number>;
  export let labelBgBorderRadius: number;

  export let sourcePosition: Position;
  export let targetPosition: Position;

  export let markerStart: string;
  export let markerEnd: string;

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
