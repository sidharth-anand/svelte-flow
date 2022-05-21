<script lang="ts">
  import Handle from "../handle/handle.svelte";

  import { Position } from "../../types";

  //TODO: make data a generic here

  export let data: any;
  export let isConnectable: boolean = true;
  export let sourcePosition: Position = Position.Bottom;
  export let targetPosition: Position = Position.Top;
</script>

<Handle type="target" position={targetPosition} {isConnectable} />
{#if data?.label}
  {@html data.label}
{/if}
<Handle type="source" position={sourcePosition} {isConnectable} />
