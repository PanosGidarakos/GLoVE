import React from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { runCGlanceComparative } from "../../../../store/slices/glanceSlice";
import {
  Button,
  Typography,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  InputLabel,
  FormControl,
  OutlinedInput,
  TableContainer,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  Grid,
  TableRow,
} from "@mui/material";
import { VegaLite, VisualizationSpec } from "react-vega"; // Import VegaLite from react-vega
import ResponsiveVegaLite from "../../../../shared/components/responsive-vegalite";
import WorkflowCard from "../../../../shared/components/workflow-card";


interface CGlanceExecutionProps {
  availableCfMethods: string[];
  availableActionStrategies: string[];
  availableFeatures: string[];
}

const ComparativeGlance: React.FC<CGlanceExecutionProps> = ({
  availableCfMethods,
  availableActionStrategies,
  availableFeatures,
}) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.glance.loading);
  const error = useAppSelector((state) => state.glance.error);
  const glanceState = useAppSelector((state) => state.glance);


  const [executionMode, setExecutionMode] = React.useState<string>("Number of Actions");
  const [gcfSize, setGcfSize] = React.useState<number[]>([3,4]);
  const [cfMethod, setCfMethod] = React.useState<string[]>([availableCfMethods[0]]);
  const [actionChoiceStrategy, setActionChoiceStrategy] = React.useState<string[]>([availableActionStrategies[0]]);
  const [selectedFeatures, setSelectedFeatures] = React.useState<string[]>(availableFeatures);
  const [results, setResults] = React.useState<any | null>(null);

  const handleRun = () => {
    dispatch(
      runCGlanceComparative({
        sizes: gcfSize,
        methods: cfMethod,
        strategies: actionChoiceStrategy,
        selectedFeatures,
      })
    )
      .unwrap()
      .then((data) => {
        setResults(data); // Update results on success
      })
      .catch(() => {
        setResults(null);
      });
  };

  const isMultiSelect = (type: string) => executionMode === type;

  const getRowLabelKey = () => {
    switch (executionMode) {
      case "Number of Actions":
        return "size";
      case "Local Counterfactual Method":
        return "method";
      case "Action Choice Strategy":
        return "strategy";
      default:
        return "key";
    }
  };

  const rowLabelKey = getRowLabelKey();

  const getSuffix = (value: string) => value.split('_').pop() || value;

  const scatterPlotData = glanceState.comparativeResults
  ? Object.entries(glanceState.comparativeResults).map(([key, data]) => ({
      TotalCost: data.TotalCost,
      TotalEffectiveness: data.TotalEffectiveness,
      [rowLabelKey]: key,
      DisplayKey: getSuffix(key), // Add cleaned-up value for display
    }))
  : [];

  
  const scatterPlotSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { values: scatterPlotData },
    transform: [
      {
        calculate: "datum.TotalEffectiveness * 100", // Multiply TotalEffectiveness by 100
        as: "ScaledEffectiveness", // Store the result in a new field
      },
    ],
    mark: "point",
    encoding: {
      x: { field: "TotalCost", type: "quantitative", title: "Total Cost" },
      y: { 
        field: "ScaledEffectiveness", // Use the scaled field for the y-axis
        type: "quantitative", 
        title: "Total Effectiveness (%)", // Adjust the title to reflect the scaling
      },
      color: { field: rowLabelKey, type: "nominal", title: "Execution Mode" }, // Replace 'key' with dynamic field
      tooltip: [
        { field: "TotalCost", type: "quantitative", title: "Total Cost" },
        { 
          field: "ScaledEffectiveness", 
          type: "quantitative", 
          title: "Total Effectiveness (%)" // Reflect the scaled value in the tooltip
        },
        { field: rowLabelKey, type: "nominal", title: "Execution Mode" }, // Replace 'key' in tooltip
      ],
    },
  };
  
 

  const chart1 = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { values: scatterPlotData },
    transform: [
      {
        calculate: "datum.TotalEffectiveness * 100", // Scale TotalEffectiveness by 100
        as: "ScaledEffectiveness", // Store in a new field
      },
    ],
    mark: "bar",
    encoding: {
      y: { field: "TotalCost", type: "quantitative", title: "Total Cost" },
      x: { field: rowLabelKey, type: "nominal", title: "Execution Mode" }, // Replace 'key' with dynamic field
      tooltip: [
        { field: "TotalCost", type: "quantitative", title: "Total Cost" },
        { 
          field: "ScaledEffectiveness", 
          type: "quantitative", 
          title: "Total Effectiveness (%)" // Reflect scaled value
        },
        { field: rowLabelKey, type: "nominal", title: "Execution Mode" }, // Replace 'key' in tooltip
      ],
    },
  };
  
  const chart2 = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { values: scatterPlotData },
    transform: [
      {
        calculate: "datum.TotalEffectiveness * 100", // Scale TotalEffectiveness by 100
        as: "ScaledEffectiveness", // Store in a new field
      },
    ],
    mark: "bar",
    encoding: {
      y: { 
        field: "ScaledEffectiveness", // Use scaled field for the y-axis
        type: "quantitative", 
        title: "Total Effectiveness (%)" // Update axis title
      },
      x: { field: rowLabelKey, type: "nominal", title: "Execution Mode" }, // Replace 'key' with dynamic field
      tooltip: [
        { field: "TotalCost", type: "quantitative", title: "Total Cost" },
        { 
          field: "ScaledEffectiveness", 
          type: "quantitative", 
          title: "Total Effectiveness (%)" // Reflect scaled value in the tooltip
        },
        { field: rowLabelKey, type: "nominal", title: "Execution Mode" }, // Replace 'key' in tooltip
      ],
    },
  };
  
  return (
    <>
      <Box display="flex" alignItems="center" gap={1} marginBottom={2} marginTop={2} flexWrap="wrap">
        {/* Execution Mode Dropdown */}
        <FormControl fullWidth sx={{ flex: 1, minWidth: "150px" }}>
          <InputLabel id="execution-mode-select-label">Execution Mode</InputLabel>
          <Select
            labelId="execution-mode-select-label"
            value={executionMode}
            onChange={(e) => setExecutionMode(e.target.value)}
            input={<OutlinedInput label="Execution Mode" />}
          >
            <MenuItem value="Number of Actions">Number of Actions</MenuItem>
            <MenuItem value="Local Counterfactual Method">Local Counterfactual Method</MenuItem>
            <MenuItem value="Action Choice Strategy">Action Choice Strategy</MenuItem>
          </Select>
        </FormControl>

        {/* GCF Size */}
        <FormControl fullWidth sx={{ flex: 1, minWidth: "150px" }}>
        <InputLabel id="gcf-size-select-label">Number of Actions</InputLabel>
        <Select
            labelId="gcf-size-select-label"
            input={<OutlinedInput label="Number of Actions" />}
            multiple={isMultiSelect("Number of Actions")}
            value={gcfSize}
            onChange={(e) => setGcfSize(isMultiSelect("Number of Actions") ? (e.target.value as number[]) : [Number(e.target.value)])}
            renderValue={(selected) =>
              Array.isArray(selected) ? selected.join(", ") : selected
            }
            MenuProps={{
              PaperProps: { style: { maxHeight: 224, width: 250 } },
            }}
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Counterfactual Method */}
        <FormControl fullWidth sx={{ flex: 1, minWidth: "150px" }}>
          <InputLabel id="cf-method-select-label">Local Counterfactual Method</InputLabel>
          <Select
            labelId="cf-method-select-label"
            input={<OutlinedInput label="Local Counterfactual Method" />}
            multiple={isMultiSelect("Local Counterfactual Method")}
            value={cfMethod}
            onChange={(e) =>
              setCfMethod(
                isMultiSelect("Local Counterfactual Method") ? (e.target.value as string[]) : [(e.target.value as string)]
              )
            }
            renderValue={(selected) =>
              Array.isArray(selected) ? selected.join(", ") : selected
            }
            MenuProps={{
              PaperProps: { style: { maxHeight: 224, width: 250 } },
            }}
          >
            {availableCfMethods.map((method) => (
              <MenuItem key={method} value={method}>
                {method}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Action Choice Strategy */}
        <FormControl fullWidth sx={{ flex: 1, minWidth: "150px" }}>
          <InputLabel id="action-choice-strategy-select-label">Action Choice Strategy</InputLabel>
          <Select
            labelId="action-choice-strategy-select-label"
            input={<OutlinedInput label="Action Choice Strategy" />}
            multiple={isMultiSelect("Action Choice Strategy")}
            value={actionChoiceStrategy}
            onChange={(e) =>
              setActionChoiceStrategy(
                isMultiSelect("Action Choice Strategy") ? (e.target.value as string[]) : [(e.target.value as string)]
              )
            }
            renderValue={(selected) =>
              Array.isArray(selected) ? selected.join(", ") : selected
            }
            MenuProps={{
              PaperProps: { style: { maxHeight: 224, width: 250 } },
            }}
          >
            {availableActionStrategies.map((strategy) => (
              <MenuItem key={strategy} value={strategy}>
                {strategy}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Features */}
        {/* <FormControl fullWidth sx={{ flex: 1, minWidth: "150px" }}>
          <InputLabel id="feature-select-label">Features</InputLabel>
          <Select
            labelId="feature-select-label"
            input={<OutlinedInput label="Features" />}
            multiple
            value={selectedFeatures}
            onChange={(e) => setSelectedFeatures(e.target.value as string[])}
            renderValue={(selected) => selected.join(", ")}
            MenuProps={{
              PaperProps: { style: { maxHeight: 224, width: 250 } },
            }}
          >
            {availableFeatures.map((feature) => (
              <MenuItem key={feature} value={feature}>
                {feature}
              </MenuItem>
            ))}
          </Select>
        </FormControl> */}

        {/* Run Button */}
        <Box display="flex" justifyContent="center" alignItems="center">
          <Button
            variant="contained"
            color="primary"
            onClick={handleRun}
            disabled={
              loading ||
              (executionMode === "Number of Actions" && gcfSize.length === 0) ||
              (executionMode === "Local Counterfactual Method" && cfMethod.length === 0) ||
              (executionMode === "Action Choice Strategy" && actionChoiceStrategy.length === 0)
            }
          >
            Run Comparative Analysis
          </Button>
          {error && (
            <Typography color="error" style={{ marginTop: 16 }}>
              {error}
            </Typography>
          )}
        </Box>
      </Box>

      <Box marginTop={4}>
        {loading ? (
           <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="400px">
           <CircularProgress size={50} />
           <Typography variant="h6" sx={{ marginTop: 2 }}>
             Running Experiments...
           </Typography>
         </Box>
        ) : glanceState.comparativeResults && Object.keys(glanceState.comparativeResults).length > 0 ? (
          <>
            <WorkflowCard title="Comparative Analysis Results" description="">
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{rowLabelKey.charAt(0).toUpperCase() + rowLabelKey.slice(1)}</TableCell>
                    <TableCell>Total Cost</TableCell>
                    <TableCell>Total Effectiveness %</TableCell>
                    <TableCell>Details</TableCell> {/* New column header */}

                  </TableRow>
                </TableHead>
                <TableBody>
  {Object.entries(glanceState.comparativeResults).map(([key, data]: any) => (
    <TableRow key={key}>
      <TableCell>{getSuffix(key)}</TableCell> {/* Use getSuffix for display */}
      <TableCell>{data.TotalCost}</TableCell>
      <TableCell>{data.TotalEffectiveness*100}</TableCell>
      <TableCell>
            <Button
              variant="contained"
              color="primary"
              onClick={() => console.log(`Analysis button clicked for key: ${glanceState.comparativeResults[key]}`)}
            >
              View Details
            </Button>
          </TableCell> {/* New button column */}
    </TableRow>
  ))}
</TableBody>
              </Table>
            </TableContainer> 
            </WorkflowCard>
            <Grid container spacing={2} marginTop={"20px"}>
  <Grid item xs={12} md={4}>
    <WorkflowCard
      title="Cost-Effectiveness Scatter Plot"
      description="Visualizes the performance of the algorithm for different parameter configurations."
    >
      <ResponsiveVegaLite
        minWidth={100}
        aspectRatio={2 / 1}
        actions={false}
        spec={scatterPlotSpec as VisualizationSpec}
      />
    </WorkflowCard>
  </Grid>
  <Grid item xs={12} md={4}>
    <WorkflowCard
      title="Cost by Parameter Bar Plot"
      description="Displays the cost of the algorithm across different runs, with the y-axis representing effectiveness and the x-axis showing varying values of the selected parameter."
    >
      <ResponsiveVegaLite
        minWidth={100}
        aspectRatio={2 / 1}
        actions={false}
        spec={chart1 as VisualizationSpec}
      />
    </WorkflowCard>
  </Grid>
  <Grid item xs={12} md={4}>
    <WorkflowCard
      title="Effectiveness by Parameter Bar Plot"
      description="Displays the effectiveness of the algorithm across different runs, with the y-axis representing effectiveness and the x-axis showing varying values of the selected parameter."
    >
      <ResponsiveVegaLite
        minWidth={100}
        aspectRatio={2 / 1}
        actions={false}
        spec={chart2 as VisualizationSpec}
      />
    </WorkflowCard>
  </Grid>
</Grid>

          </>
        ) : (
          <Typography>Run Something</Typography>
        )}
      </Box>
    </>
  );
};

export default ComparativeGlance;
