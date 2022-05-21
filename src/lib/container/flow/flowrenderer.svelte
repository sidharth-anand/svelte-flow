<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { store } from "../../store";
  import { keyPressed } from "../../store/keypressed";

  import {
    KeyCode,
    PanOnScrollMode,
    Node,
    NodeChange,
    EdgeChange,
  } from "../../types";

  import UserSelection from "../../components/selection/userselection.svelte";
  import NodesSelection from "../../components/selection/nodesselection.svelte";
  import ZoomPane from "../zoom/zoompane.svelte";

  import { getConnectedEdges } from "../../utils/graph";

  type EventTypes = {
    "pane:click": null;
    "pane:contextmenu": null;
    "pane:scroll": null;
  };

  export let selectionKeyCode: KeyCode | null = null;
  export let deleteKeyCode: KeyCode | null = null;
  export let multiSelectionKeyCode: KeyCode | null = null;
  export let zoomActivationKeyCode: KeyCode | null = null;

  export let zoomOnScroll: boolean = true;
  export let zoomOnPinch: boolean = true;
  export let zoomOnDoubleClick: boolean = true;

  export let panOnScroll: boolean = false;
  export let panOnDrag: boolean = true;
  export let panOnScrollSpeed: number = 0.5;
  export let panOnScrollMode: PanOnScrollMode = PanOnScrollMode.Free;

  export let defaultPosition: [number, number] = [0, 0];
  export let defaultZoom: number = 1;

  export let preventScrolling: boolean = true;

  export let noPanClassName: string;
  export let noWheelClassName: string;

  const dispatch = createEventDispatcher<EventTypes>();

  const selectionKeyPressed = keyPressed(selectionKeyCode);
  const deleteKeyPressed = keyPressed(deleteKeyCode);
  const multiSelectionKeyPressed = keyPressed(multiSelectionKeyCode);

  $: {
    const nodes = Array.from($store.nodeInternals.values());
    const nodesToRemove = nodes.reduce<Node[]>((res, node) => {
      if (
        !node.selected &&
        node.parentNode &&
        res.find((n) => n.id === node.parentNode)
      ) {
        res.push(node);
      } else if (node.selected) {
        res.push(node);
      }

      return res;
    }, []);

    const selectedEdges = $store.edges.filter((edgee) => edgee.selected);

    if ($deleteKeyPressed && (nodesToRemove || selectedEdges)) {
      const connectedEdges = getConnectedEdges(nodesToRemove, $store.edges);
      const edgesToRemove = [...selectedEdges, ...connectedEdges];
      const edgeIdsToRemove = edgesToRemove.reduce<string[]>((res, edge) => {
        if (!res.includes(edge.id)) {
          res.push(edge.id);
        }

        return res;
      }, []);

      if ($store.hasDefaultEdges || $store.hasDefaultNodes) {
        if ($store.hasDefaultEdges) {
          store.update((state) => ({
            ...state,
            edges: state.edges.filter(
              (edge) => !edgeIdsToRemove.includes(edge.id)
            ),
          }));
        }

        if ($store.hasDefaultNodes) {
          nodesToRemove.forEach((node) => $store.nodeInternals.delete(node.id));

          store.update((state) => ({
            ...state,
            nodeInternals: new Map($store.nodeInternals),
          }));
        }
      }

      if (edgeIdsToRemove.length > 0) {
        $store.onEdgesDelete?.(edgesToRemove);

        if ($store.onEdgesChange) {
          const edgeChanges: EdgeChange[] = edgeIdsToRemove.map((id) => ({
            id,
            type: "remove",
          }));

          $store.onEdgesChange(edgeChanges);
        }
      }

      if (nodesToRemove.length > 0) {
        $store.onNodesDelete?.(nodesToRemove);

        if ($store.onNodesChange) {
          const nodeChanges: NodeChange[] = nodesToRemove.map((node) => ({
            id: node.id,
            type: "remove",
          }));

          $store.onNodesChange(nodeChanges);
        }
      }

      store.update((state) => ({
        ...state,
        nodesSelectionActive: false,
      }));
    }
  }

  $: {
    if ($multiSelectionKeyPressed) {
      store.update((state) => ({
        ...state,
        multiSelectionActive: true,
      }));
    }
  }

  const onClick = (event: MouseEvent) => {
    dispatch("pane:click");

    store.resetSelectedElements();
    store.update((state) => ({
      ...state,
      nodesSelectionActive: false,
    }));
  };

  const onContextMenu = (event: MouseEvent) => {
    dispatch("pane:contextmenu");
  };

  const onWheel = (event: WheelEvent) => {
    dispatch("pane:scroll");
  };
</script>

<ZoomPane
  selectionKeyPressed={$selectionKeyPressed}
  {zoomOnScroll}
  {zoomOnPinch}
  {zoomOnDoubleClick}
  {panOnScroll}
  {panOnScrollSpeed}
  {panOnScrollMode}
  {panOnDrag}
  {defaultPosition}
  {defaultZoom}
  {zoomActivationKeyCode}
  {preventScrolling}
  {noWheelClassName}
  {noPanClassName}
  on:pane:move:start
  on:pane:move
  on:pane:move:end
>
  <slot />
  <UserSelection selectionKeyPressed={$selectionKeyPressed} />
  {#if $store.nodesSelectionActive}
    <NodesSelection
      {noPanClassName}
      on:selection:drag:start
      on:selection:drag
      on:selection:drag:end
      on:selection:contextmenu
    />
  {/if}
  <div
    class="svelte-flow__pane svelte-flow__container"
    on:click={onClick}
    on:contextmenu={onContextMenu}
    on:wheel={onWheel}
  />
</ZoomPane>
