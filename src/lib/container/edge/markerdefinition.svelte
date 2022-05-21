<script lang="ts">
  import { store } from "../../store";

  import MarkerSymbol from "./markersymbol.svelte";

  import type { EdgeMarker } from "../../types";

  import { getMarkerId } from "../../utils/graph";

  interface Marker extends EdgeMarker {
    id: string;
  }

  export let defaultColor: string;

  const getMarkers = () => {
    const ids: string[] = [];

    return $store.edges.reduce<Marker[]>((markers, edge) => {
      [edge.markerStart, edge.markerEnd].forEach((marker) => {
        if (marker && typeof marker === "object") {
          const markerId = getMarkerId(marker);
          if (!ids.includes(markerId)) {
            markers.push({
              id: markerId,
              color: marker.color || defaultColor,
              ...marker,
            });
            ids.push(markerId);
          }
        }
      });
      return markers.sort((a, b) => a.id.localeCompare(b.id));
    }, []);
  };

  $: markers = getMarkers();
</script>

<defs>
  {#each markers as marker (marker.id)}
    <marker
      class="svelte-flow__arrowhead"
      id={marker.id}
      markerWidth={marker.width ?? 12.5}
      markerHeight={marker.height ?? 12.5}
      viewBox="-10 -10 20 20"
      markerUnits={marker.markerUnits ?? "strokeWidth"}
      orient={marker.orient ?? 'auto'}
      refX="0"
      refY="0"
    >
      <MarkerSymbol
        color={marker.color}
        strokeWidth={marker.strokeWidth}
        markerType={marker.type}
      />
    </marker>
  {/each}
</defs>
