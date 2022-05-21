<script lang="ts">
  import SmoothStepEdge from "./smoothstepedge.svelte";

  import { Position } from "../../types";

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
