<script lang="ts">
  import Handle from "../handle/handle.svelte";

  import { Position } from "../../types";

  //TODO: data is a generic
  export let data: any;
  export let isConnectable: boolean = true;
  export let sourcePosition: Position = Position.Bottom;
</script>

{@html data?.label}
<Handle type="source" position={sourcePosition} {isConnectable} />
