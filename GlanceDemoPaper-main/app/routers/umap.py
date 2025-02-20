from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import pandas as pd
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from app.config import shared_resources, dataset_identifiers
import umap
router = APIRouter()
 
class UMAPRequest(BaseModel):
    dataset_identifier: str
 
@router.post("/umap-reduce/", summary="Perform UMAP Dimensionality Reduction")
async def umap_reduce(request: UMAPRequest, n_components: int = 2):
    
    import logging
    numba_logger = logging.getLogger('numba')
    numba_logger.setLevel(logging.WARNING)
    try:
        dataset_key = dataset_identifiers.get(request.dataset_identifier)
        if not dataset_key:
            raise HTTPException(status_code=400, detail="Invalid dataset identifier.")
 
        request_data = shared_resources[dataset_key].copy(deep=True)
        print(request_data)
        data_all = shared_resources["data"]
        print(data_all)
        feat = data_all.columns.to_list()
        target_name = shared_resources["target_name"]
        feat.remove(target_name)
        data = request_data.reindex(columns=feat, fill_value=0)
        print(data)
        numeric_columns = data.select_dtypes(include="number").columns.to_list()
        categorical_columns = data.columns.difference(numeric_columns)
        
        if shared_resources.get("method") == 'globece':
            if shared_resources.get("preprocess_pipeline_globece") is None:
                preprocess = ColumnTransformer(
                    transformers=[
                        ("num", StandardScaler(), numeric_columns),
                        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_columns)
                    ]
                )
                preprocessed_data = preprocess.fit_transform(data)
                shared_resources["preprocess_pipeline_globece"] = preprocess
            else:
                preprocess = shared_resources["preprocess_pipeline_globece"]
                preprocessed_data = preprocess.transform(data)
    
            if shared_resources.get("umap_model_globece") is None:
                logging.warning("UMAP model not found in shared_resources. Initializing a new model.")
                umap_model = umap.UMAP(n_components=n_components, random_state=42)
                umap_model.fit(preprocessed_data)
                shared_resources["umap_model_globece"] = umap_model
            else:
                logging.info("Using previously fitted UMAP model.")
                umap_model = shared_resources["umap_model_globece"]

            reduced_data = umap_model.transform(preprocessed_data)
            print(reduced_data)
            logging.debug("UMAP reduction completed.")

            # Convert the result to a list of lists for JSON serialization
            if dataset_key == 'X_test':
                umap_data = pd.DataFrame(reduced_data)
                label = request_data.columns.to_list()[-1]
                umap_data['label'] = request_data[label]
            elif dataset_key == 'affected':
                umap_data = pd.DataFrame(reduced_data)
            elif dataset_key == 'applied_affected':
                print(request_data.Chosen_Action)
                umap_data = pd.DataFrame(reduced_data)
                print(umap_data)
                umap_data['Chosen_Action'] = request_data.Chosen_Action
            elif dataset_key =='data':
                umap_data = pd.DataFrame(reduced_data)
                umap_data['label'] = request_data[target_name]
            return {"reduced_data": umap_data.to_dict()}
        else:
            if shared_resources.get("preprocess_pipeline") is None:
                preprocess = ColumnTransformer(
                    transformers=[
                        ("num", StandardScaler(), numeric_columns),
                        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_columns)
                    ]
                )
                preprocessed_data = preprocess.fit_transform(data)
                shared_resources["preprocess_pipeline"] = preprocess
            else:
                preprocess = shared_resources["preprocess_pipeline"]
                preprocessed_data = preprocess.transform(data)
    
            if shared_resources.get("umap_model") is None:
                logging.warning("UMAP model not found in shared_resources. Initializing a new model.")
                umap_model = umap.UMAP(n_components=n_components, random_state=42)
                umap_model.fit(preprocessed_data)
                shared_resources["umap_model"] = umap_model
            else:
                logging.info("Using previously fitted UMAP model.")
                umap_model = shared_resources["umap_model"]

            reduced_data = umap_model.transform(preprocessed_data)
            logging.debug("UMAP reduction completed.")

            # Convert the result to a list of lists for JSON serialization
            if dataset_key == 'X_test':
                umap_data = pd.DataFrame(reduced_data)
                label = request_data.columns.to_list()[-1]
                umap_data['label'] = request_data[label]
            elif dataset_key == 'affected':
                umap_data = pd.DataFrame(reduced_data)
            elif dataset_key == 'applied_affected':
                print(request_data.Chosen_Action)
                umap_data = pd.DataFrame(reduced_data)
                umap_data['Chosen_Action'] = request_data.Chosen_Action
            elif dataset_key =='data':
                umap_data = pd.DataFrame(reduced_data)
                umap_data['label'] = request_data[target_name]
            return {"reduced_data": umap_data.to_dict()}

    except Exception as e:
        logging.error(f"Error during UMAP reduction: {e}")
        raise HTTPException(status_code=500, detail=str(e))