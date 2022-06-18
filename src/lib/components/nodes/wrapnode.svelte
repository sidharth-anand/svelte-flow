<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { draggable } from "@sidharth-anand/neodrag-svelte";

  import { store } from "../../store";

  import { NodeIdKey } from "../../contexts/nodeid";

  import type {
    SnapGrid,
    Node,
    Position,
    NodeChange,
    EdgeChange,
  } from "../../types";
  import { setContext } from "svelte";

  type EventTypes = {
    "node:click": Node;
    "node:dblclick": Node;
    "node:mouseenter": Node;
    "node:mousemove": Node;
    "node:mouseleave": Node;
    "node:contextmenu": Node;
    "node:drag:start": Node;
    "node:drag": Node;
    "node:drag:end": Node;
    "nodes:change": NodeChange[];
    "edges:change": EdgeChange[];
  };

  export let id: string;
  export let type: string;

  //TODO: data is generic
  export let data: any;

  export let selected: boolean;
  export let isConnectable: boolean;

  export let xPos: number;
  export let yPos: number;

  export let isSelectable: boolean;
  export let isDraggable: boolean;
  export let selectNodesOnDrag: boolean;

  export let sourcePosition: Position;
  export let targetPosition: Position;

  export let hidden: boolean;
  export let snapToGrid: boolean;
  export let snapGrid: SnapGrid;
  export let dragging: boolean;

  export let resizeObserver: ResizeObserver;
  export let dragHandle: string;

  export let zIndex: number;
  export let isParent: boolean;

  export let noPanClassName: string;
  export let noDragClassName: string;

  const dispatch = createEventDispatcher<EventTypes>();

  let nodeElement;

  let prevSourcePosition = sourcePosition;
  let prevTargetPosition = targetPosition;
  let prevType = type;

  const hasPointerEvents = isSelectable || isDraggable;

  $: pointerEventStyle = hasPointerEvents ? "all" : "none";

  $: grid = snapToGrid ? snapGrid : ([1, 1]! as [number, number]);

  const dispatchEvent = (
    eventName: keyof Omit<EventTypes, "nodes:change" | "edges:change">
  ) => {
    const node = $store.nodeInternals.get(id);
    dispatch(eventName, { ...node });
  };

  const dispatchChanges = <
    E extends keyof Pick<EventTypes, "nodes:change" | "edges:change">
  >(
    eventName: E,
    changes: EventTypes[E]
  ) => {
    if (changes.length) dispatch(eventName, changes);
  };

  const onMouseEnterHandler = (_: MouseEvent) =>
    dispatchEvent("node:mouseenter");
  const onMouseMoveHandler = (_: MouseEvent) => dispatchEvent("node:mousemove");
  const onMouseLeaveHandler = (_: MouseEvent) =>
    dispatchEvent("node:mouseleave");
  const onContextMenuHandler = (_: MouseEvent) =>
    dispatchEvent("node:contextmenu");
  const onNodeDoubleClickHandler = (_: MouseEvent) =>
    dispatchEvent("node:dblclick");

  const onSelectNodeHandler = (_: MouseEvent) => {
    if (!isDraggable) {
      if (isSelectable) {
        store.update((state) => ({
          ...state,
          nodesSelectionActive: false,
        }));

        if (!selected) {
          dispatchChanges("nodes:change", store.addSelectedNodes([id]));
        }
      }

      dispatchEvent("node:click");
    }
  };

  const onDragStart = (
    _: CustomEvent<{ offsetX: number; offsetY: number; domRect: DOMRect }>
  ) => {
    if (selectNodesOnDrag && isSelectable) {
      store.update((state) => ({
        ...state,
        nodesSelectionActive: false,
      }));

      if (!selected) {
        dispatchChanges("nodes:change", store.addSelectedNodes([id]));
      }
    } else if (!selectNodesOnDrag && !selected && isSelectable) {
      if ($store.multiSelectionActive) {
        dispatchChanges("nodes:change", store.addSelectedNodes([id]));
      } else {
        const [nodeChanges, edgeChanges] = store.unselectNodesAndEdges();

        dispatchChanges("nodes:change", nodeChanges);
        dispatchChanges("edges:change", edgeChanges);

        store.update((state) => ({
          ...state,
          nodesSelectionActive: false,
        }));
      }
    }

    dispatchEvent("node:drag:start");
  };

  const onDrag = (
    event: CustomEvent<{ offsetX: number; offsetY: number; domRect: DOMRect }>
  ) => {
    dispatch(
      "nodes:change",
      store.updateNodePosition({
        id,
        dragging: true,
        diff: {
          x: event.detail.offsetX - xPos,
          y: event.detail.offsetY - yPos,
        },
      })
    );
    const node = $store.nodeInternals.get(id);

    dispatch("node:drag", {
      ...node,
      dragging: true,
      position: {
        x: event.detail.offsetX,
        y: event.detail.offsetY,
      },
      positionAbsolute: {
        x: event.detail.offsetX,
        y: event.detail.offsetY,
      },
    });
  };

  $: onDragStop = (
    _: CustomEvent<{ offsetX: number; offsetY: number; domRect: DOMRect }>
  ) => {
    const node = $store.nodeInternals.get(id);

    if (!dragging) {
      if (isSelectable && !selectNodesOnDrag && !selected) {
        dispatchChanges("nodes:change", store.addSelectedNodes([id]));
      }

      dispatchEvent("node:click");

      return;
    }

    dispatch('nodes:change', store.updateNodePosition({
      id,
      dragging: false,
    }));

    if (node) {
      dispatch("node:drag:end", {
        ...node,
        dragging: false,
      });
    }
  };

  //TODO: Convert this to an action with teardown
  $: if (nodeElement && !hidden) {
    resizeObserver?.observe(nodeElement);
  }

  $: {
    const typeChanged = prevType !== type;
    const sourcePosChanged = prevSourcePosition !== sourcePosition;
    const targetPosChanged = prevTargetPosition !== targetPosition;

    if (nodeElement && (typeChanged || sourcePosChanged || targetPosChanged)) {
      if (typeChanged) {
        prevType = type;
      }

      if (sourcePosChanged) {
        prevSourcePosition = sourcePosition;
      }

      if (targetPosChanged) {
        prevTargetPosition = targetPosition;
      }

      dispatchChanges(
        "nodes:change",
        store.updateNodeDimensions([
          {
            id,
            nodeElement,
            forceUpdate: true,
          },
        ])
      );
    }
  }

  setContext(NodeIdKey, id);
</script>

{#if !hidden}
  <div
    use:draggable={{
      disabled: !isDraggable,
      handle: dragHandle,
      cancel: `.${noDragClassName}`,
      grid: grid,
      position: {
        x: xPos,
        y: yPos,
      },
    }}
    on:neodrag:start={onDragStart}
    on:neodrag={onDrag}
    on:neodrag:end={onDragStop}
    class="svelte-flow__node svelte-flow__node-{type} {noPanClassName} {$$props.class ||
      ''}"
    class:selected
    class:selectable={isSelectable}
    class:parent={isParent}
    style:pointer-events={pointerEventStyle}
    bind:this={nodeElement}
    on:mouseenter={onMouseEnterHandler}
    on:mousemove={onMouseMoveHandler}
    on:mouseleave={onMouseLeaveHandler}
    on:contextmenu={onContextMenuHandler}
    on:click={onSelectNodeHandler}
    on:dblclick={onNodeDoubleClickHandler}
    data-id={id}
  >
    <slot
      name="node"
      {id}
      {data}
      {xPos}
      {yPos}
      {selected}
      {isConnectable}
      {sourcePosition}
      {targetPosition}
      {dragging}
      {dragHandle}
      {zIndex}
    />
  </div>
{/if}
