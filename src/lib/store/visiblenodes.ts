import { derived } from "svelte/store";

import { store } from "./index";

import { getNodesInside } from "../utils/graph";

export const visibleNodes = (onlyRenderVisible: boolean) => {
  const nodes = derived(store, ($store) => {
    return onlyRenderVisible
      ? getNodesInside(
          $store.nodeInternals,
          { x: 0, y: 0, width: $store.width, height: $store.height },
          $store.transform,
          true
        )
      : Array.from($store.nodeInternals).map(([_, node]) => node);
  });

  return nodes;
};