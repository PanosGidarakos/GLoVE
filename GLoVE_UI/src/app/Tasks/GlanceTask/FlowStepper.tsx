import { useEffect } from 'react'
import type {
  Node,
  Edge} from 'reactflow';
import ReactFlow, {
  Background,
  useNodesState,
  useEdgesState,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'

const initialNodesData = [
  {
    id: '1',
    type: 'input',
    label: 'Select Dataset and Model',
    x: 0,
  },
  {
    id: '2',
    label: 'Explore Dataset',
    x: 250,
  },
  {
    id: '3',
    label: 'Analyze Counterfactuals',
    x: 500,
  },
  {
    id: '4',
    type: 'output',
    label: 'Compare Models',
    x: 750,
  },
]

const createNodes = (activeStep: number): Node[] =>
  initialNodesData.map((node, index) => ({
    id: node.id,
    type: node.type || 'default',
    data: { label: node.label },
    position: { x: node.x, y: 40 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      background: index === activeStep ? '#e0f7fa' : '#fff', // light blue highlight
      border: index === activeStep ? '2px solid #00acc1' : '1px solid #ccc',
      borderRadius: '8px',
      padding: '8px',
      fontWeight: index === activeStep ? 'bold' : 'normal',
      cursor: 'pointer',
    },
  }))

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true },
]

interface FlowStepperProps {
  setSelectedTab: (index: any) => void;
  setActiveStep: (step: number) => void;
  activeStep: number;
}

const FlowStepper = ({ setSelectedTab, setActiveStep, activeStep }: FlowStepperProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    createNodes(activeStep),
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const handleNodeClick = (_: any, node: Node) => {
    const stepIndex = parseInt(node.id, 10) - 1
    setSelectedTab(stepIndex)
    setActiveStep(stepIndex)
  }

  // Update node styles when activeStep changes
  useEffect(() => {
    setNodes(createNodes(activeStep))
  }, [activeStep, setNodes])

  return (
    <div
      style={{
        height: '8vh',
        width: '100%',
        border: '1px solid #ddd',
        borderRadius: '8px',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        panOnDrag={false}
        zoomOnScroll={false}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        zoomOnPinch={false}
        proOptions={{ hideAttribution: true }}
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: true,
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
      >
        <Background />
        {/* <Controls /> */}
      </ReactFlow>
    </div>
  )
}

export default FlowStepper

