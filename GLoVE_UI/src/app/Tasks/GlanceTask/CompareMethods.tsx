import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
} from "@mui/material"
import { useState } from "react"
import { useAppDispatch } from "../../../store/store"
import { runModelComparative } from "../../../store/slices/glanceSlice"
import ResponsiveVegaLite from "../../../shared/components/responsive-vegalite"

const CompareMethods = () => {
  const [algorithms, setAlgorithms] = useState<string[]>(["run-c_glance"])
  const [gcfSize, setGcfSize] = useState<number>(3)
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState<boolean>(false) // Loading state

  const [results, setResults] = useState<any | null>(null)
  const [errorMessage, setErrorMessage] = useState<Record<
    string,
    string
  > | null>(null) // Add state for error messages
  const handleRun = async () => {
    setResults(null) // Clear previous results
    setErrorMessage(null) // Clear previous errors
    setLoading(true) // Set loading to true when the analysis starts

    const resultsMap: Record<string, any> = {} // Object to store results
    const errorsMap: Record<string, string> = {} // Object to store errors

    await Promise.all(
      algorithms.map(async algorithm => {
        try {
          const data = await dispatch(
            runModelComparative({
              algorithm,
              gcf_size: gcfSize,
            }),
          ).unwrap()

          resultsMap[algorithm] = data.data.eff_cost_plot // Store result
        } catch (error: any) {
          errorsMap[algorithm] =
            error?.detail || "An unexpected error occurred." // Store error
        }
      }),
    )
    // Update state with results
    setResults(resultsMap)
    setLoading(false) // Set loading to false when the analysis is complete

    // If there are errors, update error state
    if (Object.keys(errorsMap).length > 0) {
      setErrorMessage(errorsMap)
    }
  }
  const handleChange = (event: any) => {
    const {
      target: { value },
    } = event
    setAlgorithms(typeof value === "string" ? value.split(",") : value)
  }

  const addZeroStep = runData => {
    return { "0": { eff: 0, cost: 0 }, ...runData }
  }

  const transformedData = results
    ? Object.entries(results).reduce((acc, [runName, runData]) => {
      acc[runName] = addZeroStep(runData)
        return acc
      }, {})
    : {}

  const transformData = (runData, runName, offset) => {
    return Object.keys(runData).map(step => ({
      step: parseInt(step) + offset,
      eff: runData[step].eff,
      cost: runData[step].cost,
      run: runName,
    }))
  }

  const allData = results
    ? Object.entries(transformedData).flatMap(([runName, runData], index) =>
        transformData(runData, runName, index * (gcfSize + 1)),
      )
    : []
  // const spec = (yField: string) => {
  //   return {
  //     $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  //     mark: { type: "line", interpolate: "step-after", point: true },
  //     encoding: {
  //       x: {
  //         field: "step",
  //         type: "ordinal",
  //         title: "",
  //         axis: { labels: false, ticks: false }, // Hides numbers and ticks
  //       },
  //       y: {
  //         field: yField, // Dynamically use the Y-field selected ("eff" or "cost")
  //         type: "quantitative",
  //         title: yField === "eff" ? "Effectiveness" : "Cost", // Set the Y-axis title dynamically
  //       },
  //       color: {
  //         field: "run",
  //         type: "nominal",
  //         title: "Method",
  //       },
  //     },
  //     data: { values: allData },
  //   }
  // }


  // const spec = {
  //   $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  //   layer: [
  //     {
  //       mark: { type: "line", interpolate: "step-after", point: true },
  //       encoding: {
  //         x: {
  //           field: "step",
  //           type: "ordinal",
  //           title: "Step",
  //         },
  //         y: {
  //           field: "eff",
  //           type: "quantitative",
  //           title: "Effectiveness",
  //           axis: { titleColor: "blue" },
  //         },
  //         color: { field: "run", type: "nominal", title: "Method" },
  //       },
  //     },
  //     {
  //       mark: { type: "bar", opacity: 0.5 },
  //       encoding: {
  //         x: {
  //           field: "step",
  //           type: "ordinal",
  //         },
  //         y: {
  //           field: "cost",
  //           type: "quantitative",
  //           title: "Cost",
  //           axis: { titleColor: "red" },
  //         },
  //         color: { field: "run", type: "nominal", title: "Method" },
  //       },
  //     },
  //   ],
  //   data: { values: allData },
  // }

  const spec = {
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
  }
  
  
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        marginBottom={2}
        marginTop={2}
        flexWrap="wrap"
        padding={2}
      >
        {/* Algorithm Selection Dropdown (Multiple) */}
        <FormControl fullWidth sx={{ flex: 1, minWidth: "220px" }}>
          <InputLabel id="Algorithm Selection">Algorithm Selection</InputLabel>
          <Select
            labelId="Algorithm Selection"
            multiple
            value={algorithms}
            onChange={handleChange}
            input={<OutlinedInput label="Algorithm Selection" />}
          >
            <MenuItem value="run-c_glance">Glance</MenuItem>
            <MenuItem value="run-groupcfe">Group</MenuItem>
            <MenuItem value="run-globece">Globece</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ flex: 1, minWidth: "100px" }}>
          <InputLabel id="Counterfactial Size">Counterfactial Size</InputLabel>
          <Select
            labelId="Counterfactial Size"
            // multiple
            value={gcfSize}
            onChange={e => setGcfSize(e.target.value as number)}
            input={<OutlinedInput label="GCF Size Selection" />}
            
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map(value => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={handleRun}>
          Run Analysis
        </Button>
      </Box>
      {loading ? (
        <>
          <Typography variant="h6">Running Experiments</Typography>
          <CircularProgress />
        </>
      ) : (
        allData.length > 0 && (
          <>
            {" "}
            <ResponsiveVegaLite
              spec={spec}
              actions={false}
              minWidth={100}
              minHeight={100}
              maxWidth={500}
              maxHeight={500}
            />
            {/* <ResponsiveVegaLite
              spec={spec("cost")}
              actions={false}
              minWidth={100}
              minHeight={100}
              maxWidth={500}
              maxHeight={500}
            /> */}
          </>
        )
      )}
    </Box>
  )
}

export default CompareMethods
