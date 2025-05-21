import {
  Box,
  CircularProgress,
  Typography,
  FormControlLabel,
  Switch,
} from "@mui/material"
import DataTable from "./PLOTS/DataTable"
import ResponsiveCardTable from "../../../shared/components/responsive-card-table"

const DatasetExplorer = ({
  glanceState,
  viewOption,
  setViewOption,
  showUMAPScatter,
  setShowUMAPScatter,
  renderScatterPlot,
  selectedDataset,
  selectedModel,
}) => {
  const hasData =
    viewOption === "affected"
      ? glanceState.loadDatasetAndModelResult.affected
      : glanceState.loadDatasetAndModelResult.X_test

  const tableTitle = viewOption === "affected" ? "Affected Test Data" : "Test Data"
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
    <ResponsiveCardTable title={cardTitle}
    details={description} controlPanel={ <FormControlLabel
          control={
            <Switch
              checked={viewOption === "affected"}
              onChange={e => setViewOption(e.target.checked ? "affected" : "test")}
              color="primary"
            />
          }
          label={viewOption === "affected" ? "Affected Data" : "Test Data"}
          labelPlacement="start"
        
        />}>
            
            
             <DataTable
          title={tableTitle}
          data={hasData}
          showArrow={false}
        />
        
    </ResponsiveCardTable>
      <FormControlLabel
        control={
          <Switch
            checked={showUMAPScatter}
            onChange={e => setShowUMAPScatter(e.target.checked)}
            color="primary"
            sx={{ marginLeft: 2 }}
          />
        }
        label="Enable Dimensionality Reduction (UMAP)"
      />
      {renderScatterPlot()}
      </>
  )
}

export default DatasetExplorer
