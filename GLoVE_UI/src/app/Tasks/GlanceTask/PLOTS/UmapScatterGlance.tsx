

// import React from 'react'
// import { VegaLite, VisualizationSpec } from 'react-vega';
// import ResponsiveVegaLite from '../../../../shared/components/responsive-vegalite';


// interface ScatterPlotProps {
//   data: any; // The data you want to plot
//   actions: any | null;
//   name: string;
//   color: string;
//   otherdata: any
// }


// const UmapScatterGlance: React.FC<ScatterPlotProps> = ({ data, color, actions, name,otherdata }) => {

//   const reshapedData = Object.keys(data[Object.keys(data)[0]]).map((key, index) => {
//     const reshapedObject = Object.keys(data).reduce((acc, curr) => {
//       acc[curr] = data[curr][index];
//       return acc;
//     }, {} as { [key: string]: any });


//     // Add the Chosen_Action key only if actions exist, otherwise use a default or null value
//     reshapedObject['Chosen_Action'] = actions ? actions[index] || "-" : "-";

//     return reshapedObject;
//   });

//   const reshapedOtherData = Object.keys(otherdata[Object.keys(otherdata)[0]]).map((key, index) => {
//     const reshapedObject = Object.keys(otherdata).reduce((acc, curr) => {
//       acc[curr] = otherdata[curr][index];
//       return acc;
//     }, {} as { [key: string]: any });


//     // Add the Chosen_Action key only if actions exist, otherwise use a default or null value
//     reshapedObject['Chosen_Action'] = actions ? actions[index] || "-" : "-";

//     return reshapedObject;
//   });

//   const sharedLegendSpec = () => ({
//     description: 'Two scatter plots with a shared legend',
//     hconcat: [
// {

 

//     mark: 'point',
//     width:300,
//     height:300,
//     selection: {
//       // Interval selection for zoom and pan
//       grid: {
//         type: 'interval',
//         bind: 'scales', // Enable zoom/pan
//       },
//       // Point selection for legend interaction
//       industry: {
//         type: 'point',
//         fields: ['Chosen_Action'], // Field for legend interaction
//         bind: 'legend',           // Bind selection to the legend
//       },
//     },
//     encoding: {
//       x: { field: "0", type: "quantitative", title: "Component 0" },
//       y: { field: "1", type: "quantitative", title: "Component 1" },
//       color: {
//         field: "Chosen_Action",
//         type: "nominal",
//         title: "Chosen Action",
//       },
//       tooltip: [
//         { field: "0", type: "quantitative", title: "Component 0", format: ".2f" },
//         { field: "1", type: "quantitative", title: "Component 1", format: ".2f" },
//         { field: "Chosen_Action", type: "nominal", title: "Chosen Action" },
//       ],
//       opacity: {
//         condition: { param: "industry", value: 1 }, // Full opacity for selected points
//         value: 0.1, // Dim non-selected points
//       },
//     },
//     data: {
//       values: reshapedData, // Provide reshaped data
//     },
//   } ,
//   {

 

//     mark: 'point',
//     width:300,
//     height:300,
//     selection: {
//       // Interval selection for zoom and pan
//       grid: {
//         type: 'interval',
//         bind: 'scales', // Enable zoom/pan
//       },
//       // Point selection for legend interaction
//       industry: {
//         type: 'point',
//         fields: ['Chosen_Action'], // Field for legend interaction
//         bind: 'legend',           // Bind selection to the legend
//       },
//     },
//     encoding: {
//       x: { field: "0", type: "quantitative", title: "Component 0" },
//       y: { field: "1", type: "quantitative", title: "Component 1" },
//       color: {
//         field: "Chosen_Action",
//         type: "nominal",
//         title: "Chosen Action",
//       },
//       tooltip: [
//         { field: "0", type: "quantitative", title: "Component 0", format: ".2f" },
//         { field: "1", type: "quantitative", title: "Component 1", format: ".2f" },
//         { field: "Chosen_Action", type: "nominal", title: "Chosen Action" },
//       ],
//       opacity: {
//         condition: { param: "industry", value: 1 }, // Full opacity for selected points
//         value: 0.1, // Dim non-selected points
//       },
//     },
//     data: {
//       values: reshapedOtherData, // Provide reshaped data
//     },
//   }
// ]
// }) as VisualizationSpec;

//   return (

//     <>
//       <VegaLite
//         spec={sharedLegendSpec()}
//         actions={false}
        
//       />
//     </>


//   );
// };

// export default UmapScatterGlance;



import React from 'react';
import { VegaLite, VisualizationSpec } from 'react-vega';

interface ScatterPlotProps {
  data: Record<string, any>;
  actions: string[] | null;
  name: string;
  color: string;
  otherdata: Record<string, any>;
}

// Utility to reshape data into a plot-friendly format
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
const generateScatterPlotSpec = (data: any[]): VisualizationSpec => ({
  mark: 'point',
  width: 300,
  height: 300,
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

const UmapScatterGlance: React.FC<ScatterPlotProps> = ({ data, actions, otherdata }) => {
  const reshapedData = reshapeData(data, actions);
  const reshapedOtherData = reshapeData(otherdata, actions);

  const spec: VisualizationSpec = {
    description: 'Two scatter plots with a shared legend',
    hconcat: [reshapedData, reshapedOtherData].map(generateScatterPlotSpec),
  };
  

  return <VegaLite spec={spec} actions={false} />;
};

export default UmapScatterGlance;
