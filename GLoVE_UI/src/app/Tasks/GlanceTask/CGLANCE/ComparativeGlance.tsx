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


  const [executionMode, setExecutionMode] = React.useState<string>("Counterfactual by Size");
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
      case "Counterfactual by Size":
        return "size";
      case "Counterfactual by Method":
        return "method";
      case "Counterfactual by Strategy":
        return "strategy";
      default:
        return "key";
    }
  };

  const rowLabelKey = getRowLabelKey();


  const scatterPlotData = glanceState.comparativeResults
    ? Object.entries(glanceState.comparativeResults).map(([key, data]) => ({
        TotalCost: data.TotalCost,
        TotalEffectiveness: data.TotalEffectiveness,
        key,
      }))
    : [];

  // Define the Vega-Lite specification
  const scatterPlotSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { values: scatterPlotData },
    mark: "point",
    encoding: {
      x: { field: "TotalCost", type: "quantitative", title: "Total Cost" },
      y: { field: "TotalEffectiveness", type: "quantitative", title: "Total Effectiveness" },
      color: { field: "key", type: "nominal", title: "Key" },
      tooltip: [
        { field: "TotalCost", type: "quantitative", title: "Total Cost" },
        { field: "TotalEffectiveness", type: "quantitative", title: "Total Effectiveness" },
        { field: "key", type: "nominal", title: "Key" },
      ],
    },
   
  } as VisualizationSpec;

  const chart1={
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { values: scatterPlotData },
    mark: "bar",
    encoding: {
      y: { field: "TotalCost", type: "quantitative", title: "Total Cost" },
      x: { field: "key", type: "nominal", title: "key" },
      tooltip: [
        { field: "TotalCost", type: "quantitative", title: "Total Cost" },
        { field: "TotalEffectiveness", type: "quantitative", title: "Total Effectiveness" },
        { field: "key", type: "nominal", title: "Key" },
      ],
    },
   
  }

  const chart2={
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { values: scatterPlotData },
    mark: "bar",
    encoding: {
      y: { field: "TotalEffectiveness", type: "quantitative", title: "Total Eff" },
      x: { field: "key", type: "nominal", title: "key" },
      tooltip: [
        { field: "TotalCost", type: "quantitative", title: "Total Cost" },
        { field: "TotalEffectiveness", type: "quantitative", title: "Total Effectiveness" },
        { field: "key", type: "nominal", title: "Key" },
      ],
    },
  
  }
  
  
  console.log(results)
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
            <MenuItem value="Counterfactual by Size">Counterfactual by Size</MenuItem>
            <MenuItem value="Counterfactual by Method">Counterfactual by Method</MenuItem>
            <MenuItem value="Counterfactual by Strategy">Counterfactual by Strategy</MenuItem>
          </Select>
        </FormControl>

        {/* GCF Size */}
        <FormControl fullWidth sx={{ flex: 1, minWidth: "150px" }}>
        <InputLabel id="gcf-size-select-label">Number of CounterFactual Actions</InputLabel>
        <Select
            labelId="gcf-size-select-label"
            input={<OutlinedInput label="Number of CounterFactual Actions" />}
            multiple={isMultiSelect("Counterfactual by Size")}
            value={gcfSize}
            onChange={(e) => setGcfSize(isMultiSelect("Counterfactual by Size") ? (e.target.value as number[]) : [Number(e.target.value)])}
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
            multiple={isMultiSelect("Counterfactual by Method")}
            value={cfMethod}
            onChange={(e) =>
              setCfMethod(
                isMultiSelect("Counterfactual by Method") ? (e.target.value as string[]) : [(e.target.value as string)]
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
            multiple={isMultiSelect("Counterfactual by Strategy")}
            value={actionChoiceStrategy}
            onChange={(e) =>
              setActionChoiceStrategy(
                isMultiSelect("Counterfactual by Strategy") ? (e.target.value as string[]) : [(e.target.value as string)]
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
        <FormControl fullWidth sx={{ flex: 1, minWidth: "150px" }}>
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
        </FormControl>

        {/* Run Button */}
        <Box display="flex" justifyContent="center" alignItems="center">
          <Button
            variant="contained"
            color="primary"
            onClick={handleRun}
            disabled={
              loading ||
              (executionMode === "Counterfactual by Size" && gcfSize.length === 0) ||
              (executionMode === "Counterfactual by Method" && cfMethod.length === 0) ||
              (executionMode === "Counterfactual by Strategy" && actionChoiceStrategy.length === 0)
            }
          >
            Run C-GLANCE
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
            <Typography variant="h6" marginBottom={2}>
              Comparative Results
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{rowLabelKey.charAt(0).toUpperCase() + rowLabelKey.slice(1)}</TableCell>
                    <TableCell>Total Cost</TableCell>
                    <TableCell>Total Effectiveness</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(glanceState.comparativeResults).map(([key, data]: any) => (
                    <TableRow key={key}>
                      <TableCell>{key}</TableCell>
                      <TableCell>{data.TotalCost}</TableCell>
                      <TableCell>{data.TotalEffectiveness}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="400px" marginTop={10}>
            <ResponsiveVegaLite
          minWidth={100}
          aspectRatio={5 / 1}
          actions={false}
          spec={scatterPlotSpec as VisualizationSpec}
        />            
        
        </Box>
        <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
              <WorkflowCard title="title" description="">
  <ResponsiveVegaLite
          minWidth={100}
          aspectRatio={2 / 1}
          actions={false}
          spec={chart1 as VisualizationSpec}
        />
  </WorkflowCard>
  </Grid>
  <Grid item xs={12} md={6}>

  <WorkflowCard title="title" description="">
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