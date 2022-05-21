import { derived } from "svelte/store";

import { store } from "./index";

import type { NodeInternals, Edge } from "../types";

import { isEdgeVisible } from "../container/edge/utils";
import { isNumeric } from "../utils";

const defaultEdgeTree = [{ level: 0, isMaxLevel: true, edges: [] }];

export function groupEdgesByZLevel(edges: Edge[], nodeInternals: NodeInternals) {
  let maxLevel = -1;

  const levelLookup = edges.reduce<Record<string, Edge[]>>((tree, edge) => {
    const z = isNumeric(edge.zIndex)
      ? edge.zIndex
      : Math.max(
          nodeInternals.get(edge.source)?.z || 0,
          nodeInternals.get(edge.target)?.z || 0
        );
    if (tree[z]) {
      tree[z].push(edge);
    } else {
      tree[z] = [edge];
    }

    maxLevel = z > maxLevel ? z : maxLevel;

    return tree;
  }, {});

  const edgeTree = Object.entries(levelLookup).map(([key, edges]) => {
    const level = +key;

    return {
      edges,
      level,
      isMaxLevel: level === maxLevel,
    };
  });

  if (edgeTree.length === 0) {
    return defaultEdgeTree;
  }

  return edgeTree;
}

export const visibleEdges = (
  onlyRenderVisible: boolean,
  nodeInternals: NodeInternals
) => {
  const edges = derived(store, ($store) => {
    if (!onlyRenderVisible) {
      return $store.edges;
    }

    return $store.edges.filter((edge) => {
      const sourceNode = nodeInternals.get(edge.source);
      const targetNode = nodeInternals.get(edge.target);

      return (
        sourceNode?.width &&
        sourceNode?.height &&
        targetNode?.width &&
        targetNode?.height &&
        isEdgeVisible({
          sourcePos: sourceNode.position || { x: 0, y: 0 },
          targetPos: targetNode.position || { x: 0, y: 0 },
          sourceWidth: sourceNode.width,
          sourceHeight: sourceNode.height,
          targetWidth: targetNode.width,
          targetHeight: targetNode.height,
          width: $store.width,
          height: $store.height,
          transform: $store.transform,
        })
      );
    });
  });

  return edges;
};
