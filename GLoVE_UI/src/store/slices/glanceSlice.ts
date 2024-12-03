// src/store/glanceSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// Define types for the API responses

interface GlanceState {
  welcomeMessage: string;

  availableResources: AvailableResources;
  availableCfMethods: string[];
  availableFeatures: string[];
  availableActionStrategies: string[];
  selectedFeatures: string[];   // Store selected features
  runGlanceResult: any | null;
  loadDatasetAndModelResult: any | null;
  runTGlanceResult: any | null;
  loading: boolean;
  datasetLoading: boolean; // Specific loading state for dataset/model loading

  error: string | null;
  initialLoading: boolean;
  comparativeResults: {
    [key: string]: any;
  };
 


  applyAffectedActionsResult: { [key: string]: any } | null; 
  processedSizes: number[]; 
  umapReduceResults: {
    rawData?: any;
    affectedData?: any;
    testData?: any;
    appliedAffected?: any;
    
  };
    
  getDataResults:any | null;

}



// Define initial state with typed structure
const initialState: GlanceState = {
  availableResources: { datasets: [], models: [] },
  availableCfMethods: [],
  welcomeMessage: "",
  availableFeatures: [],
  selectedFeatures: [],
  availableActionStrategies: [],
  runGlanceResult: null,
  loadDatasetAndModelResult: null,
  runTGlanceResult: null,
  loading: false,
  datasetLoading: false, // Specific loading state for dataset/model loading

  error: null,
  initialLoading: true,

  applyAffectedActionsResult:null,
  processedSizes: [],
  umapReduceResults: {},
  getDataResults:null,
  comparativeResults:{}



};

interface AvailableResources {
  datasets: string[];
  models: string[];
}

interface UmapReduceParams {
  dataset_identifier: string;
  n_components: number;
}

interface ComparativeParams {
  sizes?: number[];
  methods?: string[];
  strategies?: string[];
  selectedFeatures?: string[];
}

// Type for the runCGlance parameters
interface RunCGlanceParams {
    gcf_size: number;
    cf_method: string;
    action_choice_strategy: string;
    selected_features?: string[]; // Optional array of selected features
  }
// Type for the loadDatasetAndModel parameters
interface LoadDatasetAndModelParams {
  dataset_name: string;
  model_name: string;
}

// Type for the runTGlance parameters
interface RunTGlanceParams {
  split_features: string[];
  local_cf_method: string;
}
const API_BASE_URL="http://glove.imsi.athenarc.gr:8000/";
// Fetch all initial data
export const fetchInitialGlanceData = createAsyncThunk(
  "glance/fetchInitialGlanceData",
  async () => {
    const [resourcesResponse, cfMethodsResponse, welcomeMessageResponse,actionsStrategiesResponse,loadDatasetAndModelResponse,loadGetDataResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}available-resources/`),
      axios.get(`${API_BASE_URL}available-cf-methods/`),
      axios.get(`${API_BASE_URL}`),

      axios.get(`${API_BASE_URL}available-action-strategies/`),
      axios.post(`${API_BASE_URL}load-dataset-and-model/?dataset_name=compas&model_name=xgb`)

    ]);

    return {
      availableResources: resourcesResponse.data,
      availableCfMethods: cfMethodsResponse.data,
      welcomeMessage: welcomeMessageResponse.data,
      availableActionStrategies:actionsStrategiesResponse.data,
      loadDatasetAndModelResult: loadDatasetAndModelResponse.data,
      // getDataResults:loadGetDataResponse.data
      // runCGlanceResult: GlanceResponse.data

    };
  }
);

export const umapReduce = createAsyncThunk(
  "glance/umapReduce",
  async ({ dataset_identifier, n_components }: UmapReduceParams) => {
    const response = await axios.post(
      `${API_BASE_URL}umap-reduce/`,
      { dataset_identifier },
      {
        params: { n_components },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return { data: response.data, datasetIdentifier: dataset_identifier }; // Pass data and identifier
  }
);

// Define a thunk for runCGlance with parameters
export const runCGlance = createAsyncThunk(
    "glance/runCGlance",
    async ({ gcf_size, cf_method, action_choice_strategy, selected_features }: RunCGlanceParams) => {
      const response = await axios.post(
        `${API_BASE_URL}run-c_glance`,
        selected_features?.length ? selected_features : null, // Pass selected features or null
        {
          params: {
            gcf_size,
            cf_method,
            action_choice_strategy,
          },
        }
      );
      // console.log(response);
      return { data: response.data, size: gcf_size.toString(), method: cf_method, strategy: action_choice_strategy }; // Return data and use size as key for simplicity
    }
  );
// Define a thunk for loadDatasetAndModel with query parameters
export const loadDatasetAndModel = createAsyncThunk(
  "glance/loadDatasetAndModel",
  async ({ dataset_name, model_name }: LoadDatasetAndModelParams) => {
    const response = await axios.post(`${API_BASE_URL}load-dataset-and-model/`, null, {
      params: { dataset_name, model_name }
    });
    return response.data;
  }
);

// Define a thunk for fetching available features
export const fetchAvailableFeatures = createAsyncThunk(
  "glance/fetchAvailableFeatures",
  async () => {
    const response = await axios.get(`${API_BASE_URL}available-features`);
    return response.data;
  }
);

// Define a thunk for running T-Glance with parameters
export const runTGlance = createAsyncThunk(
  "glance/runTGlance",
  async ({ split_features, local_cf_method }: RunTGlanceParams) => {
    const response = await axios.post("http://127.0.0.1:8000/run-t_glance", {
      split_features,
      local_cf_method,
    });
    return response.data;
  }
);

export const applyAffectedActions = createAsyncThunk(
  "glance/applyAffectedActions",
  async () => {
    const response = await axios.get(`${API_BASE_URL}apply_affected_actions`);
    // console.log(response);
    return response.data;
  }
);

export const uploadDataset = createAsyncThunk(
  "glance/uploadDataset",
  async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API_BASE_URL}upload/dataset`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }
);

