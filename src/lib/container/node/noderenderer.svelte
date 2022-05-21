<script lang="ts">
  import { store } from "../../store";
  import { visibleNodes } from "../../store/visiblenodes";

  import DefaultNode from "../../components/nodes/defaultnode.svelte";
  import GroupNode from "../../components/nodes/groupnode.svelte";
  import InputNode from "../../components/nodes/inputnode.svelte";
  import OutputNode from "../../components/nodes/outputnode.svelte";
  import WrapNode from "../../components/nodes/wrapnode.svelte";

  import { NodeTypes, Position } from "../../types";

  //TODO: add support for custom node types

  export let nodeTypes: NodeTypes = {};
  export let selectNodesOnDrag: boolean;
  export let onlyRenderVisibleElements: boolean;
  export let noPanClassName: string = "";
  export let noDragClassName: string = "";

  const nodes = visibleNodes(onlyRenderVisibleElements);

  const resizeObserver = new ResizeObserver(
    (entries: ResizeObserverEntry[]) => {
      const updates = entries.map((entry: ResizeObserverEntry) => ({
        id: entry.target.getAttribute("data-id") as string,
        nodeElement: entry.target as HTMLDivElement,
        forceUpdate: true,
      }));

      store.updateNodeDimensions(updates);
    }
  );

  const nodeComponents: NodeTypes = {
    input: InputNode,
    output: OutputNode,
    default: DefaultNode,
    group: GroupNode,
    ...nodeTypes
  };
</script>

<div class="svelte-flow__nodes svelte-flow__container">
  {#each $nodes as node (node.id)}
    <WrapNode
      id={node.id}
      type={node.type ?? 'default'}
      data={node.data}
      class={node.class ?? ""}
      sourcePosition={node.sourcePosition ?? Position.Bottom}
      targetPosition={node.targetPosition ?? Position.Top}
      hidden={node.hidden}
      xPos={node.positionAbsolute?.x ?? 0}
      yPos={node.positionAbsolute?.y ?? 0}
      dragging={!!node.dragging}
      snapGrid={$store.snapGrid}
      snapToGrid={$store.snapToGrid}
      {selectNodesOnDrag}
      scale={$store.transform[2]}
      selected={!!node.selected}
      isDraggable={!!(
        node.draggable ||
        ($store.nodesDraggable && typeof node.draggable === "undefined")
      )}
      isConnectable={!!(
        node.connectable ||
        ($store.nodesConnectable && typeof node.connectable === "undefined")
      )}
      isSelectable={!!(
        node.selectable ||
        ($store.elementsSelectable && typeof node.selectable === "undefined")
      )}
      {resizeObserver}
      dragHandle={node.dragHandle}
      zIndex={node.z ?? 0}
      isParent={!!node.isParent}
      {noDragClassName}
      {noPanClassName}
      on:node:click
      on:node:dblclick
      on:node:mouseenter
      on:node:mousemove
      on:node:mouseleave
      on:node:contextmenu
      on:node:drag:start
      on:node:drag
      on:node:drag:end
    >
      <svelte:fragment
        slot="node"
        let:id
        let:data
        let:xPos
        let:yPos
        let:selected
        let:isConnectable
        let:sourcePosition
        let:targetPosition
        let:dragging
        let:dragHandle
        let:zIndex
      >
        <svelte:component
          this={nodeComponents[node.type ?? "default"]}
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
      </svelte:fragment>
    </WrapNode>
  {/each}
</div>
