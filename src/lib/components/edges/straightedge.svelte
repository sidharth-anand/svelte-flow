<script lang="ts">
  import BaseEdge from "./baseedge.svelte";

  export let sourceX: number;
  export let sourceY: number;
  export let targetX: number;
  export let targetY: number;

  export let label: string;
  export let showLabelBg: boolean;
  export let labelBgPadding: Array<number>;
  export let labelBgBorderRadius: number;

  export let markerStart: string;
  export let markerEnd: string;

  $: xOffset = Math.abs(targetX - sourceX) / 2;
  $: centerX = targetX < sourceX ? targetX + xOffset : targetX - xOffset;

  $: yOffset = Math.abs(targetY - sourceY) / 2;
  $: centerY = targetY < sourceY ? targetY + yOffset : targetY - yOffset;

  $: path = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
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
