<script lang="ts">
  import Handle from "../handle/handle.svelte";

  import type { Position } from "../../types";

  //TODO: make data a generic here

  export let data: any;
  export let isConnectable: boolean;
  export let sourcePosition: Position;
  export let targetPosition: Position;
</script>

<Handle type="target" position={targetPosition} {isConnectable} />
{#if data?.label}
  {@html data.label}
{/if}
<Handle type="source" position={sourcePosition} {isConnectable} />
