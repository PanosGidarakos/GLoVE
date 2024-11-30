import React, { useState,useEffect } from 'react';
import { Vega, VegaLite, VisualizationSpec } from 'react-vega';
import { FormControl, InputLabel, Select, MenuItem, Box, Paper, Table, TableBody, TableCell, Grid,TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import WorkflowCard from '../../../../shared/components/workflow-card';
import ResponsiveVegaLite from '../../../../shared/components/responsive-vegalite';

interface ActionScatterProps {
  data1: any;
  data2: any;
  actions: any;
  eff_cost_actions: any;
}
const ActionScatter = ({ data1, data2, actions, eff_cost_actions }: ActionScatterProps) => {

  const tableRows = Object.keys(eff_cost_actions).map((key) => ({
    id: key,
    eff: (eff_cost_actions[key].eff*100).toFixed(2) ,
    cost: (eff_cost_actions[key].cost).toFixed(2),
  }));
  
  const tableColumns = [
    { field: 'id', headerName: 'Action', flex: 1  },
    { field: 'eff', headerName: 'Effectiveness %', flex: 1,},
    { field: 'cost', headerName: 'Cost', flex: 1  },
  ];
  


  // Utility function to filter out unwanted fields for dropdown options only
  const isExcludedField = (field: string) => {
    const excludedFields = ['index', 'Cluster', 'Chosen_Action'];
    const actionPredictionRegex = /^Action\d+_Prediction$/;
    return excludedFields.includes(field) || actionPredictionRegex.test(field);
  };

  const getColorOptions = (clusters: {}) => {
    if (!clusters) return [];
    return Object.keys(clusters).filter((field) => /^Action\d+_Prediction$/.test(field));
  };

  

  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [colorField, setColorField] = useState('');
  const [options, setOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);

  // Extract options from the data for dropdowns (excluding certain fields)
  const getOptions = (clusters: {}) => {
    if (!clusters) return [];
    return Object.keys(clusters).filter((field) => !isExcludedField(field));
  };

  // Update state whenever data1 or data2 changes
  useEffect(() => {
    const options1 = getOptions(data1);
    const options2 = getOptions(data2);
    const combinedOptions = options1.length > options2.length ? options1 : options2;

    setOptions(combinedOptions);
    setXAxis(combinedOptions[0] || '');
    setYAxis(combinedOptions[1] || '');
    setColorOptions(getColorOptions(data1));
    setColorField(getColorOptions(data1)[0] || '');
  }, [data1, data2]);


  // Function to transform data for Vega-Lite, keeping all fields
  const transformData = (clusters: { [x: string]: { [x: string]: any; }; }) => {
    if (!clusters) return [];
    const fields = Object.keys(clusters); // Include all fields (even excluded ones for the dropdowns)
    const sampleKeys = Object.keys(clusters[fields[0]] || {});

    return sampleKeys.map((key) => {
      const dataPoint = { id: key };
      fields.forEach((field) => {
        dataPoint[field] = clusters[field]?.[key];
      });
      return dataPoint;
    });
  };

  // Transform both data sets
  const transformedData1 = transformData(data1);
  const transformedData2 = transformData(data2);

  const determineType = (field: string, data: string | any[]) => {
    if (!data.length || data[0][field] === undefined) return 'nominal';
    return typeof data[0][field] === 'string' ? 'ordinal' : 'quantitative';
  };

  
  // Vega-Lite specifications for both plots
  const spec = (data: { id: string; }[]) => ({
    description: 'A scatter plot of affected clusters',
    mark: 'circle',
    params: [{
        name: "industry",
        select: {type: "point", fields: ["Chosen_Action"]},
        bind: "legend"
      }],
    encoding: {
      x: { field: xAxis, type: determineType(xAxis, data) },
      y: { field: yAxis, type: determineType(yAxis, data) },
      color: { field: "Chosen_Action", type: 'nominal', title: "Chosen Action"},
      tooltip:[ 
        { field: 'Chosen_Action', type: 'nominal',title:"Chosen Action" },
        {field: xAxis, type: "nominal"},
        {field: yAxis, type: "nominal"}

      ],
      opacity: {
        condition: { "param": "industry", "value": 1 },
        value: 0.01
      }
    },
    data: { values: data },
    width: 400,
    height: 400,
    config: {
      legend: {
        orient: "top", // Position the legend at the top
        direction: "horizontal", // Arrange items in a row
        padding: 10, // Space between legend items
        labelFontSize: 12, // Font size for legend labels
        symbolSize: 100, // Size of the legend symbols
        symbolType: "circle", // Make the symbols circles
        titleFontSize: 14, // Font size for the legend title
      },}
    
  }) as VisualizationSpec;

  
  const Colorspec = (data: { id: string; }[]) => ({
    description: 'A scatter plot of affected clusters',
    mark: 'circle',
   
    encoding: {
      x: { field: xAxis, type: determineType(xAxis, data) },
      y: { field: yAxis, type: determineType(yAxis, data) },
      color: { field: colorField, type: 'nominal',scale: {
        domain: [0, 1], // Define the domain (values in the data)
        range: ["red", "green"], // Map 0 to red and 1 to green
      },
 },
      tooltip: [{ field: xAxis, type: 'nominal' }, { field: yAxis, type: 'nominal' }, { field: colorField, type: 'nominal' },

      ]
      
    },
    data: { values: data },
    width: 400,
    height: 400,
    config: {
      legend: {
        orient: "top", // Position the legend at the top
        direction: "horizontal", // Arrange items in a row
        padding: 10, // Space between legend items
        labelFontSize: 12, // Font size for legend labels
        symbolSize: 100, // Size of the legend symbols
        symbolType: "circle", // Make the symbols circles
        titleFontSize: 14, // Font size for the legend title
      },
    },
    
  }) as VisualizationSpec;
  


  

  const getEffCostForColorField = (field: string) => {
    const match = field.match(/^Action(\d+)_Prediction$/); // Extract the number from "ActionX_Prediction"
    if (match) {
      const actionNumber = match[1]; // Extracted number as a string
      return eff_cost_actions[actionNumber]; // Return the corresponding eff_cost_action
    }
    return null; // Return null if no match
  };

  // Fetch the corresponding eff_cost_actions for the selected colorField
  const selectedEffCost = getEffCostForColorField(colorField);


  return (
    <Box>
      <Box className="panel" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <FormControl variant="outlined" style={{ minWidth: 200, marginRight: '20px' }}>
          <InputLabel>X-Axis</InputLabel>
          <Select value={xAxis} onChange={(e) => setXAxis(e.target.value)} label="X-Axis"  MenuProps={{
                            PaperProps: {
                            style: {
                                maxHeight: 250,
                                maxWidth: 300,
                            },
                            },
                        }}>
            {options.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl variant="outlined" style={{ minWidth: 200, marginRight: '20px' }}>
          <InputLabel>Y-Axis</InputLabel>
          <Select value={yAxis} onChange={(e) => setYAxis(e.target.value)} label="Y-Axis" MenuProps={{
                            PaperProps: {
                            style: {
                                maxHeight: 250,
                                maxWidth: 300,
                            },
                            },
                        }}>
            {options.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>


     
          <WorkflowCard title="Title"
          description="Description not available">
          <ResponsiveVegaLite
          spec={spec(transformedData1)}
          actions={false}
          minWidth={100}
          aspectRatio={2/1}
          />
          </WorkflowCard>
          </Grid>
          <Grid item xs={12} md={6}>


       
        <WorkflowCard title="Title"
          description="Description not available">
          <ResponsiveVegaLite spec={spec(transformedData2)}
          actions={false}
          minWidth={100}
          aspectRatio={2/1}
          // onNewView={(view) => {
          //   view.addEventListener("click", (_e, item) => {
          //     if (item && item.datum) {
          //       const clickedValue = item.datum[colorField];
          //       const actionIndex = parseInt(clickedValue, 10) - 1;
          //       if (actionIndex >= 0 && actionIndex < actions.length) {
          //         console.log("Clicked Cluster:", clickedValue, "Value:", actions[actionIndex]);
          //       } else {
          //         console.log("Clicked Cluster:", clickedValue, "No corresponding action found");
          //       }
          //     }
          //   });
          // }} 
          />
          </WorkflowCard>
          </Grid>
          </Grid>
      
      
      {selectedEffCost && (
        <Paper>
          <Typography fontWeight={600} sx={{ padding: 1 }}>Title</Typography>     

        <Box className="panel" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        {/* Left side (Dropdown and DataGrid) */}
          {/* Dropdown (Form Control) */}
          <FormControl variant="outlined" fullWidth>
            <InputLabel>Apply</InputLabel>
            <Select
              value={colorField}
              onChange={(e) => setColorField(e.target.value)}
              label="Apply"
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 250,
                    maxWidth: 300,
                  },
                },
              }}
            >
              {colorOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* DataGrid (just below the dropdown) */}
          <Box width="100%" minWidth="100px">
          <DataGrid
              rows={tableRows}
              columns={tableColumns}
              autoHeight
              disableColumnMenu
              sx={{ marginTop: 1 }}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 5,
                  },
                }}
              }
              pageSizeOptions={[5, 10]}
            />
          </Box>
        </Box>

        {/* Right side (Vega-Lite Chart) */}
        <WorkflowCard title='Title' description=''>
          <ResponsiveVegaLite spec={Colorspec(transformedData1)} actions={false}  minWidth={100} aspectRatio={5/1} />
         
        </WorkflowCard>
        </Paper>

      
      )}
      </Box>

     
  );
};



export default ActionScatter;