import { getHostForElement } from "../../utils";
import type {
  OnConnect,
  OnConnectStart,
  OnConnectStop,
  OnConnectEnd,
  Connection,
  HandleType,
} from "../../types";
import { ConnectionMode } from "../../types";
import { store } from "../../store";

type ValidConnectionFunction = (connection: Connection) => boolean;

type Result = {
  elementBelow: Element | null;
  isValid: boolean;
  connection: Connection;
  isHoveringHandle: boolean;
};

export function checkElementBelowIsValid(
  event: MouseEvent,
  connectionMode: ConnectionMode,
  isTarget: boolean,
  nodeId: string,
  handleId: string | null,
  isValidConnection: ValidConnectionFunction,
  doc: Document | ShadowRoot
) {
  const elementBelow = doc.elementFromPoint(event.clientX, event.clientY);
  const elementBelowIsTarget =
    elementBelow?.classList.contains("target") || false;
  const elementBelowIsSource =
    elementBelow?.classList.contains("source") || false;

  const result: Result = {
    elementBelow,
    isValid: false,
    connection: {
      source: null,
      target: null,
      sourceHandle: null,
      targetHandle: null,
    },
    isHoveringHandle: false,
  };

  if (elementBelow && (elementBelowIsTarget || elementBelowIsSource)) {
    result.isHoveringHandle = true;

    // in strict mode we don't allow target to target or source to source connections
    const isValid =
      connectionMode === ConnectionMode.Strict
        ? (isTarget && elementBelowIsSource) ||
          (!isTarget && elementBelowIsTarget)
        : true;

    if (isValid) {
      const elementBelowNodeId = elementBelow.getAttribute("data-nodeid");
      const elementBelowHandleId = elementBelow.getAttribute("data-handleid");
      const connection: Connection = isTarget
        ? {
            source: elementBelowNodeId,
            sourceHandle: elementBelowHandleId,
            target: nodeId,
            targetHandle: handleId,
          }
        : {
            source: nodeId,
            sourceHandle: handleId,
            target: elementBelowNodeId,
            targetHandle: elementBelowHandleId,
          };

      result.connection = connection;
      result.isValid = isValidConnection(connection);
    }
  }

  return result;
}

function resetRecentHandle(hoveredHandle: Element): void {
  hoveredHandle?.classList.remove("react-flow__handle-valid");
  hoveredHandle?.classList.remove("react-flow__handle-connecting");
}

export function onMouseDown(
  event: MouseEvent,
  handleId: string | null,
  nodeId: string,
  onConnect: OnConnect,
  isTarget: boolean,
  isValidConnection: ValidConnectionFunction,
  connectionMode: ConnectionMode,
  elementEdgeUpdaterType?: HandleType,
  onEdgeUpdateEnd?: (evt: MouseEvent) => void,
  onConnectStart?: OnConnectStart,
  onConnectStop?: OnConnectStop,
  onConnectEnd?: OnConnectEnd
): void {
  const flowNode = (event.target as Element).closest(".svelte-flow");
  const doc = getHostForElement(event.target as HTMLElement);

  if (!doc) {
    return;
  }

  const elementBelow = doc.elementFromPoint(event.clientX, event.clientY);
  const elementBelowIsTarget = elementBelow?.classList.contains("target");
  const elementBelowIsSource = elementBelow?.classList.contains("source");

  if (
    !flowNode ||
    (!elementBelowIsTarget && !elementBelowIsSource && !elementEdgeUpdaterType)
  ) {
    return;
  }

  const handleType = elementEdgeUpdaterType
    ? elementEdgeUpdaterType
    : elementBelowIsTarget
    ? "target"
    : "source";
  const containerBounds = flowNode.getBoundingClientRect();
  let recentHoveredHandle: Element;

  store.update((state) => ({
    ...state,
    connectionPosition: {
      x: event.clientX - containerBounds.left,
      y: event.clientY - containerBounds.top,
    },
    connectionNodeId: nodeId,
    connectionHandleId: handleId,
    connectionHandleType: handleType,
  }));

  onConnectStart?.(event, { nodeId, handleId, handleType });

  function onMouseMove(event: MouseEvent) {
    store.update((state) => ({
      ...state,
      connectionPosition: {
        x: event.clientX - containerBounds.left,
        y: event.clientY - containerBounds.top,
      },
    }));

    const { connection, elementBelow, isValid, isHoveringHandle } =
      checkElementBelowIsValid(
        event,
        connectionMode,
        isTarget,
        nodeId,
        handleId,
        isValidConnection,
        doc
      );

    if (!isHoveringHandle) {
      return resetRecentHandle(recentHoveredHandle);
    }

    const isOwnHandle = connection.source === connection.target;

    if (!isOwnHandle && elementBelow) {
      recentHoveredHandle = elementBelow;
      elementBelow.classList.add("react-flow__handle-connecting");
      elementBelow.classList.toggle("react-flow__handle-valid", isValid);
    }
  }

  function onMouseUp(event: MouseEvent) {
    const { connection, isValid } = checkElementBelowIsValid(
      event,
      connectionMode,
      isTarget,
      nodeId,
      handleId,
      isValidConnection,
      doc
    );

    onConnectStop?.(event);

    if (isValid) {
      onConnect?.(connection);
    }

    onConnectEnd?.(event);

    if (elementEdgeUpdaterType && onEdgeUpdateEnd) {
      onEdgeUpdateEnd(event);
    }

    resetRecentHandle(recentHoveredHandle);

    store.update((state) => ({
      ...state,
      connectionNodeId: null,
      connectionHandleId: null,
      connectionHandleType: null,
    }));

    doc.removeEventListener(
      "mousemove",
      onMouseMove as EventListenerOrEventListenerObject
    );
    doc.removeEventListener(
      "mouseup",
      onMouseUp as EventListenerOrEventListenerObject
    );
  }

  doc.addEventListener(
    "mousemove",
    onMouseMove as EventListenerOrEventListenerObject
  );
  doc.addEventListener(
    "mouseup",
    onMouseUp as EventListenerOrEventListenerObject
  );
}