// Define a thunk for uploading a test dataset
export const uploadTestDataset = createAsyncThunk(
  "glance/uploadTestDataset",
  async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API_BASE_URL}upload/test_dataset`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }
);

// Define a thunk for uploading a model
export const uploadModel = createAsyncThunk(
  "glance/uploadModel",
  async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API_BASE_URL}upload/model`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }
);


export const runCGlanceComparative = createAsyncThunk(
  "glance/runCGlanceComparative",
  async ({ sizes, methods, strategies, selectedFeatures }: ComparativeParams) => {
    const results: any = {};

    if (sizes?.length>=1) {
      // Comparative by size
      for (const size of sizes) {
        const response = await axios.post(
          `${API_BASE_URL}run-c_glance`,
          selectedFeatures?.length ? selectedFeatures : null,
          {
            params: {
              gcf_size: size,
              cf_method: methods?.[0], // Single method
              action_choice_strategy: strategies?.[0], // Single strategy
            },
          }
        );
        results[`size_${size}`] = response.data;
      }
    } else if (methods?.length>=1) {
      // Comparative by method
      for (const method of methods) {
        const response = await axios.post(
          `${API_BASE_URL}run-c_glance`,
          selectedFeatures?.length ? selectedFeatures : null,
          {
            params: {
              gcf_size: sizes?.[0], // Single size
              cf_method: method,
              action_choice_strategy: strategies?.[0],
            },
          }
        );
        results[`method_${method}`] = response.data;
      }
    }else if (strategies?.length>=1) {
      // Comparative by strategy
      for (const strategy of strategies) {
        const response = await axios.post(
          `${API_BASE_URL}run-c_glance`,
          selectedFeatures?.length ? selectedFeatures : null,
          {
            params: {
              gcf_size: sizes?.[0], // Single size
              cf_method: methods?.[0], // Single method
              action_choice_strategy: strategy,
            },
          }
        );
        results[`strategy_${strategy}`] = response.data;
      }
    }

    return results;
  }
);

