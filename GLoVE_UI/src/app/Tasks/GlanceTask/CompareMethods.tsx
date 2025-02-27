import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
} from "@mui/material"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../../store/store"
import { runModelComparative } from "../../../store/slices/glanceSlice"
import { error } from "vega"


const CompareMethods: React.FC = () => {
  const [algorithms, setAlgorithms] = useState<string[]>(["run-c_glance"])
  const [gcfSize, setGcfSize] = useState<number[]>([3])
  const dispatch = useAppDispatch()
  const glanceState = useAppSelector(state => state.glance)
  console.log("glanceState", glanceState.modelComparativeResults?.data?.TotalCost)

  const [results, setResults] =useState<any | null>(null)
  const [errorMessage, setErrorMessage] = useState<Record<string, string> | null>(null) // Add state for error messages


// const handleRun = () => {
//     dispatch(
//         runModelComparative({
//             algorithm: algorithms[0],
//             gcf_size: gcfSize[0],
//             cf_method: "",
//             action_choice_strategy: ""
//         })
//        )
//       .unwrap()
//       .then(data => {
//         setResults(data) // Update results on success
//       })
//       .catch(error => {
//         setResults(null) // Clear results if there's an error
//         if (error?.detail) {
//           setErrorMessage(error.detail) // Set the error message from the response
//         } else {
//           setErrorMessage("An unexpected error occurred.") // Default error message
//         }
//       })
//   }


const handleRun = async () => {
    setResults(null); // Clear previous results
    setErrorMessage(null); // Clear previous errors
  
    const resultsMap: Record<string, any> = {}; // Object to store results
    const errorsMap: Record<string, string> = {}; // Object to store errors
  
    await Promise.all(
      algorithms.map(async (algorithm) => {
        try {
          const data = await dispatch(
            runModelComparative({
              algorithm,
              gcf_size: gcfSize[0],
              cf_method: "Dice",
              action_choice_strategy: "Max Effectiveness",
            })
          ).unwrap();
          
          resultsMap[algorithm] = data; // Store result
        } catch (error: any) {
          errorsMap[algorithm] = error?.detail || "An unexpected error occurred."; // Store error
        }
      })
    );
  
    // Update state with results
    setResults(resultsMap);
    
    // If there are errors, update error state
    if (Object.keys(errorsMap).length > 0) {
      setErrorMessage(errorsMap);
    }
  };

  console.log("results", results)
  
  

  const handleChange = (event: any) => {
    const {
      target: { value },
    } = event
    setAlgorithms(typeof value === "string" ? value.split(",") : value)
  }

  console.log("algorithms", algorithms)
  console.log("gcfSize", gcfSize)

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
      <Typography variant="h4" component="h1">
        Compare Methods
      </Typography>

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
        <FormControl fullWidth sx={{ flex: 1, minWidth: "150px" }}>
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
        <FormControl fullWidth sx={{ flex: 1, minWidth: "150px" }}>
          <InputLabel id="GCF Size Selection">GCF Size Selection</InputLabel>
          <Select
            labelId="GCF Size Selection"
            multiple
            value={gcfSize}
            onChange={e => setGcfSize(e.target.value as number[])}
            input={<OutlinedInput label="GCF Size Selection" />}
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map(value => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

       
            <Button
              variant="contained"
              color="primary"
              onClick={handleRun}
              
            >
              Run Analysis
            </Button>
           
      </Box>

    </Box>
  )
}

export default CompareMethods
