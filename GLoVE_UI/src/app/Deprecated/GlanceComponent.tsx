import type React from "react";
import { useEffect, useState } from "react"
import DataModelSetup from "../Tasks/GlanceTask/DataAndModelSelection/DataModelSetup"
import { useAppDispatch, useAppSelector } from "../../store/store"
import {
  fetchAvailableFeatures,
  fetchInitialGlanceData,
  umapReduce,
} from "../../store/slices/glanceSlice"
import {
  Box,
  Typography,
  CircularProgress,
} from "@mui/material"
import UmapScatter from "../Tasks/GlanceTask/ExploreDataset/UmapScatter"
import ScatterPlotComponentForMainPage from "../Tasks/GlanceTask/ExploreDataset/ScatterComponentForMainPage"
import ComparativeGlance from "../Tasks/GlanceTask/AnalyzeCounterFactuals/ComparativeGlance"
import CompareMethods from "../Tasks/GlanceTask/CompareModels/CompareMethods"
import DatasetExplorer from "../Tasks/GlanceTask/ExploreDataset/DatasetExplorer"
import FlowStepper from "../Tasks/GlanceTask/FlowStepper"
import { ReactFlowProvider } from "reactflow"
import Loader from "../../shared/components/loader";

const styles = {
  sidebar: {
    width: "25%",
    padding: "16px",
    margin: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    backgroundColor: "#f9f9f9",
  },
  mainContent: {
    width: "99%",
    padding: "-1px",
    // margin: '10px',
  },
  header: {
    textAlign: "center",
    marginBottom: "24px",
  },
  layoutContainer: {
    display: "flex",
    flexDirection: "column", // Default to column for smaller screens
    "@media (min-width: 768px)": {
      // Apply media query for larger screens
      flexDirection: "row",
    },
  },
  contentContainer: {
    display: "flex",
    flexDirection: "column", // Default to column
    gap: "16px",
    "@media (min-width: 1024px)": {
      // Side-by-side view on larger screens
      flexDirection: "row",
    },
  },
  loaderContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    flexDirection: "column",
  },
  flexChild: {
    flex: 1, // Ensure flexible children take equal space
    minWidth: "300px", // Minimum width for smaller screens
  },
}

