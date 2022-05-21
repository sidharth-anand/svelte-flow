<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { store } from "../../store";

  import EdgeAnchor from "./edgeanchor.svelte";

  import {
    Edge,
    Connection,
    EdgeMarkerType,
    Position,
    HandleType,
  } from "../../types";
  import { onMouseDown } from "../handle/handler";
  import { getMarkerId } from "../../utils/graph";

  type T = $$Generic;

  type EventTypes = {
    "edge:click": Edge;
    "edge:dblclick": Edge;
    "edge:contextmenu": Edge;
    "edge:mouseenter": Edge;
    "edge:mousemove": Edge;
    "edge:mouseleave": Edge;
    "edge:update:start": {
      edge: Edge;
      handleType: HandleType;
    };
    "edge:update": {
      oldEdge: Edge<T>;
      newConnection: Connection;
    };
    "edge:update:end": {
      edge: Edge;
      handleType: HandleType;
    };
  };

  export let id: string;
  export let type: string;

  export let data: T | null = null;

  export let selected: boolean = false;
  export let animated: boolean = false;

  export let source: string;
  export let target: string;

  export let sourceHandleId: string | null = null;
  export let targetHandleId: string | null = null;

  export let sourceX: number;
  export let sourceY: number;
  export let targetX: number;
  export let targetY: number;

  export let sourcePosition: Position = Position.Bottom;
  export let targetPosition: Position = Position.Top;

  export let elementsSelectable: boolean = true;
  export let clickable: boolean = true;

  export let edgeUpdaterRadius: number | null = null;

  export let markerStart: EdgeMarkerType | null = null;
  export let markerEnd: EdgeMarkerType | null = null;

  const dispatch = createEventDispatcher<EventTypes>();

  $: updating = false;

  const inactive = !elementsSelectable && !clickable;

  let edgeElement: Edge;

  $: {
    edgeElement = {
      id,
      source,
      target,
      type,
    };

    if (sourceHandleId) {
      edgeElement.sourceHandle = sourceHandleId;
    }

    if (targetHandleId) {
      edgeElement.targetHandle = targetHandleId;
    }

    if (data) {
      edgeElement.data = data;
    }
  }

  const onEdgeClick = (_: MouseEvent): void => {
    if (elementsSelectable) {
      store.update((state) => ({
        ...state,
        nodeSelectionActive: false,
      }));
      store.addSelectedEdges([edgeElement.id]);
    }

    dispatch("edge:click", edgeElement);
  };

  const onEdgeDoubleClickHandler = (_: MouseEvent): void => {
    dispatch("edge:dblclick", edgeElement);
  };

  const onEdgeContextMenu = (_: MouseEvent): void => {
    dispatch("edge:contextmenu", edgeElement);
  };

  const onEdgeMouseEnter = (_: MouseEvent): void => {
    dispatch("edge:mouseenter", edgeElement);
  };

  const onEdgeMouseMove = (_: MouseEvent): void => {
    dispatch("edge:mousemove", edgeElement);
  };

  const onEdgeMouseLeave = (_: MouseEvent): void => {
    dispatch("edge:mouseleave", edgeElement);
  };

  $: handleEdgeUpdater = (event: MouseEvent, isSourceHandle: boolean): void => {
    const nodeId = isSourceHandle ? target : source;
    const handleId = isSourceHandle ? targetHandleId : sourceHandleId;
    const handleType = isSourceHandle ? "target" : "source";
    const isValidConnection = () => true;
    const isTarget = isSourceHandle;

    dispatch("edge:update:start", {
      edge: edgeElement,
      handleType,
    });

    const onEdgeUpdateEnd = (_: MouseEvent): void =>
      dispatch("edge:update:end", {
        edge: edgeElement,
        handleType,
      });

    const onConnectEdge = (connection: Connection) => {
      const edge = $store.edges.find((e) => e.id === id);

      if (edge) {
        dispatch("edge:update", {
          oldEdge: edge,
          newConnection: connection,
        });
      }
    };

    onMouseDown(
      event,
      handleId,
      nodeId,
      onConnectEdge,
      isTarget,
      isValidConnection,
      $store.connectionMode,
      handleType,
      onEdgeUpdateEnd
    );
  };

  const onEdgeUpdaterSourceMouseDown = (event: MouseEvent): void => {
    handleEdgeUpdater(event, true);
  };

  const onEdgeUpdaterTargetMouseDown = (event: MouseEvent): void => {
    handleEdgeUpdater(event, false);
  };

  const onEdgeUpdaterMouseEnter = () => {
    updating = true;
  };

  const onEdgeUpdaterMouseOut = () => {
    updating = false;
  };

  $: markerStartUrl = `url(#${getMarkerId(markerStart)})`;
  $: markerEndUrl = `url(#${getMarkerId(markerEnd)})`;
</script>

<g
  class="svelte-flow__edge svelte-flow__edge-{type} {$$props.class}"
  class:selected
  class:animated
  class:inactive
  class:updating
  on:click={onEdgeClick}
  on:dblclick={onEdgeDoubleClickHandler}
  on:contextmenu={onEdgeContextMenu}
  on:mouseenter={onEdgeMouseEnter}
  on:mousemove={onEdgeMouseMove}
  on:mouseleave={onEdgeMouseLeave}
>
  <slot
    name="edge"
    {id}
    {sourceX}
    {sourceY}
    {targetX}
    {targetY}
    {data}
    {sourcePosition}
    {targetPosition}
    {sourceHandleId}
    {targetHandleId}
    {selected}
    {animated}
    markerStart={markerStartUrl}
    markerEnd={markerEndUrl}
  />
  <g
    on:mousedown={onEdgeUpdaterSourceMouseDown}
    on:mouseenter={onEdgeUpdaterMouseEnter}
    on:mouseout={onEdgeUpdaterMouseOut}
    on:blur={null}
  >
    <EdgeAnchor
      position={sourcePosition}
      centerX={sourceX}
      centerY={sourceY}
      radius={edgeUpdaterRadius}
    />
  </g>
  <g
    on:mousedown={onEdgeUpdaterTargetMouseDown}
    on:mouseenter={onEdgeUpdaterMouseEnter}
    on:mouseout={onEdgeUpdaterMouseOut}
    on:blur={null}
  >
    <EdgeAnchor
      position={targetPosition}
      centerX={targetX}
      centerY={targetY}
      radius={edgeUpdaterRadius}
    />
  </g>
</g>
