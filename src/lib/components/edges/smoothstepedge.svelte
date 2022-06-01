<script lang="ts">
  import BaseEdge from "./baseedge.svelte";

  import type { Position } from "../../types";

  import { getSmoothStepPath } from "./smoothstep";
  import { getCenter } from "./utils";

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

  export let borderRadius: number;

  $: params = {
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius,
  };

  $: [centerX, centerY] = getCenter(params);
  $: path = getSmoothStepPath(params);
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
/>;
