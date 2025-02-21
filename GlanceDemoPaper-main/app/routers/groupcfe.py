from fastapi import APIRouter, HTTPException
import logging
from app.config import shared_resources
logging.basicConfig(level=logging.DEBUG)
from app.services.resources_service import load_dataset_and_model
from methods.glance.iterative_merges.iterative_merges import C_GLANCE
from typing import List, Optional
from raiutils.exceptions import UserConfigValidationException
from methods.groupcfe.group_cfe import cumulative
import pandas as pd
import numpy as np
import redis
import json
from methods.glance.counterfactual_costs import build_dist_func_dataframe

router = APIRouter()

rd = redis.Redis(host="localhost", port=6379, db=0)

@router.post("/run-groupcfe", summary="Run GroupCFE")
async def run_groupcfe(gcf_size: int, features_to_change: Optional[List[str]] = None):
    cache_key = f"run-groupcfe:{shared_resources['dataset_name']}:{shared_resources['model_name']}:{gcf_size}"
    cache = rd.get(cache_key)
    if cache:
        print("Cache hit")
        cache_res = json.loads(cache)
        shared_resources["method"] = cache_res["method"]
        shared_resources["clusters_res"] = {
            int(k): {  # Ensure key is Python int
            "action": pd.Series(v["action"]),
            "effectiveness": v["effectiveness"],
            "cost": v["cost"],
        }
        for k, v in cache_res["clusters_res"].items()}
        shared_resources["affected"] = pd.DataFrame(cache_res["affected"])
        shared_resources["affected_clusters"] = pd.DataFrame(cache_res["affected_clusters"])\

        # Change numeric columns to int32 for affected
        numeric_cols_affected = shared_resources["affected"].select_dtypes(include=["number"]).columns
        shared_resources["affected"][numeric_cols_affected] = shared_resources["affected"][numeric_cols_affected].astype("int32")

        # Change numeric columns to int32 for affected_clusters
        numeric_cols_affected_clusters = shared_resources["affected_clusters"].select_dtypes(include=["number"]).columns
        shared_resources["affected_clusters"][numeric_cols_affected_clusters] = shared_resources["affected_clusters"][numeric_cols_affected_clusters].astype("int32")
        # shared_resources["affected_clusters"]['Chosen_Action'] = shared_resources["affected_clusters"]['Chosen_Action'].astype('int64')
        return {"actions": cache_res['actions'],
                    "TotalEffectiveness": cache_res['TotalEffectiveness'],
                    "TotalCost": cache_res['TotalCost'],
                    "affected_clusters": shared_resources["affected_clusters"].to_dict(),
                    "eff_cost_actions": cache_res['eff_cost_actions']} 
    else:
        from methods.groupcfe.group_cfe import Group_CF
        print(f"Cache key {cache_key} does not exist - Running GroupCFE Algorithm")    
        shared_resources["method"] = 'groupcfe'    
        data = shared_resources.get("data").copy(deep=True)
        X_test = shared_resources.get("X_test").copy(deep=True)
        affected = shared_resources.get("affected").copy(deep=True)
        model = shared_resources.get("model")
        target_name = shared_resources.get("target_name")
        train_dataset = shared_resources.get("train_dataset")
        _unaffected = shared_resources.get("_unaffected")
        
        num_features = X_test.drop(columns='label')._get_numeric_data().columns.to_list()
        cate_features = X_test.drop(columns='label').columns.difference(num_features)
        features = data.columns.to_list()
        features.remove(target_name)
        feat_to_vary = features_to_change if features_to_change else features
        X_test.rename(columns={"label": "target"},inplace=True)

        group_cfe = Group_CF(
            model = model,
            data = data,
            train_dataset = X_test,
            affected = affected.drop(columns='index'),
            unaffected = _unaffected,
            numerical_features = num_features,
            categorical_features = cate_features,
            target = target_name,
            feat_to_vary = feat_to_vary,
            clusters=gcf_size,
            sample_size_gcfe_pairs = 50
        )
        best_cfs,effs,costs,_,_,_, _, _ = group_cfe.explain_group()

        counterfactual_dict = {
            i + 1: {
                "action": action,
                "effectiveness": effectiveness,
                "cost": cost
            }
            for i, (action, effectiveness, cost) in enumerate(zip(best_cfs, effs, costs))
        }
        sorted_actions_dict = dict(sorted(counterfactual_dict.items(), key=lambda item: item[1]['cost']))
        actions = [stats["action"] for i,stats in sorted_actions_dict.items()]
        dist_func_dataframe = build_dist_func_dataframe(
                X=data.drop(columns=target_name),
                numerical_columns=num_features,
                categorical_columns=cate_features,
            )
        total_eff, total_cost,pred_list, chosen_actions, costs_list = cumulative(affected.drop(columns='index'), actions, model,dist_func_dataframe)

        eff_cost_actions = {}
        affected_clusters = affected.copy(deep=True)
        for i, arr in pred_list.items():
            column_name = f"Action{i}_Prediction"
            affected_clusters[column_name] = arr
            eff_act = pred_list[i].sum()/len(affected)
            cost_act = costs_list[i-1][costs_list[i-1] != np.inf].sum()/pred_list[i].sum()
            eff_cost_actions[i] = {'eff':eff_act , 'cost':cost_act}

        affected_clusters['Chosen_Action'] = chosen_actions
        affected_clusters['Chosen_Action'] = affected_clusters['Chosen_Action'] + 1
        affected_clusters = affected_clusters.replace(np.inf , '-')

        filtered_data = {
                k: {
                    **{
                        'action': {ak: av for ak, av in v['action'].items() if av != '-'}
                    },
                    **{kk: vv for kk, vv in v.items() if kk != 'action'}
                }
                for k, v in sorted_actions_dict.items()
            }
        actions_returned  = [stats["action"] for i,stats in filtered_data.items()]
        shared_resources['affected_clusters'] = affected_clusters
        serialized_clusters_res = {
            int(k): {  # Convert key to Python int
                "action": v["action"].to_dict(),
                "effectiveness": v["effectiveness"],
                "cost": v["cost"],
            }
            for k, v in counterfactual_dict.items()
        }
        shared_resources["clusters_res"] = serialized_clusters_res

        cache_ret = {
            "method" : 'groupcfe',
            "actions": actions_returned,
            "clusters_res": serialized_clusters_res,
            "affected": affected.to_dict(orient='records'),
            "TotalEffectiveness": round(total_eff,2),
            "TotalCost": round(total_cost,2),
            "affected_clusters": affected_clusters.to_dict(orient='records'),
            "eff_cost_actions": eff_cost_actions} 
        
        rd.set(cache_key,json.dumps(cache_ret), ex=3600)
        return {"actions": actions_returned,
                "TotalEffectiveness": round(total_eff,3),
                "TotalCost": round(total_cost,2),
                "affected_clusters": affected_clusters.to_dict(),
                "eff_cost_actions": eff_cost_actions} 


