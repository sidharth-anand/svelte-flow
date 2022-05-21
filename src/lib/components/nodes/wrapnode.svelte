<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { draggable } from "@sidharth-anand/neodrag-svelte";

  import { store } from "../../store";

  import { NodeIdKey } from "../../contexts/nodeid";

  import type { SnapGrid, Node, Position } from "../../types";
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
  };

  export let id: string;
  export let type: string;

  //TODO: data is generic
  export let data: any;

  export let selected: boolean = false;
  export let isConnectable: boolean = true;

  export let xPos: number;
  export let yPos: number;

  export let isSelectable: boolean = true;
  export let isDraggable: boolean = true;
  export let selectNodesOnDrag: boolean = false;

  export let sourcePosition: Position;
  export let targetPosition: Position;

  export let hidden: boolean = false;
  export let snapToGrid: boolean = false;
  export let snapGrid: SnapGrid | null = null;
  export let dragging: boolean = false;

  export let resizeObserver: ResizeObserver | null = null;
  export let dragHandle: string | null = null;

  export let zIndex: number;
  export let isParent: boolean;

  export let noPanClassName: string = "";
  export let noDragClassName: string = "";

  const dispatch = createEventDispatcher<EventTypes>();

  let nodeElement;

  let prevSourcePosition = sourcePosition;
  let prevTargetPosition = targetPosition;
  let prevType = type;

  const hasPointerEvents = isSelectable || isDraggable;

  $: pointerEventStyle = hasPointerEvents ? "all" : "none"; 

  $: grid = snapToGrid ? snapGrid : [1, 1]! as [number, number];

  const dispatchEvent = (eventName: keyof EventTypes) => {
    const node = $store.nodeInternals.get(id);
    dispatch(eventName, { ...node });
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
          store.addSelectedNodes([id]);
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
        store.addSelectedNodes([id]);
      }
    } else if (!selectNodesOnDrag && !selected && isSelectable) {
      if ($store.multiSelectionActive) {
        store.addSelectedNodes([id]);
      } else {
        store.unselectNodesAndEdges();
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
    console.log("asdasdasd", xPos, yPos, event.detail, event);

    store.updateNodePosition({
      id,
      dragging: true,
      diff: {
        x: event.detail.offsetX - xPos,
        y: event.detail.offsetY - yPos,
      },
    });

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
        store.addSelectedNodes([id]);
      }

      dispatchEvent("node:click");

      return;
    }

    store.updateNodePosition({
      id,
      dragging: false,
    });

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

      store.updateNodeDimensions([
        {
          id,
          nodeElement,
          forceUpdate: true,
        },
      ]);
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
        y: yPos
      },
    }}
    on:neodrag:start={onDragStart}
    on:neodrag={onDrag}
    on:neodrag:end={onDragStop}
    class="svelte-flow__node svelte-flow__node-{type} {noPanClassName} {$$props.class || ""}"
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
