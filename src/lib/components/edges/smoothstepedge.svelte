<script lang="ts">
  import BaseEdge from "./baseedge.svelte";

  import { Position } from "../../types";

  import { getSmoothStepPath } from "./smoothstep";
  import { getCenter } from "./utils";

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

  export let borderRadius: number = 5;

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
