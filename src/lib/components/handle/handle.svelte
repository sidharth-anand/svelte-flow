<script lang="ts">
  import { getContext } from "svelte";

  import { store } from "../../store";

  import { NodeIdKey } from "../../contexts/nodeid";
  import type { Connection, Position, HandleType } from "../../types";
  import { checkElementBelowIsValid, onMouseDown } from "./handler";
  import { getHostForElement } from "../../utils";
  import { addEdge } from "../../utils/graph";

  const alwaysValid = () => true;

  export let id: string = null;
  export let type: HandleType;
  export let position: Position;
  export let isConnectable: boolean;
  export let isValidConnection: (connection: Connection) => boolean =
    alwaysValid;

  const nodeId: string = getContext(NodeIdKey) as string;
  const handleId = id || null;
  const isTarget = type === "target";

  const onConnectExtended = (params: Connection) => {
    const defaultEdgeOptions = $store.defaultEdgeOptions;

    const edgeParams = {
      ...defaultEdgeOptions,
      ...params,
    };

    const edges = $store.edges;
    store.update((state) => ({
      ...state,
      edges: addEdge(edgeParams, edges),
    }));

    $store.onConnect?.(edgeParams);
  };

  const onMouseDownHandler = (event: MouseEvent) => {
    if (event.button === 0) {
      onMouseDown(
        event,
        handleId,
        nodeId,
        onConnectExtended,
        isTarget,
        isValidConnection,
        $store.connectionMode,
        undefined,
        undefined,
        $store.onConneectStart,
        $store.onConnectStop,
        $store.onConnectEnd
      );
    }
  };

  const onClick = (event: MouseEvent) => {
    if (!$store.connectionStartHandle) {
      $store.onConneectStart?.(event, {
        nodeId,
        handleId,
        handleType: type,
      });
      store.update((state) => ({
        ...state,
        connectionStartHandle: {
          nodeId,
          type: type,
          handleId,
        },
      }));
    } else {
      const doc = getHostForElement(event.target as HTMLElement);
      const { connection, isValid } = checkElementBelowIsValid(
        event,
        $store.connectionMode,
        $store.connectionStartHandle.type === "target",
        $store.connectionStartHandle.nodeId,
        $store.connectionStartHandle.handleId || null,
        isValidConnection,
        doc
      );

      $store.onConnectStop?.(event);

      if (isValid) {
        onConnectExtended(connection);
      }

      $store.onConnectEnd?.(event);

      store.update((state) => ({
        ...state,
        connectionStartHandle: null,
      }));
    }
  };
</script>

<div
  data-handleid={handleId}
  data-nodeid={nodeId}
  data-handlepos={position}
  class="svelte-flow__handle svelte-flow__handle-{position} nodrag {$$props.class ||
    ''}"
  class:source={!isTarget}
  class:target={isTarget}
  class:connectable={isConnectable}
  class:connecting={$store.connectionStartHandle?.nodeId === nodeId &&
    $store.connectionStartHandle?.handleId === handleId &&
    $store.connectionStartHandle.type === type}
  on:mousedown={onMouseDownHandler}
  on:click={onClick}
>
  <slot />
</div>
