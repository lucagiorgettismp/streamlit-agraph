import React, { useEffect, useRef } from 'react';
import VisGraph, { GraphData, GraphEvents, Options } from 'react-vis-graph-wrapper';
import { Streamlit } from "streamlit-component-lib";
import { useRenderData } from "streamlit-component-lib-react-hooks";

function StreamlitVisGraph() {
  const renderData = useRenderData();

  const graphIn = JSON.parse(renderData.args["data"])

  const options: Options = JSON.parse(renderData.args["config"])

  const fit = renderData.args["fit"] === true;

  const networkRef = useRef<any>(null);

  const lookupNodeId = (lookupNode, myNodes) => myNodes.find(node => node.id === lookupNode);

  const graph: GraphData = {nodes: graphIn.nodes.slice(), edges: graphIn.edges.slice()}

  const events: GraphEvents = {
    selectNode: (event) => {
      Streamlit.setComponentValue(event.nodes[0]);
    }
    ,
    doubleClick: (event) => {
      const lookupNode = lookupNodeId(event.nodes[0], graph.nodes);
      if (lookupNode && lookupNode.link) {
        const link = lookupNode.link;
        if (link) {
          window.open(link);
        }
      }
    }
  };

  useEffect(() => {
    if (fit && networkRef.current?.fit) {
      networkRef.current.fit();
    }
  }, [fit]);

  return (
    <span>
      <VisGraph
        graph={graph}
        options={options}
        events={events}
        ref = {(networkInstance: any) => {
          // console.log(network)
          networkRef.current = networkInstance?.network;
        }}
      />
    </span>
  )
}

export default StreamlitVisGraph;
