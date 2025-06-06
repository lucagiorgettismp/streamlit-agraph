import React, { useEffect, useRef } from 'react';
import VisGraph, { GraphData, GraphEvents, Options } from 'react-vis-graph-wrapper';
import { Streamlit } from "streamlit-component-lib";
import { useRenderData } from "streamlit-component-lib-react-hooks";

function StreamlitVisGraph() {
  const renderData = useRenderData();

  const graphIn = JSON.parse(renderData.args["data"]);
  const options: Options = JSON.parse(renderData.args["config"]);

  const graph: GraphData = {
    nodes: graphIn.nodes.slice(),
    edges: graphIn.edges.slice()
  };

  const networkRef = useRef<any>(null); // riferimento alla rete

  // const prevGraphRef = useRef<{ nodes: any[], edges: any[] } | null>(null);

  // useEffect(() => {
  //   const prev = prevGraphRef.current;
  //   const isDifferent = JSON.stringify(prev) !== JSON.stringify(graphIn);

  //   if (networkRef.current && isDifferent) {
  //     networkRef.current.fit({ animation: true });
  //     prevGraphRef.current = graphIn;
  //   }
  // }, [graphIn]);

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
      const node = getNodeById(event.nodes[0]);
      // Streamlit.setComponentValue(node);
      Streamlit.setComponentValue({
        ...node,
        eventType: "click"
      });
    },
    selectEdge: (event) => {
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
    },
    doubleClick: (event) => {
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
    }
  };

  return (
    <span>
      <VisGraph
        graph={graph}
        options={options}
        events={events}
        ref={(networkInstance) => {
          if (networkInstance) {
            networkRef.current = networkInstance;
          }
        }}
      />
    </span>
  )
}

export default StreamlitVisGraph;