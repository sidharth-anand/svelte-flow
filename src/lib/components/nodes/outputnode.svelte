<script lang="ts">
  import Handle from "../handle/handle.svelte";

  import { Position } from "../../types";

  //TODO: data is a generic
  export let data: any;
  export let isConnectable: boolean = true;
  export let targetPosition: Position = Position.Top;
</script>

<Handle type="target" position={targetPosition} {isConnectable} />
{@html data?.label}
