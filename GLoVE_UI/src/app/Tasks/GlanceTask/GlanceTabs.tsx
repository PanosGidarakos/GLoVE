import type React from "react"
import {
  useEffect,
  useState,
} from "react"
import {
  Box,
  CircularProgress,
  Typography,
} from "@mui/material"

import { useAppDispatch, useAppSelector } from "../../../store/store"
import {
  fetchAvailableFeatures,
  fetchInitialGlanceData,
  umapReduce,
} from "../../../store/slices/glanceSlice"

import DataModelSetup from "./DataAndModelSelection/DataModelSetup"
import DatasetExplorer from "./ExploreDataset/DatasetExplorer"
import ComparativeGlance from "./AnalyzeCounterFactuals/ComparativeGlance"
import CompareMethods from "./CompareModels/CompareMethods"
import UmapScatter from "./ExploreDataset/UmapScatter"
import ScatterPlotComponentForMainPage from "./ExploreDataset/ScatterComponentForMainPage"
import Loader from "../../../shared/components/loader"
import UmapToggle from "../../../shared/components/umapToggle"

interface GlanceTabsProps {
  selectedTab: number
  setSelectedTab: (tab: number) => void
  setActiveStep: (step: number) => void
}

const GlanceTabs: React.FC<GlanceTabsProps> = ({
  selectedTab,
  setSelectedTab,
  setActiveStep,
}) => {
  const dispatch = useAppDispatch()
  const glanceState = useAppSelector(state => state.glance)

  const [viewOption, setViewOption] = useState<"data" | "affected" | "test">("affected")
  const [showUMAPScatter, setShowUMAPScatter] = useState(true)
  const [umapCache, setUmapCache] = useState<{ [key: string]: any }>({})
  const [selectedDataset, setSelectedDataset] = useState("COMPAS Dataset")
  const [selectedModel, setSelectedModel] = useState("XGBoost")

  useEffect(() => {
    if (!glanceState.loadDatasetAndModelResult) {
      dispatch(fetchInitialGlanceData())
      dispatch(fetchAvailableFeatures())
      dispatch(umapReduce({ dataset_identifier: "affectedData", n_components: 2 }))
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

      if (!umapCache[datasetIdentifier]) {
        dispatch(umapReduce({ dataset_identifier: datasetIdentifier, n_components: 2 })).then(
          action => {
            if (action.payload) {
              setUmapCache(prev => ({
                ...prev,
                [datasetIdentifier]: action.payload.data,
              }))
            }
          }
        )
      }
    }
  }, [viewOption, showUMAPScatter, dispatch, umapCache])

  useEffect(() => {
    if (glanceState.loadDatasetAndModelResult) {
      setUmapCache({})
      setSelectedTab(1)
      setActiveStep(1)
    }
  }, [glanceState.loadDatasetAndModelResult])

  const renderScatterPlot = () => {
    if (!showUMAPScatter && viewOption === "affected") {
      return (
        <ScatterPlotComponentForMainPage
          data={glanceState.loadDatasetAndModelResult.affected}
          name="Affected Data"
          controlPanel={
            <UmapToggle
              showUMAPScatter={showUMAPScatter}
              setShowUMAPScatter={setShowUMAPScatter}
            />
          }
        />
      )
    }

    if (!showUMAPScatter && viewOption === "test") {
      return (
        <ScatterPlotComponentForMainPage
          data={glanceState.loadDatasetAndModelResult.X_test}
          name="Test Data"
            controlPanel={
            <UmapToggle
              showUMAPScatter={showUMAPScatter}
              setShowUMAPScatter={setShowUMAPScatter}
            />
          }
        />
      )
    }

    const datasetKey =
      viewOption === "data"
        ? "rawData"
        : viewOption === "affected"
        ? "affectedData"
        : "testData"

    if (umapCache[datasetKey]) {
      return <UmapScatter controlPanel={<UmapToggle showUMAPScatter={showUMAPScatter} setShowUMAPScatter={setShowUMAPScatter} />} data={umapCache[datasetKey].reduced_data} color={""} />
    }

    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress size={50} />
        <Typography variant="h6" sx={{ marginLeft: 2 }}>
          Fetching Data...
        </Typography>
      </Box>
    )
  }

  if (glanceState.initialLoading && !glanceState.loadDatasetAndModelResult) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="70vh"
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ marginTop: 2 }}>
          Initializing page...
        </Typography>
      </Box>
    )
  }

  return (
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
            <Loader />
          ) : (
            <ComparativeGlance
              availableCfMethods={glanceState.availableCfMethods}
              availableActionStrategies={glanceState.availableActionStrategies}
              availableFeatures={
                ["Heloc Dataset", "German Credit Dataset", "Default Credit Dataset", "COMPAS Dataset"].includes(
                  selectedDataset
                )
                  ? glanceState.availableFeatures.slice(0, -1)
                  : glanceState.targetName?.[0]
                  ? glanceState.availableFeatures.filter(f => f !== glanceState.targetName[0])
                  : glanceState.availableFeatures
              }
            />
          )}
        </>
      )}

      {selectedTab === 3 && <CompareMethods />}
    </Box>
  )
}

export default GlanceTabs
