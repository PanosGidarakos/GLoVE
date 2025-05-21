import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
} from "@mui/material"
import { useState } from "react"
import { useAppDispatch } from "../../../../store/store"
import { runModelComparative } from "../../../../store/slices/glanceSlice"
import ResponsiveVegaLite from "../../../../shared/components/responsive-vegalite"
import ResponsiveCardTable from "../../../../shared/components/responsive-card-table"
import Loader from "../../../../shared/components/loader"
import { getCompareMethodsChartSpec } from "../PLOTS/chartSpecs"
import InfoMessage from "../../../../shared/components/infoMessage"
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';

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

  const addZeroStep = (runData: any) => {
    return { "0": { eff: 0, cost: 0 }, ...runData }
  }

 const transformedData = results
  ? Object.entries(results).reduce((acc: { [key: string]: any }, [runName, runData]) => {
      acc[runName] = addZeroStep(runData)
      return acc
    }, {})
  : {}
  const transformData = (runData : any, runName : string, offset : number) => {
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


    console.log("allData", allData)

  
  return (

    <Box sx={{height: "600px" }}>
    <ResponsiveCardTable
    
      title={"Compare Model Analysis"}
      controlPanel={
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
            <InputLabel id="Algorithm Selection">
              Algorithm Selection
            </InputLabel>
            <Select
              labelId="Algorithm Selection"
              multiple
              value={algorithms}
              onChange={handleChange}
              input={<OutlinedInput label="Algorithm Selection" />}
            >
              <MenuItem value="run-c_glance">GLANCE</MenuItem>
              <MenuItem value="run-groupcfe">GroupCFE</MenuItem>
              <MenuItem value="run-globece">GLOBE-CE</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ flex: 1, minWidth: "100px" }}>
            <InputLabel id="Counterfactial Size">
              Counterfactial Size
            </InputLabel>
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
      }
    >
  {loading ? (
  <Loader />
) : errorMessage ? (
  <InfoMessage
    message="One or more algorithms failed to run."
    type="error"
    icon={
      <ReportProblemRoundedIcon sx={{ fontSize: 40, color: 'error.main' }} />
    }
    fullHeight
  />
) : allData.length === 0 ? (
  
  <InfoMessage
    message="Please select algorithm(s) and run the analysis to see results."
    type="info"
    icon={
      <ReportProblemRoundedIcon sx={{ fontSize: 40, color: 'info.main' }} />
    }
    fullHeight
  />
) : (
  <ResponsiveVegaLite
    title="Effectiveness vs. Cost"
    details={"todo"}
    spec={getCompareMethodsChartSpec(allData)}
    actions={false}
    minWidth={100}
    minHeight={100}
    maxWidth={1000}
    maxHeight={500}
  />
)}

    </ResponsiveCardTable>
    </Box>
  )
}

export default CompareMethods
