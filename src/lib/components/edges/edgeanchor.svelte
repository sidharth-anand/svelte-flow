<script lang="ts">
  import { Position } from "../../types";

  function shiftX(x: number, shift: number, position: Position): number {
    if (position == Position.Left) return x - shift;
    if (position === Position.Right) return x + shift;
    return x;
  }

  function shiftY(y: number, shift: number, position: Position): number {
    if (position == Position.Top) return y - shift;
    if (position === Position.Bottom) return y + shift;
    return y;
  }

  export let position: Position;
  export let centerX: number;
  export let centerY: number;
  export let radius: number = 10;
</script>

<circle
  class="svelte-flow__edgeupdater {$$props.class}"
  cx={shiftX(centerX, radius, position)}
  cy={shiftY(centerY, radius, position)}
  r={radius}
  stroke="transparent"
  fill="transparent"
/>
