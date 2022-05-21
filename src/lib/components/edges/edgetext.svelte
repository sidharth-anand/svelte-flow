<script lang="ts">
  import { onMount } from "svelte";

  import type { Rect } from "../../types";

  export let x: number;
  export let y: number;
  export let label: string = undefined;
  export let showLabelBg: boolean;
  export let labelBgPadding: Array<number>;
  export let labelBgBorderRadius: number;

  let edge;
  let edgeTextBbox: Rect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  function updateEdgeText(BBox: DOMRect) {
    edgeTextBbox = {
      x: BBox.x,
      y: BBox.y,
      width: BBox.width,
      height: BBox.height,
    };
  }

  onMount(() => {
    if (edge) {
      updateEdgeText(edge.getBBox());
    }
  });

  $: {
    label;
    if (edge) {
      updateEdgeText(edge.getBBox());
    }
  }
</script>

{#if typeof label !== "undefined" && label}
  <g
    transform="translate({x - edgeTextBbox.width / 2} {y -
      edgeTextBbox.height / 2})"
    class="svelte-flow__edge-textwrapper {$$props.class || ''}"
  >
    {#if showLabelBg}
      <rect
        width={edgeTextBbox.width + 2 * labelBgPadding[0]}
        x={-labelBgPadding[0]}
        y={-labelBgPadding[1]}
        height={edgeTextBbox.height + 2 * labelBgPadding[1]}
        class="svelte-flow__edge-textbg"
        rx={labelBgBorderRadius}
        ry={labelBgBorderRadius}
      />
    {/if}
    <slot name="label">
      <text
        class="svelte-flow__edge-text"
        y={edgeTextBbox.height / 2}
        dy="0.3em"
        bind:this={edge}
      >
        {label}
      </text>
    </slot>
    <slot />
  </g>
{/if}
