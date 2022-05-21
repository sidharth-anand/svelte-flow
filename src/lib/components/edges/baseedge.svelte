<script lang="ts">
  import EdgeText from "./edgetext.svelte";

  export let path: string;
  export let centerX: number;
  export let centerY: number;

  export let label: string = "";
  export let showLabelBg: boolean;
  export let labelBgPadding: Array<number>;
  export let labelBgBorderRadius: number;
  
  export let markerStart: string = null;
  export let markerEnd: string = null;
</script>

<path d={path} class="svelte-flow__edge-path {$$props.class}" marker-start={markerStart} marker-end={markerEnd} />
{#if $$slots.label}
  <EdgeText
    x={centerX}
    y={centerY}
    {showLabelBg}
    {labelBgPadding}
    {labelBgBorderRadius}
  >
    <slot name="label" slot="label" />
  </EdgeText>
{:else}
  <EdgeText
    x={centerX}
    y={centerY}
    {showLabelBg}
    {labelBgPadding}
    {labelBgBorderRadius}
    {label}
  />
{/if}
