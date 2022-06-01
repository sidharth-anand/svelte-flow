<script lang="ts">
  import { onMount } from "svelte";

  import { store } from "../../store";

  import { BackgroundVariant } from "../../types";

  const defaultColors: Record<BackgroundVariant, string> = {
    [BackgroundVariant.Dots]: "#81818a",
    [BackgroundVariant.Lines]: "#eee",
  };

  export let variant: BackgroundVariant = BackgroundVariant.Dots;
  export let gap: number = 15;
  export let size: number = 0.4;
  export let color: string = "";

  let svgEl;
  let patternId;

  onMount(() => {
    const backgrounds = document.querySelectorAll(".svelte-flow__background");
    const index = Array.from(backgrounds).findIndex((el) => el === svgEl);

    patternId = `pattern-${index}`;
  });

  $: scaledGap = gap * $store.transform[2];
  $: xOffset = $store.transform[0] % scaledGap;
  $: yOffset = $store.transform[1] % scaledGap;

  $: bgColor = color ? color : defaultColors[variant];
</script>

<svg
  class="svelte-flow__background svelte-flow_container {$$props.class || ''}"
  style:width="100%"
  style:height="100%"
  bind:this={svgEl}
>
  {#if patternId}
    <pattern
      id={patternId}
      x={xOffset}
      y={yOffset}
      width={scaledGap}
      height={scaledGap}
      patternUnits="userSpaceOnUse"
    >
      {#if variant === BackgroundVariant.Lines}
        <path
          stroke={bgColor}
          stroke-width={size}
          d="M{size / 2} 0 V{size} M0 {size / 2} H{size}"
        />
      {:else if variant === BackgroundVariant.Dots}
        <circle
          cx={size * $store.transform[2]}
          cy={size * $store.transform[2]}
          r={size * $store.transform[2]}
          fill={bgColor}
        />
      {/if}
    </pattern>
    <rect x="0" y="0" width="100%" height="100%" fill="url(#{patternId})" />
  {/if}
</svg>
