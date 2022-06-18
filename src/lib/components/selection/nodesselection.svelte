<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { draggable } from "@sidharth-anand/neodrag-svelte";

  import { store } from "../../store";

  import type { Node, NodeChange } from "../../types";
  import { getRectOfNodes } from "../../utils/graph";

  type EventTypes = {
    "selection:drag:start": Node[];
    "selection:drag": Node[];
    "selection:drag:end": Node[];
    "selection:contextmenu": Node[];
    "nodes:change": NodeChange[];
  };

  export let noPanClassName: string;

  const dispatch = createEventDispatcher<EventTypes>();

  $: getSelectedNodes = () => {
    return Array.from($store.nodeInternals)
      .filter(([_, node]) => node.selected)
      .map(([_, node]) => node);
  };

  $: grid = ($store.snapToGrid ? $store.snapGrid : [1, 1])! as [number, number];

  $: transformStyle = `translate(${$store.transform[0]}px, ${$store.transform[1]}px) scale(${$store.transform[2]})`;

  $: selectedNodes = getSelectedNodes();
  $: selectedNodesBBox = getRectOfNodes(selectedNodes);

  const dispatchEvent = (eventName: keyof EventTypes) => {
    dispatch(eventName, selectedNodes);
  };

  const onStart = (
    _: CustomEvent<{ offsetX: number; offsetY: number; domRect: DOMRect }>
  ) => dispatchEvent("selection:drag:start");

  const onDrag = (
    event: CustomEvent<{ offsetX: number; offsetY: number; domRect: DOMRect }>
  ) => {
    dispatch(
      "nodes:change",
      store.updateNodePosition({
        diff: {
          x: event.detail.offsetX - selectedNodesBBox.x,
          y: event.detail.offsetY - selectedNodesBBox.y,
        },
        dragging: true,
      })
    );

    dispatchEvent("selection:drag");
  };

  const onStop = (
    _: CustomEvent<{ offsetX: number; offsetY: number; domRect: DOMRect }>
  ) => {
    dispatch(
      "nodes:change",
      store.updateNodePosition({
        dragging: false,
      })
    );

    dispatchEvent("selection:drag:end");
  };

  const onContextMenu = (_: MouseEvent) =>
    dispatchEvent("selection:contextmenu");

  $: skipRender = !selectedNodes?.length || $store.usersSelectionActive;
</script>

{#if !skipRender}
  <div
    class="svelte-flow__nodesselection svelte-flow__container {noPanClassName} {$$props.class ||
      null}"
    style:transform={transformStyle}
  >
    <div
      use:draggable={{
        grid,
        applyUserSelectHack: false,
        position: {
          x: selectedNodesBBox.x,
          y: selectedNodesBBox.y,
        },
      }}
      class="svelte-flow__nodesselection-rect"
      on:neodrag:start={onStart}
      on:neodrag={onDrag}
      on:neodrag:end={onStop}
      on:contextmenu={onContextMenu}
      style:--width="{selectedNodesBBox.width}px"
      style:--height="{selectedNodesBBox.height}px"
    />
  </div>
{/if}
