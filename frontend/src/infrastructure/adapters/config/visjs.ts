import type { Options } from 'vis-network/standalone';

export const defaultVisjsOptions: Options = {
  layout: {
    hierarchical: false,
    improvedLayout: true,
    clusterThreshold: 150,
  },
  physics: {
    forceAtlas2Based: {
      gravitationalConstant: -1000,
      centralGravity: 0.05,
      springLength: 100,
      springConstant: 0.18,
      avoidOverlap: 0.8,
    },
    maxVelocity: 146,
    solver: "forceAtlas2Based",
    timestep: 0.35,
    stabilization: { enabled: true, iterations: 150, fit: true },
  },
  interaction: {
    zoomView: true,
    dragView: true,
    hover: true,
    hoverConnectedEdges: false,
  },
  nodes: {
    physics: true,
    color: {
      background: '#008fc1',
      border: '#008fc1',
      highlight: {
        background: '#00dbff',
        border: '#fc8500',  // Borde gris más marcado
      },
      hover: {
        background: 'rgba(0, 219, 255, 0.6)', // Un poco más opaco que highlight
      },
    },
    font: {
      color: '#ffffff',  // Texto blanco para contraste
      size: 18, // Tamaño de fuente más grande
    },
    shape: 'box',
    shapeProperties: {
      borderRadius: 6, // Bordes redondeados
    }
  },
  edges: {
    smooth: {
      enabled: true,
      type: 'curvedCW',
      roundness: 0.2, // Ajusta la curvatura para evitar superposiciones
    },
    arrows: {
      to: { enabled: true, scaleFactor: 1.2 }, // Asegura que las flechas sean visibles
    },
    width: 1.5, // Ajusta el grosor del edge
  },
};
