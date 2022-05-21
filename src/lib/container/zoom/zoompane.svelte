<script lang="ts">
  import { onMount, createEventDispatcher, onDestroy } from "svelte";

  import { D3ZoomEvent, zoom, zoomIdentity } from "d3-zoom";
  import { select, pointer } from "d3-selection";

  import { store } from "../../store";
  import { keyPressed } from "../../store/keypressed";

  import { Viewport, PanOnScrollMode, KeyCode } from "../../types";

  import { clamp, getDimensions } from "../../utils";

  export let selectionKeyPressed: boolean;

  export let zoomOnScroll: boolean = true;
  export let zoomOnPinch: boolean = true;
  export let zoomOnDoubleClick: boolean = true;

  export let panOnScroll: boolean = false;
  export let panOnDrag: boolean = true;
  export let panOnScrollSpeed: number = 0.5;
  export let panOnScrollMode: PanOnScrollMode = PanOnScrollMode.Free;

  export let defaultPosition: [number, number] = [0, 0];
  export let defaultZoom: number = 1;

  export let zoomActivationKeyCode: KeyCode = null;
  export let preventScrolling: boolean = true;

  export let noWheelClassName: string = "";
  export let noPanClassName: string = "";

  type EventTypes = {
    "pane:move:start": Viewport;
    "pane:move": Viewport;
    "pane:move:end": Viewport;
  };

  const dispatch = createEventDispatcher<EventTypes>();

  let zoomPane: HTMLDivElement = null;

  let prevTransform: Viewport = {
    x: 0,
    y: 0,
    zoom: 0,
  };

  $: zoomActivationKeyPressed = keyPressed(zoomActivationKeyCode);

  const viewChanged = (prevViewport: Viewport, eventViewport: any): boolean => {
    return (
      prevViewport.x !== eventViewport.x ||
      prevViewport.y !== eventViewport.y ||
      prevViewport.zoom !== eventViewport.k
    );
  };

  const eventToFlowTransform = (eventViewport: any): Viewport => ({
    x: eventViewport.x,
    y: eventViewport.y,
    zoom: eventViewport.k,
  });

  const isWrapperWithClass = (event: any, className: string) =>
    event.target.closest(`.${className}`);

  const updateDimensions = () => {
    if (!zoomPane) {
      return;
    }

    const size = getDimensions(zoomPane);

    if (size.height === 0 || size.width === 0) {
      console.warn(
        "The flow parent container needs a width and a height to render the graph"
      );
    }

    store.update((state) => ({
      ...state,
      width: size.width || 500,
      height: size.height || 500,
    }));
  };

  let resizeObserver: ResizeObserver;
  let finishedPositioning: boolean = false;

  $: {
    if (zoomPane) {
      resizeObserver = new ResizeObserver(() => updateDimensions());
      resizeObserver.observe(zoomPane);
    }

    updateDimensions();
    window.onresize = updateDimensions;
  }

  onMount(() => {
    const d3ZoomInstance = zoom()
      .scaleExtent([$store.minZoom, $store.maxZoom])
      .translateExtent($store.translateExtent);
    const selection = select(zoomPane).call(d3ZoomInstance);

    const clampedX = clamp(
      defaultPosition[0],
      $store.translateExtent[0][0],
      $store.translateExtent[1][0]
    );
    const clampedY = clamp(
      defaultPosition[1],
      $store.translateExtent[0][1],
      $store.translateExtent[1][1]
    );
    const clampedZoom = clamp(defaultZoom, $store.minZoom, $store.maxZoom);

    const updatedTransform = zoomIdentity
      .translate(clampedX, clampedY)
      .scale(clampedZoom);

    d3ZoomInstance.transform(selection, updatedTransform);

    store.update((state) => ({
      ...state,
      d3Zoom: d3ZoomInstance,
      d3Selection: selection,
      d3ZoomHandler: selection.on("wheel.zoom"),
      transform: [clampedX, clampedY, clampedZoom],
    }));
  });

  onDestroy(() => {
    window.onresize = null;

    if (resizeObserver && zoomPane) {
      resizeObserver.unobserve(zoomPane);
    }
  });

  $: {
    if ($store.d3Selection && $store.d3Zoom) {
      if (panOnScroll && !zoomActivationKeyPressed) {
        $store.d3Selection
          .on("wheel", (event: any) => {
            if (isWrapperWithClass(event, noWheelClassName)) {
              return;
            }

            event.preventDefault();
            event.stopImmediatePropagation();

            const currentZoom = $store.d3Selection.property("__zoom").k || 1;

            if (event.ctrlKey && zoomOnPinch) {
              const point = pointer(event);

              const pinchDelta =
                -event.DeltaY *
                (event.deltaMode === 1 ? 0.5 : event.deltaMode ? 1 : 0.002) *
                10;
              const zoom = currentZoom * Math.pow(2, pinchDelta);

              $store.d3Zoom.scaleTo($store.d3Selection, zoom, point);

              return;
            }

            const deltaNormalize = event.deltaMode === 1 ? 20 : 1;

            const deltaX =
              panOnScrollMode === PanOnScrollMode.Vertical
                ? 0
                : event.deltaX * deltaNormalize;
            const deltaY =
              panOnScrollMode === PanOnScrollMode.Horizontal
                ? 0
                : event.deltaY * deltaNormalize;

            $store.d3Zoom.translateBy(
              $store.d3Selection,
              (-deltaX / currentZoom) * panOnScrollSpeed,
              (-deltaY / currentZoom) * panOnScrollSpeed
            );
          })
          .on("wheel.zoom", null);
      } else if (typeof $store.d3ZoomHandler !== "undefined") {
        $store.d3Selection
          .on("wheel", (event: any) => {
            if (
              !preventScrolling ||
              isWrapperWithClass(event, noWheelClassName)
            ) {
              return null;
            }

            event.preventDefault();
          })
          .on("wheel.zoom", $store.d3ZoomHandler);
      }
    }
  }

  $: {
    if ($store.d3Zoom) {
      if (selectionKeyPressed) {
        $store.d3Zoom.on("zoom", null);
      } else {
        $store.d3Zoom.on("zoom", (event: D3ZoomEvent<HTMLDivElement, any>) => {
          setTimeout(() => {
            store.update((state) => ({
              ...state,
              transform: [
                event.transform.x,
                event.transform.y,
                event.transform.k,
              ],
            }));

            dispatch("pane:move", eventToFlowTransform(event.transform));

            finishedPositioning = true;
          }, 1);
        });
      }
    }
  }

  $: {
    if ($store.d3Zoom) {
      $store.d3Zoom.on("start", (event: D3ZoomEvent<HTMLDivElement, any>) => {
        const flowTransform = eventToFlowTransform(event.transform);
        prevTransform = flowTransform;

        dispatch("pane:move:start", flowTransform);
      });

      $store.d3Zoom.on("end", (event: D3ZoomEvent<HTMLDivElement, any>) => {
        if (viewChanged(prevTransform, event.transform)) {
          const flowTransform = eventToFlowTransform(event.transform);
          prevTransform = flowTransform;

          dispatch("pane:move:end", flowTransform);
        }
      });
    }
  }

  $: {
    if ($store.d3Zoom) {
      $store.d3Zoom.filter((event: any): boolean => {
        const zoomScroll = zoomActivationKeyPressed || zoomOnScroll;
        const pinchZoom = zoomOnPinch && event.ctrlKey;

        if (
          !panOnDrag &&
          !zoomScroll &&
          !panOnScroll &&
          !zoomOnDoubleClick &&
          !zoomOnPinch
        ) {
          return false;
        }

        if (selectionKeyPressed) {
          return false;
        }

        if (!zoomOnDoubleClick && event.type === "dblclick") {
          return false;
        }

        if (
          isWrapperWithClass(event, noWheelClassName) &&
          event.type === "wheel"
        ) {
          return false;
        }

        if (
          isWrapperWithClass(event, noPanClassName) &&
          event.type !== "wheel"
        ) {
          return false;
        }

        if (!zoomOnPinch && event.ctrlKey && event.type === "wheel") {
          return false;
        }

        if (
          !zoomScroll &&
          !panOnScroll &&
          !pinchZoom &&
          event.type === "wheel"
        ) {
          return false;
        }

        if (
          !panOnDrag &&
          (event.type === "mousedown" || event.type === "touchstart")
        ) {
          return false;
        }

        return (!event.ctrlKey || event.type === "wheel") && !event.button;
      });
    }
  }
</script>

<div class="svelte-flow__renderer svelte-flow__component" bind:this={zoomPane} style:visibility={finishedPositioning ? "visible" : "hidden"}>
    <slot />
</div>
