import {
  Box,
  CircularProgress,
  Typography,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material"
import DataTable from "./DataTable"
import ResponsiveCardTable from "../../../../shared/components/responsive-card-table"
import UmapToggle from "../../../../shared/components/umapToggle"
interface DatasetExplorerProps {
  glanceState: any
  viewOption: string
  setViewOption: any
  showUMAPScatter: boolean
  setShowUMAPScatter: any
  renderScatterPlot: any
  selectedDataset: string
  selectedModel: string
}

const DatasetExplorer = ({
  glanceState,
  viewOption,
  setViewOption,
  showUMAPScatter,
  setShowUMAPScatter,
  renderScatterPlot,
  selectedDataset,
  selectedModel,
}: DatasetExplorerProps) => {
  const hasData =
    viewOption === "affected"
      ? glanceState.loadDatasetAndModelResult.affected
      : glanceState.loadDatasetAndModelResult.X_test

  const tableTitle =
    viewOption === "affected" ? "Affected Test Data" : "Test Data"
  const cardTitle = `${viewOption === "affected" ? "Affected" : "Test"} Data for ${selectedDataset} with ${selectedModel} model`
  const description =
    viewOption === "affected"
      ? "Instances from the test dataset where the model's prediction was equal to 0."
      : "A subset of the dataset used to evaluate model performance on unseen data."

  if (glanceState.datasetLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="300px"
      >
        <CircularProgress size={50} />
        <Typography variant="h6" sx={{ marginLeft: 2 }}>
          Fetching Data...
        </Typography>
      </Box>
    )
  }

  if (!hasData) return null

  return (
    <>
      <ResponsiveCardTable
        title={cardTitle}
        showControlsInHeader
        details={description}
        controlPanel={
          <>
            <Box
              display="flex"
              alignItems="center"
              gap={2} // spacing between buttons and toggle
              width="100%"
            >
              <ToggleButtonGroup
                value={viewOption}
                exclusive
                onChange={(e, newValue) => {
                  if (newValue !== null) setViewOption(newValue)
                }}
                color="primary"
                size="small"
                sx={{ flex: 1 }}
              >
                <ToggleButton value="affected" sx={{ fontWeight: "bold" }}>
                  Affected Data
                </ToggleButton>
                <ToggleButton value="test" sx={{ fontWeight: "bold" }}>
                  Test Data
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </>
        }
      >
        <DataTable title={tableTitle} data={hasData} showArrow={false} />
      </ResponsiveCardTable>
      <Box mt={2}>

      {renderScatterPlot()}
      </Box>
    </>
  )
}

export default DatasetExplorer
