<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { store } from "../../store";
  import { svelteFlowStore } from "../../store/svelteflow";

  import PlusIcon from "./icons/plus.svelte";
  import MinusIcon from "./icons/minus.svelte";
  import FitViewIcon from "./icons/fitview.svelte";
  import LockIcon from "./icons/lock.svelte";
  import UnlockIcon from "./icons/unlock.svelte";

  import type { FitViewOptions } from "../../types";

  type EventTypes = {
    "controls:zoom:in": null;
    "controls:zoom:out": null;
    "controls:fitview": null;
    "controls:interactive:change": null;
  };

  export let showZoom: boolean = true;
  export let showFitView: boolean = true;
  export let showInteractive: boolean = true;
  export let fitViewOptions: FitViewOptions = undefined;

  const dispatch = createEventDispatcher<EventTypes>();

  const flowStore = svelteFlowStore();

  $: isInteractive =
    $store.nodesDraggable &&
    $store.nodesConnectable &&
    $store.elementsSelectable;

  const onZoomIn = () => {
    $flowStore.zoomIn?.();
    dispatch("controls:zoom:in");
  };

  const onZoomOut = () => {
    $flowStore.zoomOut?.();
    dispatch("controls:zoom:out");
  };

  const onFitView = () => {
    $flowStore.fitView?.(fitViewOptions);
    dispatch("controls:fitview");
  };

  const onInteractiveChange = () => {
    store.update((state) => ({
      ...state,
      nodesDraggable: !isInteractive,
      nodesConnectable: !isInteractive,
      elementsSelectable: !isInteractive,
    }));

    dispatch("controls:interactive:change");
  };

  $: buttonList = [
    { name: "zoom out", show: showZoom, icon: MinusIcon, onClick: onZoomOut },
    { name: "zoom in", show: showZoom, icon: PlusIcon, onClick: onZoomIn },
    {
      name: "fit view",
      show: showFitView,
      icon: FitViewIcon,
      onClick: onFitView,
    },
    {
      name: "interactive",
      show: showInteractive,
      icon: isInteractive ? LockIcon : UnlockIcon,
      onClick: onInteractiveChange,
    },
  ];
</script>

<div class="svelte-flow__controls">
  {#each buttonList as { name, show, icon, onClick }, i (i)}
    {#if show}
      <button
        class="svelte-flow__controls-button svelte-flow_controls-{name.replace(
          ' ',
          ''
        )}"
        on:click={onClick}
        title={name}
      >
        <svelte:component this={icon} />
      </button>
    {/if}
  {/each}
</div>
