import { writable, Subscriber, Unsubscriber, Updater } from "svelte/store";

import { clampPosition, getDimensions } from "../utils";
import { applyNodeChanges } from "../utils/changes";
import type {
  SvelteFlowStore,
  SvelteFlowActions,
  Node,
  Edge,
  NodeDimensionUpdate,
  NodeDiffUpdate,
  CoordinateExtent,
  NodeDimensionChange,
  EdgeSelectionChange,
  NodeSelectionChange,
  NodePositionChange,
} from "../types";
import { getHandleBounds } from "../components/nodes/utils";
import { createSelectionChange, getSelectionChanges } from "../utils/changes";
import {
  createNodeInternals,
  createPositionChange,
  handleControlledEdgeSelectionChange,
  handleControlledNodeSelectionChange,
  isParentSelected,
  fitView,
} from "./utils";
import initialState from "./initialState";

type Invalidator<T> = (value?: T) => void;

export type StoreType = SvelteFlowActions & {
  subscribe: (
    this: void,
    run: Subscriber<SvelteFlowStore>,
    invalidate?: Invalidator<SvelteFlowStore>
  ) => Unsubscriber;
  update: (this: void, updater: Updater<SvelteFlowStore>) => void;
};

function createStore(): StoreType {
  const { subscribe, set, update } = writable<SvelteFlowStore>(initialState);

  const actions: SvelteFlowActions = {
    setNodes: (nodes: Node[]) => {
      update((state) => ({
        ...state,
        nodeInternals: createNodeInternals(nodes, state.nodeInternals),
      }));
    },
    setEdges: (edges: Edge[]) => {
      update((state) => {
        const defaultEdgeOptions = state.defaultEdgeOptions;

        if (defaultEdgeOptions) {
          return {
            ...state,
            edges: edges.map((edge) => ({ ...defaultEdgeOptions, ...edge })),
          };
        } else {
          return {
            ...state,
            edges,
          };
        }
      });
    },
    updateNodeDimensions: (updates: NodeDimensionUpdate[]) => {
      let changes: NodeDimensionChange[];

      update((state) => {
        const {
          transform,
          nodeInternals,
          fitViewOnInit,
          fitViewOnInitDone,
          fitViewOnInitOptions,
        } = state;

        changes = updates.reduce<NodeDimensionChange[]>((res, update) => {
          const node = nodeInternals.get(update.id);

          if (node) {
            const dimensions = getDimensions(update.nodeElement);
            const doUpdate = !!(
              dimensions.width &&
              dimensions.height &&
              (node.width !== dimensions.width ||
                node.height !== dimensions.height ||
                update.forceUpdate)
            );

            if (doUpdate) {
              const handleBounds = getHandleBounds(
                update.nodeElement,
                transform[2]
              );
              nodeInternals.set(node.id, {
                ...node,
                handleBounds,
                ...dimensions,
              });

              res.push({
                id: node.id,
                type: "dimensions",
                dimensions,
              });
            }
          }

          return res;
        }, []);

        const nextFitViewOnInitDone =
          fitViewOnInitDone ||
          (fitViewOnInit &&
            !fitViewOnInitDone &&
            fitView(state, { initial: true, ...fitViewOnInitOptions }));
        return {
          ...state,
          nodeInternals: new Map(nodeInternals),
          fitViewOnInitDone: nextFitViewOnInitDone,
        };
      });

      return changes;
    },
    updateNodePosition: ({ id, diff, dragging }: NodeDiffUpdate) => {
      let changes: NodePositionChange[] = [];

      update((state) => {
        const { nodeExtent, nodeInternals } = state;

        nodeInternals.forEach((node) => {
          if (node.selected) {
            if (!node.parentNode || !isParentSelected(node, nodeInternals)) {
              changes.push(
                createPositionChange({
                  node,
                  diff,
                  dragging,
                  nodeExtent,
                  nodeInternals,
                })
              );
            }
          } else if (node.id === id) {
            changes.push(
              createPositionChange({
                node,
                diff,
                dragging,
                nodeExtent,
                nodeInternals,
              })
            );
          }
        });

        if (changes?.length) {
          const nodes = applyNodeChanges(
            changes,
            Array.from(nodeInternals.values())
          );
          const nextNodeInternals = createNodeInternals(nodes, nodeInternals);

          return {
            ...state,
            nodeInternals: nextNodeInternals,
          };
        }

        return state;
      });

      return changes;
    },
    addSelectedNodes: (selectedNodeIds: string[]) => {
      let changedNodes: NodeSelectionChange[];

      update((state) => {
        const { multiSelectionActive, nodeInternals, edges } =
          state;

        let changedEdges: EdgeSelectionChange[] | null = null;

        if (multiSelectionActive) {
          changedNodes = selectedNodeIds.map((nodeId) =>
            createSelectionChange(nodeId, true)
          ) as NodeSelectionChange[];
        } else {
          changedNodes = getSelectionChanges(
            Array.from(nodeInternals.values()),
            selectedNodeIds
          );
          changedEdges = getSelectionChanges(edges, []);
        }

        let updatedState = {
          ...state,
        };

        if (changedNodes.length) {
          updatedState = {
            ...updatedState,
            nodeInternals: handleControlledNodeSelectionChange(
              changedNodes,
              nodeInternals
            ),
          };
        }

        if (changedEdges?.length) {
          updatedState = {
            ...updatedState,
            edges: handleControlledEdgeSelectionChange(changedEdges, edges),
          };
        }

        return updatedState;
      });

      return changedNodes;
    },
    addSelectedEdges: (selectedEdgeIds: string[]) => {
      let changedNodes: NodeSelectionChange[] = [];
      let changedEdges: EdgeSelectionChange[] = [];

      update((state) => {
        const { multiSelectionActive, nodeInternals, edges } = state;

        if (multiSelectionActive) {
          changedEdges = selectedEdgeIds.map((edgeId) =>
            createSelectionChange(edgeId, true)
          ) as EdgeSelectionChange[];
        } else {
          changedEdges = getSelectionChanges(edges, selectedEdgeIds);
          changedNodes = getSelectionChanges(
            Array.from(nodeInternals.values()),
            []
          );
        }

        let updatedState = {
          ...state,
        };

        if (changedEdges?.length) {
          updatedState = {
            ...updatedState,
            edges: handleControlledEdgeSelectionChange(changedEdges, edges),
          };
        }

        if (changedNodes?.length) {
          updatedState = {
            ...updatedState,
            nodeInternals: handleControlledNodeSelectionChange(
              changedNodes,
              nodeInternals
            ),
          };
        }

        return updatedState;
      });

      return [changedNodes, changedEdges];
    },
    unselectNodesAndEdges: () => {
      let nodesToUnselect: NodeSelectionChange[] = [];
      let edgesToUnselect: EdgeSelectionChange[] = [];

      update((state) => {
        const { nodeInternals, edges } = state;
        const nodes = Array.from(nodeInternals.values());

        nodesToUnselect = nodes.map((n) => {
          n.selected = false;
          return createSelectionChange(n.id, false);
        }) as NodeSelectionChange[];
        edgesToUnselect = edges.map((edge) =>
          createSelectionChange(edge.id, false)
        ) as EdgeSelectionChange[];

        let updatedState = {
          ...state,
        };

        if (nodesToUnselect.length) {
          updatedState = {
            ...updatedState,
            nodeInternals: handleControlledNodeSelectionChange(
              nodesToUnselect,
              nodeInternals
            ),
          };
        }

        if (edgesToUnselect.length) {
          updatedState = {
            ...updatedState,
            edges: handleControlledEdgeSelectionChange(edgesToUnselect, edges),
          };
        }

        return updatedState;
      });

      return [nodesToUnselect, edgesToUnselect];
    },
    setMinZoom: (minZoom: number) => {
      update((state) => {
        const { d3Zoom, maxZoom } = state;
        d3Zoom?.scaleExtent([minZoom, maxZoom]);

        return {
          ...state,
          minZoom,
        };
      });
    },
    setMaxZoom: (maxZoom: number) => {
      update((state) => {
        const { d3Zoom, minZoom } = state;
        d3Zoom?.scaleExtent([minZoom, maxZoom]);

        return {
          ...state,
          maxZoom,
        };
      });
    },
    setTranslateExtent: (translateExtent: CoordinateExtent) => {
      update((state) => {
        const { d3Zoom } = state;
        d3Zoom?.translateExtent(translateExtent);

        return {
          ...state,
          translateExtent,
        };
      });
    },
    resetSelectedElements: () => {
      let nodesToUnselect: NodeSelectionChange[] = [];
      let edgesToUnselect: EdgeSelectionChange[] = [];

      update((state) => {
        const { nodeInternals, edges } = state;
        const nodes = Array.from(nodeInternals.values());

        nodesToUnselect = nodes
          .filter((e) => e.selected)
          .map((n) =>
            createSelectionChange(n.id, false)
          ) as NodeSelectionChange[];
        edgesToUnselect = edges
          .filter((e) => e.selected)
          .map((e) =>
            createSelectionChange(e.id, false)
          ) as EdgeSelectionChange[];

        let updatedState = {
          ...state,
        };

        if (nodesToUnselect.length) {
          updatedState = {
            ...updatedState,
            nodeInternals: handleControlledNodeSelectionChange(
              nodesToUnselect,
              nodeInternals
            ),
          };
        }

        if (edgesToUnselect.length) {
          updatedState = {
            ...updatedState,
            edges: handleControlledEdgeSelectionChange(edgesToUnselect, edges),
          };
        }

        return updatedState;
      });

      return [nodesToUnselect, edgesToUnselect];
    },
    setNodeExtent: (nodeExtent: CoordinateExtent) => {
      update((state) => {
        const { nodeInternals } = state;

        nodeInternals.forEach((node) => {
          node.positionAbsolute = clampPosition(node.position, nodeExtent);
        });

        return {
          ...state,
          nodeExtent,
          nodeInternals: new Map(nodeInternals),
        };
      });
    },
    reset: () => {
      set(initialState);
    },
  };

  return {
    ...actions,
    subscribe,
    update,
  };
}

export const store = createStore();
