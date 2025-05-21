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


export const getCompareMethodsChartSpec=(allData:any): VegaLiteSpec => ({
   $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    mark: { type: "line", point: true, interpolate: "step-after" },
    selection: {
      // Interval selection for zoom and pan
     
      // Point selection for legend interaction
      industry: {
        type: 'point',
        fields: ['run'], // Field for legend interaction
        bind: 'legend',           // Bind selection to the legend
      },
    },
    encoding: {
      y: {
        field: "eff",
        type: "quantitative",
        title: "Effectiveness", // X-axis is now effectiveness
      },
      x: {
        field: "cost",
        type: "quantitative",
        title: "Cost", // Y-axis is now cost
      },
      color: {
        field: "run",
        type: "nominal",
        title: "Method",
      },
      opacity: {
        condition: { "param": "industry", "value": 1 },
        value: 0.01
      }
    },
    data: { values: allData },
  });
  


  export const getExploreDatasetUmapPlotSpec=(reshapedData:any): VegaLiteSpec => ({
   mark: "point",
    selection: {
      // Interval selection for zoom and pan
      grid: {
        type: "interval",
        bind: "scales", // Enable zoom/pan
      },
      // Point selection for legend interaction
      industry: {
        type: "point",
        fields: ["label"], // Field for legend interaction
        bind: "legend", // Bind selection to the legend
      },
    },

    encoding: {
      x: {
        field: "0",
        type: "quantitative",
        title: "Component 0",
        format: ".3f",
      },
      y: {
        field: "1",
        type: "quantitative",
        title: "Component 1",
        format: ".3f",
      }, // Use 'value' for y-axis encoding
      // color: { field: color, type: 'nominal' }, // Different color for each selected y-axis field

      color: {
        field: "label",
        type: "nominal",
        scale: {
          domain: [0, 1], // Define label values
          range: ["red", "green"], // Assign corresponding colors
        },
        legend: { title: "Label" }, // Optional: Set legend title dynamically
      },

      tooltip: [
        { field: "0", type: "nominal" },
        { field: "1", type: "nominal" },
        { field: "label", type: "nominal" },
      ],
      opacity: {
        condition: { param: "industry", value: 1 },
        value: 0.01,
      },
    },
    data: {
      values: reshapedData, // Provide reshaped data for plotting multiple y-axis fields on the same chart
    },
  });
  
