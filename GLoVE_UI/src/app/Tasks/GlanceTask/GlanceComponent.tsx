import React, { useEffect, useState } from "react";
import DataModelSetup from "./SIDEBAR/DataModelSetup";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { fetchAvailableFeatures, fetchInitialGlanceData, loadDatasetAndModel, runCGlanceComparative, umapReduce } from "../../../store/slices/glanceSlice";
import { Paper, Box, Typography, CircularProgress, Tabs, Tab, FormControlLabel, Radio, RadioGroup, Checkbox, Tooltip, Switch } from "@mui/material";
import DataTable from "./PLOTS/DataTable";
import MetricSummary from "./MetricSummary";
import UmapScatter from "./PLOTS/UmapScatter";
import ScatterPlotComponentForMainPage from "./PLOTS/ScatterComponentForMainPage";

import CGlanceExecution from "./CGLANCE/CGlanceExecution";
import ActionScatter from "./PLOTS/ActionScatter";
import ComparativeGlance from "./CGLANCE/ComparativeGlance";
import UmapGlanceComponent from "./UmapGlanceComponent";
import WorkflowCard from "../../../shared/components/workflow-card";

const styles = {
  sidebar: {
    width: '25%',
    padding: '16px',
    margin: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    backgroundColor: '#f9f9f9',
  },
  mainContent: {
    width: '75%',
    padding: '16px',
    margin: '20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  layoutContainer: {
    display: 'flex',
    flexDirection: 'column', // Default to column for smaller screens
    '@media (min-width: 768px)': { // Apply media query for larger screens
      flexDirection: 'row',
    },
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column', // Default to column
    gap: '16px',
    '@media (min-width: 1024px)': { // Side-by-side view on larger screens
      flexDirection: 'row',
    },
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    flexDirection: 'column',
  },
  flexChild: {
    flex: 1, // Ensure flexible children take equal space
    minWidth: '300px', // Minimum width for smaller screens
  },
};


const GlanceComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const glanceState = useAppSelector((state) => state.glance);
  const [viewOption, setViewOption] = useState<"data" | "affected" | "test">("affected"); // Track which data to display
  const [selectedTab, setSelectedTab] = useState<number>(0); // Track selected tab
  const [showUMAPScatter, setShowUMAPScatter] = useState(true); // State to toggle scatter plot
  const [processedDataset, setProcessedDataset] = useState([]);
  const [showUMAPInTab1, setShowUMAPInTab1] = useState(false); // New state for UMAP in Tab 1
  const [umapCache, setUmapCache] = useState<{ [key: string]: any }>({});


  useEffect(() => {
    if (!glanceState.loadDatasetAndModelResult) {
      dispatch(fetchInitialGlanceData());
      dispatch(fetchAvailableFeatures());
      dispatch(umapReduce({ dataset_identifier: "affectedData", n_components: 2 }));
      dispatch(umapReduce({ dataset_identifier: "testData", n_components: 2 }));

    
    }
  }, [dispatch]);

  useEffect(() => {
    if (viewOption && showUMAPScatter) {
      const datasetIdentifier =
        viewOption === "data"
          ? "rawData"
          : viewOption === "affected"
            ? "affectedData"
            : "testData";
      console.log("dataseid",datasetIdentifier)
      // Check if UMAP data is already cached
      if (!umapCache[datasetIdentifier]) {
        dispatch(umapReduce({ dataset_identifier: datasetIdentifier, n_components: 2 }))
          .then((action) => {
            // Store the result in the cache
            if (action.payload) {
              setUmapCache((prevCache) => ({
                ...prevCache,
                [datasetIdentifier]: action.payload.data,
              }));
            }
          });
      }
    }
  }, [viewOption, dispatch, showUMAPScatter, umapCache]);

  useEffect(() => {
    if (glanceState.loadDatasetAndModelResult) {
      // Clear the UMAP cache when the dataset/model changes
      setUmapCache({});
      setSelectedTab(0);
    }
  }, [glanceState.loadDatasetAndModelResult]);

  useEffect(() => {
    if (glanceState.runGlanceResult) {
      const indexValues = new Set(Object.values(glanceState.runGlanceResult.affected_clusters.index));
      const newDataset = glanceState.loadDatasetAndModelResult.X_test.map((item: any, idx: unknown) => {
        if (indexValues.has(idx)) {
          const indexArray = Object.values(glanceState.runGlanceResult.affected_clusters.index);
          const actionIndex = indexArray.indexOf(idx);
          const actionValue = glanceState.runGlanceResult.affected_clusters.Chosen_Action[actionIndex];
          return { ...item, action: actionValue };
        } else {
          return { ...item, action: "-1" };
        }
      });

      setProcessedDataset(newDataset); // Set the state
      // console.log("processedDataset",processedDataset)
    }
  }, [glanceState.runGlanceResult,]);


  // Handle Tab Change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };


  const renderScatterPlot = () => {

    if (!showUMAPScatter && viewOption === "data") {
      // Render Raw Scatter when checkbox is unchecked
      return <ScatterPlotComponentForMainPage data={glanceState.loadDatasetAndModelResult.data} name="Raw Data" />
    }
    if (!showUMAPScatter && viewOption === "affected") {
      // Render Raw Scatter when checkbox is unchecked
      return (
        <WorkflowCard title="Affected Data Scatter Plot" description="Visualizes Affected instances, each labeled with the prediction given by the model
 ">
          <ScatterPlotComponentForMainPage data={glanceState.loadDatasetAndModelResult.affected} name="Affected Data" />
        </WorkflowCard>);
    }
    if (!showUMAPScatter && viewOption === "test") {
      // Render Raw Scatter when checkbox is unchecked
      return (
        <WorkflowCard title="Test Data Scatter Plot" description="Visualizes Test instances, each labeled with the prediction given by the model">

          <ScatterPlotComponentForMainPage data={glanceState.loadDatasetAndModelResult.X_test} name="Test Data" />
        </WorkflowCard>)
    }
    if (glanceState.loading) {
      // Show loader when UMAP data is still loading
      return (
        <Box sx={styles.loaderContainer}>
          <CircularProgress size={50} />
          <Typography variant="h6" sx={{ marginTop: 2 }}>Enabling Dimensionality Reduction (UMAP)...</Typography>
        </Box>
      );

    }
    const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const datasetKey = viewOption === "data" ? "rawData" :
      viewOption === "affected" ? "affectedData" :
        "testData"; // Update or expand if necessary

    //  if (glanceState.umapReduceResults[datasetKey]) {
    //   const umapData = glanceState.umapReduceResults[datasetKey].reduced_data; // Retrieve the UMAP data based on dataset key
    if (umapCache[datasetKey]) {
      const umapData = umapCache[datasetKey].reduced_data;
      // Use `umapData` for your visualization logic
      return (
        <WorkflowCard title={`${capitalizeFirstLetter(viewOption)} Data Scatter Plot`}
          description={`Visualizes ${capitalizeFirstLetter(viewOption)} instances, each labeled with the prediction given by the model`}>
          <UmapScatter
            data={umapData}
            color={viewOption === "affected" ? "" : "label"} // Adjust color logic as needed
          />
        </WorkflowCard>
      );
    } else return <Typography variant="body1">No UMAP data available.</Typography>;
  };



  if (glanceState.initialLoading && !glanceState.loadDatasetAndModelResult) {
    return (
      <Box sx={styles.loaderContainer}>
        <CircularProgress />
        <Typography variant="h6" sx={{ marginTop: 2 }}>Initializing page...</Typography>
      </Box>
    );
  }


  console.log("GlanceSate", glanceState)

  return (
    <Box sx={styles.layoutContainer}>
      <Paper sx={styles.sidebar}>
        <DataModelSetup />

      </Paper>
      <Box sx={styles.mainContent}>
        <Typography variant="h4" gutterBottom sx={styles.header}>
          GLoVE: Global Visual Explanations
        </Typography>
        <Tabs value={selectedTab} onChange={handleTabChange} centered>
          <Tab label="Data Exploration" />
          <Tab label="GLoVE Analysis" />
        </Tabs>
        {selectedTab === 0 && (
          <Box>
            {glanceState.datasetLoading && (
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
            )}          {glanceState.loadDatasetAndModelResult && !glanceState.datasetLoading && (
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={viewOption === "affected"}
                      onChange={(e) => setViewOption(e.target.checked ? "affected" : "test")}
                      color="primary"
                    />
                  }
                  label="Show Only Affected"
                />


                {viewOption === "data" && glanceState.loadDatasetAndModelResult.data && (
                  <>
                    <DataTable title="Raw Data" data={glanceState.loadDatasetAndModelResult.data} showArrow={false} />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showUMAPScatter}
                          onChange={(e) => setShowUMAPScatter(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Enable Dimensionality Reduction (UMAP)"
                    />
                    {renderScatterPlot()}
                  </>
                )}
                {viewOption === "affected" && glanceState.loadDatasetAndModelResult.affected && (
                  <>
                    <WorkflowCard title="Affected Data" description="Instances from the test dataset where the model's prediction was equal to 0.">
                      <DataTable title="Affected Test Data" data={glanceState.loadDatasetAndModelResult.affected} showArrow={false} />
                    </WorkflowCard>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showUMAPScatter}
                          onChange={(e) => setShowUMAPScatter(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Enable Dimensionality Reduction (UMAP)"
                    />
                    {renderScatterPlot()}
                  </>
                )}
                {viewOption === "test" && glanceState.loadDatasetAndModelResult.X_test && (
                  <>
                    <WorkflowCard title="Test Data" description="A subset of the dataset set aside during the train-test split, used to evaluate the performance of the trained ML model on unseen data.">
                      <DataTable title="Test Data" data={glanceState.loadDatasetAndModelResult.X_test} showArrow={false} />
                    </WorkflowCard>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showUMAPScatter}
                          onChange={(e) => setShowUMAPScatter(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Enable Dimensionality Reduction (UMAP)"
                    />
                    {renderScatterPlot()}
                  </>
                )}
              </Box>
            )}
          </Box>
        )}

       

        {selectedTab === 1 && (

          <>
            {glanceState.datasetLoading && <CircularProgress />}
            {/* <ComparativeAnalysis/> */}

            <ComparativeGlance
              availableCfMethods={glanceState.availableCfMethods}
              availableActionStrategies={glanceState.availableActionStrategies}
              availableFeatures={glanceState.availableFeatures.slice(0, -1)}
            />

          </>

        )}

      </Box>
    </Box>
  );
};

export default GlanceComponent;
