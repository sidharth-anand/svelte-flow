<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { store } from "../../store";

  import type { XYPosition, NodeChange, EdgeChange, Rect } from "../../types";

  import { getSelectionChanges } from "../../utils/changes";
  import { getConnectedEdges, getNodesInside } from "../../utils/graph";

  type SelectionRect = Rect & {
    startX: number;
    startY: number;
    draw: boolean;
  };

  type EventTypes = {
    'nodes:change': NodeChange[];
    'edges:change': EdgeChange[];
  }

  export let selectionKeyPressed: boolean;

  const dispatch = createEventDispatcher<EventTypes>();

  function getMousePosition(
    event: MouseEvent,
    containerBounds: DOMRect
  ): XYPosition {
    return {
      x: event.clientX - containerBounds.left,
      y: event.clientY - containerBounds.top,
    };
  }

  const initialRect: SelectionRect = {
    startX: 0,
    startY: 0,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    draw: false,
  };

  let prevSelectedNodesCount: number = 0;
  let prevSelectedEdgesCount: number = 0;
  let containerBounds: DOMRect = null;
  let userSelectionRect = initialRect;

  $: renderUserSelectionPane =
    $store.usersSelectionActive || selectionKeyPressed;

  const resetUserSelection = () => {
    userSelectionRect = initialRect;

    store.update((state) => ({
      ...state,
      usersSelectionActive: false,
    }));

    prevSelectedEdgesCount = 0;
    prevSelectedNodesCount = 0;
  };

  const onMouseDown = (event: MouseEvent): void => {
    const svelteFlowNode = (event.target as Element).closest(".svelte-flow");
    containerBounds = svelteFlowNode.getBoundingClientRect();

    const mousePos = getMousePosition(event, containerBounds);

    userSelectionRect = {
      width: 0,
      height: 0,
      startX: mousePos.x,
      startY: mousePos.y,
      x: mousePos.x,
      y: mousePos.y,
      draw: true,
    };

    store.update((state) => ({
      ...state,
      usersSelectionActive: true,
      nodesSelectionActive: true,
    }));
  };

  const onMouseMove = (event: MouseEvent): void => {
    if (!selectionKeyPressed || !userSelectionRect.draw || !containerBounds) {
      return;
    }

    const mousePos = getMousePosition(event, containerBounds);
    const startX = userSelectionRect.startX;
    const startY = userSelectionRect.startY;

    const nextUserSelecetionRect = {
      ...userSelectionRect,
      x: mousePos.x < startX ? mousePos.x : startX,
      y: mousePos.y < startY ? mousePos.y : startY,
      width: Math.abs(mousePos.x - startX),
      height: Math.abs(mousePos.y - startY),
    };

    const nodes = Array.from($store.nodeInternals).map(([_, node]) => node);

    const selectedNodes = getNodesInside(
      $store.nodeInternals,
      nextUserSelecetionRect,
      $store.transform,
      false,
      true
    );
    const selectedEdgeIds = getConnectedEdges(selectedNodes, $store.edges).map(
      (edge) => edge.id
    );
    const selectedNodeIds = selectedNodes.map((node) => node.id);

    if (prevSelectedNodesCount !== selectedNodeIds.length) {
      prevSelectedNodesCount = selectedNodeIds.length;
      const changes = getSelectionChanges(
        nodes,
        selectedNodeIds
      ) as NodeChange[];
      if (changes.length) {
        dispatch('nodes:change', changes);
      }
    }

    if (prevSelectedEdgesCount !== selectedEdgeIds.length) {
      prevSelectedEdgesCount = selectedEdgeIds.length;
      const changes = getSelectionChanges(
        selectedEdgeIds,
        selectedEdgeIds
      ) as EdgeChange[];
      if (changes.length) {
        dispatch('edges:change', changes);
      }
    }

    userSelectionRect = nextUserSelecetionRect;
  };

  const onMouseUp = () => {
    store.update((state) => ({
      ...state,
      nodesSelectionActive: prevSelectedNodesCount > 0,
    }));

    resetUserSelection();
  };

  const onMouseLeave = () => {
    store.update((state) => ({
      ...state,
      nodesSelectionActive: false,
    }));

    resetUserSelection();
  };

  $: skipRender = !$store.elementsSelectable || !renderUserSelectionPane;
</script>

{#if !skipRender}
  <div
    class="svelte-flow__selectionpane svelte-flow__container {$$props.class || ''}"
    on:mousedown={onMouseDown}
    on:mousemove={onMouseMove}
    on:mouseleave={onMouseLeave}
    on:mouseup={onMouseUp}
  >
    {#if userSelectionRect.draw}
      <div
        class="svelte-flow__selection svelte-flow__container"
        style:width="{userSelectionRect.width}px"
        style:height="{userSelectionRect.height}px"
        style:transform="translate({userSelectionRect.x}px, {userSelectionRect.y}px)"
      />
    {/if}
  </div>
{/if}
