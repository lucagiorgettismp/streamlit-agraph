import React, { useRef } from 'react';
import VisGraph, { GraphData, GraphEvents, Options } from 'react-vis-graph-wrapper';
import { Streamlit } from "streamlit-component-lib";
import { useRenderData } from "streamlit-component-lib-react-hooks";

function StreamlitVisGraph() {
  const renderData = useRenderData();

  const graphIn = JSON.parse(renderData.args["data"])

  const options: Options = JSON.parse(renderData.args["config"])

  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const lookupNodeId = (lookupNode, myNodes) => myNodes.find(node => node.id === lookupNode);

  const graph: GraphData = {nodes: graphIn.nodes.slice(), edges: graphIn.edges.slice()}
  const getNodeById = (nodeId) => {
    const element = graphIn.nodes.find(node => node.id === nodeId);
    return element ? {
      type: "node",
      label: element.label,
      color: element.color,
      id: element.id
    } : null;
  };

  const events: GraphEvents = {
    selectNode: (event) => {
      // Ritarda l'esecuzione del click per vedere se arriva un doubleClick
      clickTimeoutRef.current = setTimeout(() => {
        const node = getNodeById(event.nodes[0]);
        if (node) {
          Streamlit.setComponentValue({
            ...node,
            eventType: "click"
          });
        }
      }, 250); // delay ragionevole per distinguere click da doubleClick
    },
    doubleClick: (event) => {
      // Se arriva un doubleClick, cancella il click in sospeso
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }

      if (event.nodes.length > 0) {
        const node = getNodeById(event.nodes[0]);
        if (node) {
          Streamlit.setComponentValue({
            ...node,
            eventType: "doubleClick"
          });
        }
      } else if (event.edges.length > 0) {
        const edge = graphIn.edges.find(edge => edge.id === event.edges[0]);
        if (edge) {
          Streamlit.setComponentValue({
            type: "edge",
            label: edge.label,
            color: edge.color,
            from: edge.from,
            to: edge.to,
            id: edge.id,
            eventType: "doubleClick"
          });
        }
      } else {
        Streamlit.setComponentValue(null);
      }
    },
    selectEdge: (event) => {
      clickTimeoutRef.current = setTimeout(() => {
        const edge = graphIn.edges.find(edge => edge.id === event.edges[0]);
        if (edge) {
          Streamlit.setComponentValue({
            type: "edge",
            label: edge.label,
            color: edge.color,
            from: edge.from,
            to: edge.to,
            id: edge.id,
            eventType: "click"
          });
        } else {
          Streamlit.setComponentValue(null);
        }
      }, 250);
    }
  };

  return (
    <span>
      <VisGraph
        graph={graph}
        options={options}
        events={events}
        ref = {(network: any) => {
          // console.log(network)
        }}
      />
    </span>
  );
}

export default StreamlitVisGraph;