const glanceSlice = createSlice({
  name: "glance",
  initialState,
  reducers: {
    setSelectedFeatures: (state, action: PayloadAction<string[]>) => {
      state.selectedFeatures = action.payload;
    },
    setProcessedSizes: (state, action: PayloadAction<number[]>) => {
      state.processedSizes = action.payload;
    },
    addProcessedSize: (state, action: PayloadAction<number>) => {
      // Ensures no duplicates are added
      if (!state.processedSizes.includes(action.payload)) {
        state.processedSizes.push(action.payload);
      }
    },
  },
    extraReducers: (builder) => {
    builder
      .addCase(fetchInitialGlanceData.pending, (state) => {
        state.initialLoading = true;
      })
      .addCase(fetchInitialGlanceData.fulfilled, (state, action: PayloadAction<any>) => {
        state.initialLoading = false;
        state.availableResources = action.payload.availableResources;
        state.availableCfMethods = action.payload.availableCfMethods;
        state.welcomeMessage = action.payload.welcomeMessage;
        state.availableActionStrategies = action.payload.availableActionStrategies;
        state.loadDatasetAndModelResult = action.payload.loadDatasetAndModelResult;
        state.runGlanceResult = action.payload.runCGlanceResult || null;
        state.getDataResults = action.payload.getDataResults || null;
      })
      .addCase(runCGlance.rejected, (state, action) => {
        state.loading = false;

        // Handle 400 error for runCGlance
        if (action.error && action.error.response && action.error.response.status === 400) {
          state.error = "No counterfactuals found for the given configuration. Please check your configuration.";
        } else {
          state.error = action.error?.message || "Error generating counterfactuals";
        }
      })
      .addCase(fetchInitialGlanceData.rejected, (state, action) => {
        state.initialLoading = false;
        state.error = action.error.message || "Error fetching initial data";
      })
      .addCase(runCGlance.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadDatasetAndModel.pending, (state) => {
        state.datasetLoading = true;
      })
      .addCase(loadDatasetAndModel.fulfilled, (state, action: PayloadAction<any>) => {
        state.datasetLoading = false;
        state.loadDatasetAndModelResult = action.payload;
        state.runGlanceResult = null;
        state.error = null;
      })
      .addCase(loadDatasetAndModel.rejected, (state, action) => {
        state.datasetLoading = false;
        state.error = action.error.message || "Error loading dataset and model";
      })
      .addCase(fetchAvailableFeatures.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAvailableFeatures.fulfilled, (state, action: PayloadAction<{ features: string[] }>) => {
        state.loading = false;
        state.availableFeatures = action.payload.features;
        state.error = null;
      })
      .addCase(fetchAvailableFeatures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error fetching available features";
      })
      .addCase(runTGlance.fulfilled, (state, action: PayloadAction<any>) => {
        state.runTGlanceResult = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(runTGlance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error running T-Glance";
      })
      .addCase(runCGlance.fulfilled, (state, action: PayloadAction<{
        strategy: any;
        method: any; data: any, size: string 
}>) => {
        state.loading = false;
        state.runGlanceResult = state.datasetLoading ? null : action.payload.data; // Ensure null if datasetLoading is true

        state.error = null;
      })
      .addCase(applyAffectedActions.pending, (state) => {
        state.loading = true;
      })
      .addCase(applyAffectedActions.fulfilled, (state, action: PayloadAction<{ [key: string]: any }>) => {
        state.loading = false;
        state.applyAffectedActionsResult = action.payload; // Store response in state
        state.error = null;
      })
      .addCase(applyAffectedActions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error applying affected actions";
      })
      .addCase(umapReduce.pending, (state) => {
        state.loading = true;
      })
      .addCase(umapReduce.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.umapReduceResults[action.payload.datasetIdentifier] = action.payload.data; // Store result by identifier
        state.error = null;
      })
      .addCase(umapReduce.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error reducing UMAP";
      })
      .addCase(uploadDataset.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadDataset.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // You can store the response if needed
      })
      .addCase(uploadDataset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error uploading dataset";
      })
      .addCase(uploadTestDataset.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadTestDataset.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // You can store the response if needed
      })
      .addCase(uploadTestDataset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error uploading test dataset";
      })
      .addCase(uploadModel.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadModel.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // You can store the response if needed
      })
      .addCase(uploadModel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error uploading model";
      })
      .addCase(runCGlanceComparative.pending, (state) => {
        state.loading = true;
      })
      .addCase(runCGlanceComparative.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.comparativeResults = action.payload;
        state.error = null;
      })
      .addCase(runCGlanceComparative.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error in comparative analysis";
      });
  },
});
export const { setSelectedFeatures} = glanceSlice.actions
export default glanceSlice.reducer;


