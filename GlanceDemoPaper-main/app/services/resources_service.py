import pandas as pd
from methods.globe_ce.datasets import dataset_loader
import pickle
import numpy as np
# This file holds the logic for fetching datasets and models
# In real usage, you would replace this with actual logic, like reading from a database

def get_available_datasets():
    # Simulate dataset retrieval
    print("Fetching available Datasets")
    return ["COMPAS Dataset", "Default Credit Dataset", "German Credit Dataset", "Heloc Dataset"]

def get_available_models():
    # Simulate model retrieval
    print("Fetching available Models")
    return ["XGBoost", "DNN", "LogisticRegression"]


def load_dataset_and_model(dataset_name, model_name):

    from methods.glance.utils.utils_data import preprocess_datasets, load_models
    print("Loading Datasets and Models")
    # Load the dataset and model
    train_dataset, data, X_train, y_train, X_test, y_test, affected, _unaffected, model, feat_to_vary, target_name ,num_features, cate_features= (
        preprocess_datasets(dataset_name, load_models(dataset_name, model_name), model_name)
    )
    predictions = model.predict(X_test)
    X_test['label'] = predictions

    return train_dataset, data, X_train, y_train, X_test, y_test, affected, _unaffected, model, feat_to_vary, target_name, num_features, cate_features

def reverse_one_hot(data_oh):
    """
    Reverse one-hot encoding to get the original categorical values.
    
    Input: 
        data_oh (one-hot encoded DataFrame)
    
    Output: 
        data_original (DataFrame in its original form)
    """
    data_decoded = pd.DataFrame()
    
    # Identify categorical columns (columns with ' = ' in their name)
    categorical_features = set(col.split(" = ")[0] for col in data_oh.columns if " = " in col)
    
    for feature in categorical_features:
        # Get columns corresponding to the feature
        cols = [col for col in data_oh.columns if col.startswith(feature + " = ")]
        
        # Get the original category by finding the column with a value of 1
        data_decoded[feature] = data_oh[cols].idxmax(axis=1).str.split(" = ").str[1]
    
    # Include numerical columns
    numerical_columns = [col for col in data_oh.columns if " = " not in col]
    data_decoded[numerical_columns] = data_oh[numerical_columns]
    
    return data_decoded

def load_dataset_and_model_globece(dataset_name,model_name):
        
    dataset = dataset_loader(dataset_name, dropped_features=[], n_bins=None)
    x_train, y_train, x_test, y_test, x_means, x_std = dataset.get_split(normalise=False, shuffle=False,
                                                                     return_mean_std=True)
    
    if model_name == 'dnn':
        from models import dnn_normalisers as normalisers
    elif model_name == 'lr':
        from models import lr_normalisers as normalisers
    else:  # no xgb normalisation
        normalisers = {dataset_name: False}
    with open('models/{}_{}.pkl'.format(dataset_name, model_name), 'rb') as f:
        B = pickle.load(f)
    normalise = [x_means, x_std] if normalisers[dataset_name] else None

    X_test = pd.DataFrame(x_test)
    X_test.columns = dataset.features[:-1]

    return dataset , X_test, B, normalise


def round_categorical(cf,features,features_tree):
        """
        This function is used after the optimization to compute the actual counterfactual
        Currently not implemented for optimization: argmax will likely break gradient descent
        
        Input: counterfactuals computed using x_aff + global translation
        Output: valid counterfactuals where one_hot encodings are integers (0 or 1), not floats
        """
        ret = np.zeros(cf.shape)
        i = 0
        for feature in features:  # requires list to maintain correct order
            if not features_tree[feature]:
                ret[:, i] = cf[:, i]
                i += 1
            else:
                n = len(features_tree[feature])
                ret[np.arange(ret.shape[0]), i+np.argmax(cf[:, i:i+n], axis=1)] = 1
                i += n
        return ret