const GlanceComponent: React.FC = () => {
  const dispatch = useAppDispatch()
  const glanceState = useAppSelector(state => state.glance)
  const [viewOption, setViewOption] = useState<"data" | "affected" | "test">(
    "affected",
  )
  const [selectedTab, setSelectedTab] = useState<number>(0) // Track selected tab
  const [showUMAPScatter, setShowUMAPScatter] = useState(true) // State to toggle scatter plot
  const [umapCache, setUmapCache] = useState<{ [key: string]: any }>({})
  const [activeStep, setActiveStep] = useState(0)
  const [selectedDataset, setSelectedDataset] =
    useState<string>("COMPAS Dataset")
  const [selectedModel, setSelectedModel] = useState<string>("XGBoost")

  const Header = (
    <Typography
      variant="h4"
      gutterBottom
      sx={{
        ...styles.header,
        background: "linear-gradient(90deg, green, blue)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        fontWeight: "bold",
        marginBottom: 2,
        marginTop: 4,
      }}
    >
      GLOVES: Global Counterfactual-based Visual Explanations
    </Typography>
  )

  const renderScatterPlot = () => {
    if (!showUMAPScatter && viewOption === "affected") {
      // Render Raw Scatter when checkbox is unchecked
      return (
        <ScatterPlotComponentForMainPage
          data={glanceState.loadDatasetAndModelResult.affected}
          name="Affected Data"
        />
      )
    }
    if (!showUMAPScatter && viewOption === "test") {
      // Render Raw Scatter when checkbox is unchecked
      return (
        <ScatterPlotComponentForMainPage
          data={glanceState.loadDatasetAndModelResult.X_test}
          name="Test Data"
        />
      )
    }
    if (glanceState.loading) {
      // Show loader when UMAP data is still loading
      return (
        <Box sx={styles.loaderContainer}>
          <CircularProgress size={50} />
          <Typography variant="h6" sx={{ marginTop: 2 }}>
            Enabling Dimensionality Reduction (UMAP)...
          </Typography>
        </Box>
      )
    }

    const datasetKey =
      viewOption === "data"
        ? "rawData"
        : viewOption === "affected"
          ? "affectedData"
          : "testData" // Update or expand if necessary

    if (umapCache[datasetKey]) {
      const umapData = umapCache[datasetKey].reduced_data
      // Use `umapData` for your visualization logic
      return (
        <UmapScatter
          data={umapData}
          color={viewOption === "affected" ? "" : "label"} // Adjust color logic as needed
        />
      )
    } else {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="300px" // Adjust the height to ensure proper centering
        >
          <CircularProgress size={50} />
          <Typography variant="h6" sx={{ marginLeft: 2 }}>
            Fetching Data...
          </Typography>
        </Box>
      )
    }
  }


  useEffect(() => {
    if (!glanceState.loadDatasetAndModelResult) {
      dispatch(fetchInitialGlanceData())
      dispatch(fetchAvailableFeatures())
      dispatch(
        umapReduce({ dataset_identifier: "affectedData", n_components: 2 }),
      )
      dispatch(umapReduce({ dataset_identifier: "testData", n_components: 2 }))
    }
  }, [dispatch])

  useEffect(() => {
    if (viewOption && showUMAPScatter) {
      const datasetIdentifier =
        viewOption === "data"
          ? "rawData"
          : viewOption === "affected"
            ? "affectedData"
            : "testData"
      // Check if UMAP data is already cached
      if (!umapCache[datasetIdentifier]) {
        dispatch(
          umapReduce({
            dataset_identifier: datasetIdentifier,
            n_components: 2,
          }),
        ).then(action => {
          // Store the result in the cache
          if (action.payload) {
            setUmapCache(prevCache => ({
              ...prevCache,
              [datasetIdentifier]: action.payload.data,
            }))
          }
        })
      }
    }
  }, [viewOption, dispatch, showUMAPScatter, umapCache])

  useEffect(() => {
    if (glanceState.loadDatasetAndModelResult) {
      // Clear the UMAP cache when the dataset/model changes
      setUmapCache({})
      setSelectedTab(1)
      setActiveStep(1)
    }
  }, [glanceState.loadDatasetAndModelResult])

  

  if (glanceState.initialLoading && !glanceState.loadDatasetAndModelResult) {
    return (
      <Box sx={styles.loaderContainer}>
        {Header}
        <CircularProgress />
        <Typography variant="h6" sx={{ marginTop: 2 }}>
          Initializing page...
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        padding: 2, // Adds consistent padding
        backgroundColor: "#f9f9f9", // Light background for the app
        minHeight: "100vh", // Ensures full viewport height
      }}
    >
     {Header}

      <ReactFlowProvider>
        <FlowStepper
          setSelectedTab={setSelectedTab}
          setActiveStep={setActiveStep}
          activeStep={activeStep}
        />
      </ReactFlowProvider>


      <Box sx={{ padding: 2 }}>
        {selectedTab === 0 && (
          
            <DataModelSetup
              selectedDataset={selectedDataset}
              setSelectedDataset={setSelectedDataset}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
            />
          
        )}
        {selectedTab === 1 && (
          <DatasetExplorer
            glanceState={glanceState}
            viewOption={viewOption}
            setViewOption={setViewOption}
            showUMAPScatter={showUMAPScatter}
            setShowUMAPScatter={setShowUMAPScatter}
            renderScatterPlot={renderScatterPlot}
            selectedDataset={selectedDataset}
            selectedModel={selectedModel}
          />
        )}

        {selectedTab === 2 && (
          <>
         
            {glanceState.datasetLoading ? (
              <Loader/>
            ) : (
              <Box>
                <ComparativeGlance
                  availableCfMethods={glanceState.availableCfMethods}
                  availableActionStrategies={
                    glanceState.availableActionStrategies
                  }
                  availableFeatures={
                    selectedDataset === "Heloc Dataset" ||
                    selectedDataset === "German Credit Dataset" ||
                    selectedDataset === "Default Credit Dataset" ||
                    selectedDataset === "COMPAS Dataset"
                      ? glanceState.availableFeatures.slice(0, -1)
                      : glanceState.targetName &&
                          glanceState.targetName[0] !== undefined
                        ? glanceState.availableFeatures.filter(
                            feature => feature !== glanceState?.targetName[0],
                          )
                        : glanceState.availableFeatures
                  }
                />
              </Box>
            )}
            </>
        )}
        {selectedTab === 3 && <CompareMethods />}
      </Box>
    </Box>
  )
}

export default GlanceComponent
