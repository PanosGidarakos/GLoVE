import React, {useState } from "react";
import { useAppSelector, useAppDispatch } from "../../../../store/store";
import { fetchAvailableFeatures, loadDatasetAndModel } from "../../../../store/slices/glanceSlice";
import { 
  Select, MenuItem, Box, FormControl, InputLabel, 
  OutlinedInput, IconButton, Typography, CircularProgress, 
  Tooltip, SelectChangeEvent, Modal, Button, TextField 
} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';

const DataModelSetup: React.FC = () => {
  const dispatch = useAppDispatch();
  const availableResources = useAppSelector((state) => state.glance.availableResources);
  const datasetLoading = useAppSelector((state) => state.glance.datasetLoading);
  const [selectedDataset, setSelectedDataset] = useState<string>("COMPAS Dataset");
  const [selectedModel, setSelectedModel] = useState<string>("XGBoost");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [newDatasetFile, setNewDatasetFile] = useState<File | null>(null);
  const [newTestDatasetFile, setNewTestDatasetFile] = useState<File | null>(null);
  const [newModelFile, setNewModelFile] = useState<File | null>(null);
  const [newTargetLabel, setNewTargetLabel] = useState<string>("");


  const datasetMap: { [key: string]: string } = {
    "COMPAS Dataset": "compas",
    "Default Credit Dataset": "default_credit",
    "German Credit Dataset": "german_credit",
    "Heloc Dataset": "heloc",
  };

  const modelMap: { [key: string]: string } = {
    "XGBoost": "xgb",
    "DNN": "dnn",
    "LogisticRegression": "lr",
  };

  const handleLoad = (newDataset: string, newModel: string) => {
    if (newDataset && newModel) {
      const datasetParam = datasetMap[newDataset];
      const modelParam = modelMap[newModel];

      dispatch(loadDatasetAndModel({ dataset_name: datasetParam, model_name: modelParam }))
        .unwrap()
        .then(() => {
          dispatch(fetchAvailableFeatures());
        })
        .catch((err) => {
          console.error("Failed to load dataset and model:", err);
        });
    }
  };

  const handleDatasetChange = (e: SelectChangeEvent<string>) => {
    const newDataset = e.target.value as string;
    if (newDataset === "Upload a new dataset…") {
      setIsUploadModalOpen(true);
    } else {
      setSelectedDataset(newDataset);
      handleLoad(newDataset, selectedModel);
    }
  };

  const handleModelChange = (e: SelectChangeEvent<string>) => {
    const newModel = e.target.value as string;
    setSelectedModel(newModel);
    handleLoad(selectedDataset, newModel);
  };

 
  const handleUploadSubmit = () => {
    // Implement logic to handle new dataset, test dataset, and model upload
    console.log("New Dataset File:", newDatasetFile);
    console.log("New Test Dataset File:", newTestDatasetFile);
    console.log("New Model File:", newModelFile);
    console.log("New Target Label:", newTargetLabel);

    // Close the modal after submission
    setIsUploadModalOpen(false);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">Dataset & Model Selection</Typography>
        <Tooltip title="This section allows you to select a dataset and model for analysis.">
          <IconButton>
            {datasetLoading ? <CircularProgress size={24} /> : <InfoIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <FormControl fullWidth>
        <InputLabel id="dataset-select-label">Select Dataset</InputLabel>
        <Box display="flex" alignItems="center" gap={1}>
          <Select
            labelId="dataset-select-label"
            value={selectedDataset}
            input={<OutlinedInput label="Select Dataset" />}
            onChange={handleDatasetChange}
            displayEmpty
            sx={{ flex: 1 }}
          >
            {availableResources.datasets.map((dataset) => (
              <MenuItem key={dataset} value={dataset}>{dataset}</MenuItem>
            ))}
            <MenuItem value="Upload a new dataset…" divider>
              <em>Upload a new dataset…</em>
            </MenuItem>
          </Select>
        </Box>
      </FormControl>

      {/* Modal for uploading a new dataset */}
      <Modal
        open={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      >
        <Box sx={{ ...styles.modalStyle }}>
          <Typography variant="h6">Upload New Dataset</Typography>
          <Box mt={2}>
            <Typography variant="body1">Dataset File</Typography>
            <TextField
              fullWidth
              type="file"
              onChange={(e) => setNewDatasetFile((e.target as HTMLInputElement).files?.[0] || null)}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box mt={2}>
            <Typography variant="body1">Test Dataset File</Typography>
            <TextField
              fullWidth
              type="file"
              onChange={(e) => setNewTestDatasetFile((e.target as HTMLInputElement).files?.[0] || null)}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box mt={2}>
            <Typography variant="body1">Model File</Typography>
            <TextField
              fullWidth
              type="file"
              onChange={(e) => setNewModelFile((e.target as HTMLInputElement).files?.[0] || null)}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box mt={2}>
            <Typography variant="body1">Target Label</Typography>
            <TextField
              fullWidth
              label="Target Label"
              value={newTargetLabel}
              onChange={(e) => setNewTargetLabel(e.target.value)}
              margin="normal"
            />
          </Box>
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleUploadSubmit}>Upload</Button>
          </Box>
        </Box>
      </Modal>

      <FormControl fullWidth>
        <InputLabel id="model-select-label">Select Model</InputLabel>
        <Select
          labelId="model-select-label"
          input={<OutlinedInput label="Select Model" />}
          value={selectedModel}
          onChange={handleModelChange}
          displayEmpty
          sx={{ width: '100%' }}
        >
          {availableResources.models.map((model) => (
            <MenuItem key={model} value={model}>{model}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

// Example styles for modal
const styles = {
  modalStyle: {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  },
};

export default DataModelSetup;
