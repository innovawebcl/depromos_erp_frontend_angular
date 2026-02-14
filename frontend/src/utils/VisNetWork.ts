
export function setupNetworkEvents(network: any) {
    network.on('stabilizationIterationsDone', () => {
        network.setOptions({ physics: false });
      })

      network.on('selectNode', function (event: any) {
        const selectedNodeId = event.nodes[0];
        adjustOpacity(network, selectedNodeId);
      });
      
      network.on('deselectNode', function () {
        adjustOpacity(network, null);
      });

      network.on('dragStart', function (event: any) {
        const selectedNodeId = event.nodes[0];
        adjustOpacity(network, selectedNodeId);
      })

      network.on('dragEnd', function (event: any) {
        adjustOpacity(network, null);
      });
}


export function getEdgeColor(line_type: string) {
  if (line_type === 'unidirectional') {
    return '#fc8500';
  } else if (line_type === 'bidirectional') {
    return '#51cc8a';
  } else if (line_type === 'segmented') {
    return '#808080';
  }
  return '#000000';
}

export function adjustOpacity(network: any, selectedNodeId: number | null) {
  const nodes = network.body.nodes;
  const edges = network.body.edges;
  if (selectedNodeId === null) {
    restoreOpacity(network);
    return;
  }

  const node = nodes[selectedNodeId];
  if (!node) {
    restoreOpacity(network);
    return;
  }
  const nodeEdges = node.edges;
  const connectedNodes = nodeEdges.map((edge: any) => {
    return edge.fromId === selectedNodeId ? edge.toId : edge.fromId;
  });
  Object.values(nodes).forEach((node: any) => {
    if (node.id !== selectedNodeId && !connectedNodes.includes(node.id)) {
        setNodeOpacity(node, 0.3);
    } else {
        setNodeOpacity(node, 1);
    }
  });

  Object.values(edges).forEach((edge: any) => {
    if (edge.fromId !== selectedNodeId && edge.toId !== selectedNodeId) {
      setEdgeOpacity(edge, 0.3);
    } else {
      setEdgeOpacity(edge, 1);
    }
  });
}

export function restoreOpacity(network: any) {
  const nodes = network.body.nodes;
  const edges = network.body.edges;
  Object.values(nodes).forEach((node: any) => {
    setNodeOpacity(node, 1);
  });
  Object.values(edges).forEach((edge: any) => {
    setEdgeOpacity(edge, 1);
  });
}

export function setNodeOpacity(node: any, opacity: number) {
    node.options.opacity = opacity;
}

export function setEdgeOpacity(edge: any, opacity: number) {
    edge.options.color.opacity = opacity;
}
