<script lang="ts">
  import Handle from "../handle/handle.svelte";

  import type { Position } from "../../types";

  //TODO: data is a generic
  export let data: any;
  export let isConnectable: boolean;
  export let targetPosition: Position;
</script>

<Handle type="target" position={targetPosition} {isConnectable} />
{@html data?.label}
