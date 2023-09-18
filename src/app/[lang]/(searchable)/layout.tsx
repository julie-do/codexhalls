import { getDictionary } from "@/utils/get-dictionary";
import { LParam } from "../layout";
import { cn, generateRandomGraph, getRandomColorFromSet } from "@/utils/utils";
import { GEdge, GNode, GraphData } from "@/store/GraphStore";
import forceLayout from "ngraph.forcelayout";
import createGraph from "ngraph.graph";
import largeGraphData from "@/test-data/large-graph-data.json";
import stableData from "@/test-data/stable-data.json";
import { ReactNode, cache } from "react";
import { SearchBar } from "@/components/SearchBar/SearchBar";
import { Graph } from "@/components/Three/Graph/Graph";
import { ControlsTip } from "@/components/ControlsTip/ControlsTip";

export default async function SearchLayout({
  params,
  children,
}: {
  params: LParam;
  children: ReactNode;
}) {
  const t = await getDictionary(params.lang);
  const graphData = await fetchGraphDataWithSimulation();

  return (
    <div className="isolate flex flex-col gap-28">
      <section className="-z-10 fixed top-0 left-0 flex flex-col w-full">
        <Graph data={graphData} />
      </section>
      <section className={cn("flex flex-col pointer-events-none")}>
        <div className="pack-content pointer-events-auto">
          <SearchBar />
          <ControlsTip />
        </div>
        {children}
      </section>
    </div>
  );
}

const fetchGraphDataWithSimulation = async (): Promise<GraphData> => {
  // large data to test for performance:
  // const data = getLargeData();

  // random data to test the force layout:
  const data = generateRandomGraph(200, 2);

  // stable data to test the force layout:
  // const data = stableData as GraphData;

  simulateForces(data);

  return data;
};

const physicsSettings = {
  // timeStep: 0.5,
  dimensions: 3,
  // gravity: -12,
  // theta: 0.8,
  // springLength: 10,
  // springCoefficient: 0.8,
  // dragCoefficient: 0.9,
};

const simulateForces = (data: GraphData) => {
  // create a graph and populate it with data:
  const g = createGraph<GNode, GEdge>();
  data.nodes.forEach((node) => g.addNode(node.id));
  data.edges.forEach((edge) => g.addLink(edge.source, edge.target));

  // use force simulation to generate positions of each node:
  const layout = forceLayout(g, physicsSettings);

  // must iterate the simulation to get a good layout:
  for (let i = 0; i < 500; i++) {
    if (layout.step()) break; // break out early if simulation is stable
  }

  // store the new positions of the nodes generated by the force layout
  data.nodes.forEach((node) => {
    const { x, y, z = 0 } = layout.getNodePosition(node.id);
    node.position = [x, y, z];
  });
};

const getLargeData = (): GraphData => ({
  nodes: largeGraphData.nodes.map((node) => ({
    ...node,
    color: getRandomColorFromSet(),
    position: [0, 0, 0],
    scale: [2, 2, 2],
    rotation: [0, 0, 0],
  })),
  edges: largeGraphData.links.map((edge, i) => ({
    ...edge,
    id: `${i}`,
    color: getRandomColorFromSet(),
  })),
});
