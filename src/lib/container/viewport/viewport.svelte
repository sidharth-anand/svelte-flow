<script lang="ts">
  import { store } from "../../store";

  $: transformStyle = `translate(${$store.transform[0]}px, ${$store.transform[1]}px) scale(${$store.transform[2]})`;
</script>

<div
  class="svelte-flow__viewport svelte-flow__container {$$props.class || ""}"
  style:transform={transformStyle}
>
  <slot />
</div>