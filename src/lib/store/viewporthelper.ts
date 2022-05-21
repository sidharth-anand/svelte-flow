import { derived, Readable } from "svelte/store";

import { zoomIdentity } from "d3";

import type {
  FitViewOptions,
  Viewport,
  ViewportHelperFunctions,
  Rect,
  XYPosition,
} from "../types";

import { store } from "./index";
import {
  pointToRendererPoint,
  getTransformForBounds,
  getD3Transition,
} from "../utils/graph";
import { fitView as fitViewStore } from "./utils";

const DEFAULT_PADDING = 0.1;

const initialViewportHelper: ViewportHelperFunctions = {
  zoomIn: () => {},
  zoomOut: () => {},
  zoomTo: (_: number) => {},
  getZoom: () => 1,
  setViewport: (_: Viewport) => {},
  getViewport: () => ({ x: 0, y: 0, zoom: 1 }),
  fitView: (_: FitViewOptions = { padding: DEFAULT_PADDING, includeHiddenNodes: false }) => {},
  setCenter: (_: number, __: number) => {},
  fitBounds: (_: Rect) => {},
  project: (position: XYPosition) => position,
  initialized: false,
};

export const viewportHelperStore: Readable<ViewportHelperFunctions> = derived(store, $store => {
    if ($store.d3Selection && $store.d3Zoom) {
        return {
            zoomIn: options => $store.d3Zoom.scaleBy(getD3Transition($store.d3Selection, options?.duration), 1.2),
            zoomOut: options => $store.d3Zoom.scaleBy(getD3Transition($store.d3Selection, options?.duration), 1 / 1.2),
            zoomTo: (zoomLevel, options) => $store.d3Zoom.scaleTo(getD3Transition($store.d3Selection, options?.duration), zoomLevel),
            getZoom: () => {
                const [,, zoom] = $store.transform;
                return zoom;
            },
            setViewport: (transform, options) => {
                const nextTransform = zoomIdentity.translate(transform.x, transform.y).scale(transform.zoom);
                $store.d3Zoom.transform(getD3Transition($store.d3Selection, options?.duration), nextTransform);
            },
            getViewport: () => {
                const [x, y, zoom] = $store.transform;
                return { x, y, zoom };
            },
            fitView: (options) => fitViewStore($store, options),
            setCenter: (x, y, options) => {
                const nextZoom = typeof options?.zoom !== 'undefined' ? options.zoom : $store.maxZoom;

                const centerX = $store.width / 2 - x * nextZoom;
                const centerY = $store.height / 2 - y * nextZoom;

                const transform = zoomIdentity.translate(centerX, centerY).scale(nextZoom);

                $store.d3Zoom.transform(getD3Transition($store.d3Selection, options?.duration), transform);
            },
            fitBounds: (bounds, options) => {
                const [x, y, zoom] = getTransformForBounds(bounds, $store.width, $store.height, $store.minZoom, $store.maxZoom, options?.padding ?? 0.1);
                const transform = zoomIdentity.translate(x, y).scale(zoom);

                $store.d3Zoom.transform(getD3Transition($store.d3Selection, options?.duration), transform);
            },
            project: (position: XYPosition) => {
                return pointToRendererPoint(position, $store.transform, $store.snapToGrid, $store.snapGrid);
            },
            initialized: true
        };
    }

    return initialViewportHelper;
});