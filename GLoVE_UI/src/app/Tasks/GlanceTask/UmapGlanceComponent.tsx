import React, { useState } from "react"
import { Box, FormControl, Grid, InputLabel, MenuItem, Select } from "@mui/material"
import UmapScatterGlance from "./PLOTS/UmapScatterGlance"
import LastUmap from "./LastUmap"
import WorkflowCard from "../../../shared/components/workflow-card"
import { VegaLite, VisualizationSpec } from "react-vega"
import ResponsiveVegaLite from "../../../shared/components/responsive-vegalite"
import ResponsiveCardVegaLite from "../../../shared/components/responsive-card-vegalite"

interface UmapGlanceComponentProps {
  applied_aff_data: any
  aff_data: any
  actions: any
}

const reshapeData = (inputData: Record<string, any>, actions: string[] | null) =>
  Object.keys(inputData?.[Object.keys(inputData)[0]] || {}).map((_, index) => {
    return Object.keys(inputData).reduce((acc, key) => {
      acc[key] = inputData[key][index];
      return acc;
    }, {} as Record<string, any>);
  }).map((item, index) => ({
    ...item,
    Chosen_Action: actions?.[index] ?? "-",
  }));

// Scatter plot spec generator
const generateScatterPlotSpec = (data: any[],title?: string): VisualizationSpec => ({
  mark: 'point',
  title: title || "Scatter Plot", // Default title if none is provided
  width: 350,
  height: 500,
  selection: {
    grid: { type: 'interval', bind: 'scales' }, // Zoom & pan
    industry: { type: 'point', fields: ['Chosen_Action'], bind: 'legend' }, // Legend interaction
  },
  
  encoding: {
    x: { field: '0', type: 'quantitative', title: 'Component 0' },
    y: { field: '1', type: 'quantitative', title: 'Component 1' },
    color: { field: 'Chosen_Action', type: 'nominal', title: 'Chosen Action' },
    tooltip: [
      { field: '0', type: 'quantitative', title: 'Component 0', format: '.2f' },
      { field: '1', type: 'quantitative', title: 'Component 1', format: '.2f' },
      { field: 'Chosen_Action', type: 'nominal', title: 'Chosen Action' },
    ],
    opacity: {
      condition: { param: 'industry', value: 1 },
      value: 0.1, // Dim non-selected points
    },
  },
  data: { values: data },
});

const UmapGlanceComponent: React.FC<UmapGlanceComponentProps> = ({
  applied_aff_data,
  aff_data,
  actions,
}) => {

  const reshapedData = reshapeData(aff_data["affectedData"].reduced_data, applied_aff_data.reduced_data.Chosen_Action);
  const reshapedOtherData = reshapeData(applied_aff_data.reduced_data, applied_aff_data.reduced_data.Chosen_Action);
  
 

    const scatterPlotTitles = ["Action Selection", "Post-Action Selection"];

const spec: VisualizationSpec = {
  description: "Two scatter plots with a shared legend",
  hconcat: [reshapedData, reshapedOtherData].map((data, index) =>
    generateScatterPlotSpec(data, scatterPlotTitles[index])
  ),
};



  const [selectedAction, setSelectedAction] = useState<string>('Action1_Prediction');
  const formattedData = Object.keys(aff_data["affectedData"].reduced_data[0]).map((key) => ({
    x: aff_data["affectedData"].reduced_data[0][key], // First dimension (e.g., X-axis)
    y: aff_data["affectedData"].reduced_data[1][key], // Second dimension (e.g., Y-axis)
    [selectedAction]: Object.keys(actions)
    .filter(key => /^Action\d+_Prediction$/.test(key))
    .map(key => {
      const number = parseInt(key.match(/\d+/)?.[0] || "", 10)
      return { key, value: actions[key], number }
    }).find((action: any) => action.key === selectedAction)?.value[key],
  }));
  const specLast = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "A scatter plot with tooltips",

    selection: {
      // Interval selection for zoom and pan
      grid: {
        type: 'interval',
        bind: 'scales', // Enable zoom/pan
      },
      // Point selection for legend interaction
      industry: {
        type: 'point',
        fields: [selectedAction], // Field for legend interaction
        bind: 'legend',           // Bind selection to the legend
      },
    },
    data: {
      values: formattedData,
    },
    mark: "point",
    encoding: {
      x: {
        field: "x",
        type: "quantitative",
        title: "Component 0",
      },
      y: {
        field: "y",
        type: "quantitative",
        title: "Component 1",
      },
      color: {
        field: selectedAction,
        type: "nominal",
        title: "Prediction",
        scale: {
          domain: [0, 1], // Define label values
          range: ['red', 'green'], // Assign corresponding colors
        },

      },
      tooltip: [
        { field: "x", type: "quantitative", title: "Component 0" },
        { field: "y", type: "quantitative", title: "Component 1" },
        { field: selectedAction, type: "nominal", title: selectedAction },
      ],
      opacity: {
        condition: { param: "industry", value: 1 }, // Full opacity for selected points
        value: 0.1, // Dim non-selected points
      },
    },
  };
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
      setSelectedAction(event.target.value as string);
    };

    
  return (
    
    <>
    
          
            
    <ResponsiveCardVegaLite spec={spec}  
         
          actions={false} />
   
    {/* <Box display="flex" flexDirection="column" alignItems="center" gap={2}> */}
  
        <ResponsiveCardVegaLite 
        spec={specLast} 
       
          actions={false}
          controlPanel={  <Box display="flex" justifyContent="center" gap={2}>

    <FormControl fullWidth margin="normal"             style={{ minWidth: 200, marginRight: "20px" }}
    >
          <InputLabel id="select-action-label">Apply</InputLabel>
          <Select
            labelId="select-action-label"
            value={selectedAction}
            onChange={handleChange}
            label="Apply"
          >
             {Object.keys(actions)
          .filter(key => /^Action\d+_Prediction$/.test(key))
          .map(key => {
            const number = parseInt(key.match(/\d+/)?.[0] || "", 10)
            return { key, value: actions[key], number }
          }).map((action: any) => {
              // Extract the number from the key dynamically
              const displayText = action.key.replace(/^Action(\d+)_Prediction$/, 'Action$1');

              return (
                <MenuItem key={action.key} value={action.key}>
                  {displayText}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        </Box>}
          />
        {/* </Box> */}
      

     
    </>
  )
}

export default UmapGlanceComponent
