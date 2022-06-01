<script lang="ts">
  import SmoothStepEdge from "./smoothstepedge.svelte";

  import type { Position } from "../../types";

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
</script>

<SmoothStepEdge
  {sourceX}
  {sourceY}
  {targetX}
  {targetY}
  {label}
  {showLabelBg}
  {labelBgPadding}
  {labelBgBorderRadius}
  {sourcePosition}
  {targetPosition}
  {markerStart}
  {markerEnd}
  borderRadius={0}
/>
