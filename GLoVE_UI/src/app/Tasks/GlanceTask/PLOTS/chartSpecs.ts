// chartSpecs.ts

interface VegaLiteSpec {
  [key: string]: any; // You can replace this with the actual VegaLiteSpec type if available
}

export const getCostEffectivenessChartSpec = (scatterPlotData: any[], executionMode: string): VegaLiteSpec => ({
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  data: { values: scatterPlotData },
  transform: [
    {
      calculate: "datum.TotalEffectiveness * 100",
      as: "ScaledEffectiveness",
    },
  ],
  mark: "point",
  encoding: {
    x: { field: "TotalCost", type: "quantitative", title: "Total Cost" },
    y: {
      field: "ScaledEffectiveness",
      type: "quantitative",
      title: "Total Effectiveness (%)",
    },
    color: { field: "DisplayKey", type: "nominal", title: executionMode },
    tooltip: [
      { field: "TotalCost", type: "quantitative", title: "Total Cost" },
      {
        field: "ScaledEffectiveness",
        type: "quantitative",
        title: "Total Effectiveness (%)",
      },
      { field: "DisplayKey", type: "nominal", title: executionMode },
    ],
  },
});

export const getCostChartSpec = (scatterPlotData: any[], executionMode: string): VegaLiteSpec => ({
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  data: { values: scatterPlotData },
  transform: [
    {
      calculate: "datum.TotalEffectiveness * 100",
      as: "ScaledEffectiveness",
    },
  ],
  mark: "bar",
  encoding: {
    y: { field: "TotalCost", type: "quantitative", title: "Total Cost" },
    x: { field: "DisplayKey", type: "nominal", title: executionMode },
    tooltip: [
      { field: "TotalCost", type: "quantitative", title: "Total Cost" },
      {
        field: "ScaledEffectiveness",
        type: "quantitative",
        title: "Total Effectiveness (%)",
      },
      { field: "DisplayKey", type: "nominal", title: executionMode },
    ],
  },
});

export const getEffectivenessChartSpec = (scatterPlotData: any[], executionMode: string): VegaLiteSpec => ({
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  data: { values: scatterPlotData },
  transform: [
    {
      calculate: "datum.TotalEffectiveness * 100",
      as: "ScaledEffectiveness",
    },
  ],
  mark: "bar",
  encoding: {
    y: {
      field: "ScaledEffectiveness",
      type: "quantitative",
      title: "Total Effectiveness (%)",
    },
    x: { field: "DisplayKey", type: "nominal", title: executionMode },
    tooltip: [
      { field: "TotalCost", type: "quantitative", title: "Total Cost" },
      {
        field: "ScaledEffectiveness",
        type: "quantitative",
        title: "Total Effectiveness (%)",
      },
      { field: "DisplayKey", type: "nominal", title: executionMode },
    ],
  },
});
