<script lang="ts">
  import { store } from "../../store";

  import type { Node } from "../../types";

  import { getBoundsofRects } from "../../utils";
  import { getRectOfNodes } from "../../utils/graph";

  const defaultWidth = 200;
  const defaultHeight = 150;

  type MiniMapAttribute<NodeData = any> =
    | string
    | ((node: Node<NodeData>) => string);

  export let nodeClass: MiniMapAttribute = "";

  const elementWidth: number = $$props?.style?.width || defaultWidth;
  const elementHeight: number = $$props?.style?.height || defaultHeight;

  $: nodeClassFunction =
    typeof nodeClass === "function" ? nodeClass : () => nodeClass;
  $: hasNodes = $store.nodeInternals && $store.nodeInternals.size > 0;

  $: nodes = Array.from($store.nodeInternals).map(([_, node]) => node);
  $: boundingBox = getRectOfNodes(nodes);
  $: viewBoundingBox = {
    x: -$store.transform[0] / $store.transform[2],
    y: -$store.transform[1] / $store.transform[2],
    width: $store.width / $store.transform[2],
    height: $store.height / $store.transform[2],
  };

  $: boundingRect = hasNodes
    ? getBoundsofRects(boundingBox, viewBoundingBox)
    : viewBoundingBox;

  $: scaledWidth = boundingRect.width / elementWidth;
  $: scaledHeight = boundingRect.height / elementHeight;

  $: viewScale = Math.max(scaledWidth, scaledHeight);
  $: viewWidth = viewScale * elementWidth;
  $: viewHeight = viewScale * elementHeight;
  $: offset = 5 * viewScale;

  $: x = boundingRect.x - (viewWidth - boundingRect.width) / 2 - offset;
  $: y = boundingRect.y - (viewHeight - boundingRect.height) / 2 - offset;

  $: width = viewWidth + offset * 2;
  $: height = viewHeight + offset * 2;

  $: shapeRendering =
    typeof window === "undefined" || !!(window as any).chrome
      ? "crispEdges"
      : "geometricPrecision";

  $: renderNodes = nodes.filter(
    (node) => !node.hidden && node.width && node.height
  );
</script>

<svg
  width={elementWidth}
  height={elementHeight}
  viewBox="{x} {y} {width} {height}"
  class="svelte-flow__minimap {$$props.class || ''}"
>
  {#each renderNodes as node (node.id)}
    <rect
      class="svelte-flow__minimap-node {nodeClassFunction(node)}"
      x={$store.nodeInternals.get(node.id)?.positionAbsolute?.x || 0}
      y={$store.nodeInternals.get(node.id)?.positionAbsolute?.y || 0}
      width={node.width}
      height={node.height}
      shape-rendering={shapeRendering}
    />
  {/each}
  <path
    class="svelte-flow__minimap-mask"
    d="M{x - offset},{y - offset}h{width + offset * 2}v{height +
      offset * 2}h{-width -
      offset *
        2}z M{viewBoundingBox.x},{viewBoundingBox.y}h{viewBoundingBox.width}v{viewBoundingBox.height}h{-viewBoundingBox.width}z"
    fill-rule="evenodd"
  />
</svg>

<style>
  .svelte-flow .svelte-flow__minimap .svelte-flow__minimap-mask {
    fill: "#E5ECEC";
  }
</style>