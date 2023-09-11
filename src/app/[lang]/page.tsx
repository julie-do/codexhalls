import { HeroSection } from "@/components/HeroSection/HeroSection";
import { getDictionary } from "@/utils/get-dictionary";
import { LParam } from "./layout";
import { genRandomTree } from "@/utils/utils";
import { GEdge, GNode, GraphData } from "@/store/GraphStore";
import forceLayout from "ngraph.forcelayout";
import createGraph from "ngraph.graph";
import largeGraphData from "@/utils/large-graph-data.json";

const physicsSettings = {
  // timeStep: 0.5,
  dimensions: 3,
  // gravity: -12,
  // theta: 0.8,
  // springLength: 10,
  // springCoefficient: 0.8,
  // dragCoefficient: 0.9,
};

const fetchGraphDataWithSimulation = async (): Promise<GraphData> => {
  // large data to test for performance:
  const graphData: GraphData = {
    nodes: largeGraphData.nodes.map((node) => ({
      ...node,
      val: 1,
      color: "#ffffff",
      position: [0, 0, 0],
    })),
    edges: largeGraphData.links.map((edge, i) => ({
      ...edge,
      id: `${i}`,
      color: "#ffffff",
    })),
  };

  // random data to test the force layout:
  // const graphData = genRandomTree(100, 1);

  // create a graph and populate it with data:
  const g = createGraph<GNode, GEdge>();
  graphData.nodes.forEach((node) => g.addNode(node.id));
  graphData.edges.forEach((edge) => g.addLink(edge.source, edge.target));

  // use force simulation to generate positions of each node:
  const layout = forceLayout(g, physicsSettings);

  // must iterate the simulation to get a good layout:
  for (let i = 0; i < 500; i++) {
    if (layout.step()) break; // break out early if simulation is stable
  }

  // store the new positions of the nodes generated by the force layout
  graphData.nodes.forEach((node) => {
    const { x, y, z = 0 } = layout.getNodePosition(node.id);
    node.position = [x, y, z];
  });

  return graphData;
};

export default async function Home({ params }: { params: LParam }) {
  const t = await getDictionary(params.lang);
  const graphData = await fetchGraphDataWithSimulation();

  return (
    <div className="isolate flex flex-col gap-28 pb-32">
      <HeroSection dictionary={t} graphData={graphData} />
    </div>
  );
}
