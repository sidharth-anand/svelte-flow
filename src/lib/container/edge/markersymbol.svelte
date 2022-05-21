<script lang="ts">
  import { MarkerType } from "../../types";

  export let color: string;
  export let strokeWidth: number = 1;
  export let markerType: MarkerType = MarkerType.Arrow;

  const markerPaths: Record<MarkerType, string> = {
    [MarkerType.Arrow]: "-5,-4 0,0 -5,4",
    [MarkerType.ArrowClosed]: "-5,-4 0,0 -5,4 -5,-4",
  };

  const markerColors: Record<MarkerType, string> = {
      [MarkerType.Arrow]: "none",
      [MarkerType.ArrowClosed]: color
  };
</script>

<polyline
  stroke={color}
  stroke-linecap="round"
  stroke-linejoin="round"
  stroke-width={strokeWidth}
  fill={markerColors[markerType]}
  points={markerPaths[markerType]}
/>
