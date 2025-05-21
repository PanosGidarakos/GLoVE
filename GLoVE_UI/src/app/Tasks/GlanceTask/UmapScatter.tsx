import type React from "react"
import ResponsiveCardVegaLite from "../../../shared/components/responsive-card-vegalite"
import { getExploreDatasetUmapPlotSpec } from "./Plots/chartSpecs"

interface ScatterPlotProps {
  data: any // The data you want to plot
  color: string
}

const UmapScatter: React.FC<ScatterPlotProps> = ({ data, color }) => {
  const hasLabel = Object.keys(data).includes("label")
  const processedData = { ...data }

  if (!hasLabel) {
    processedData.label = Array(
      Object.keys(data[Object.keys(data)[0]]).length,
    ).fill(0)
  }

  const reshapedData = Object.keys(
    processedData[Object.keys(processedData)[0]],
  ).map((key, index) => {
    return Object.keys(processedData).reduce(
      (acc, curr) => {
        acc[curr] = processedData[curr][index]
        return acc
      },
      {} as { [key: string]: any },
    )
  })

  // Define the Vega-Lite scatter plot specification
  const exploreDatasetUmapPlotSpec = getExploreDatasetUmapPlotSpec( reshapedData)
  

  return (
    <ResponsiveCardVegaLite
      spec={exploreDatasetUmapPlotSpec}
      actions={false}
      minWidth={100}
      minHeight={100}
      maxHeight={400}
      maxWidth={1500}
      aspectRatio={2 / 1}
      isStatic={false}
      title={"Umap"}
      details={"Todo"}
    />
  )
}

export default UmapScatter
