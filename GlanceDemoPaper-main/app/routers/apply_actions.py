from fastapi import APIRouter, HTTPException
import logging
from app.config import shared_resources
logging.basicConfig(level=logging.DEBUG)
from app.services.resources_service import load_dataset_and_model
from methods.glance.iterative_merges.iterative_merges import C_GLANCE
from typing import List, Optional
from raiutils.exceptions import UserConfigValidationException
from methods.glance.iterative_merges.iterative_merges import apply_action_pandas,cumulative
import pandas as pd
import numpy as np

router = APIRouter()

@router.get("/apply_affected_actions")
async def apply_affected_actions():
    affected = shared_resources.get("affected")
    affected = affected.drop(columns=['index'])
    clusters_res = shared_resources.get("clusters_res")
    affected_clusters  = shared_resources.get("affected_clusters")
    index = affected_clusters['index']
    affected_clusters = affected_clusters.drop(columns='index')
    sorted_actions_dict = dict(sorted(clusters_res.items(), key=lambda item: item[1]['cost']))
    actions = [stats["action"] for i, stats in sorted_actions_dict.items()]

    num_features = affected._get_numeric_data().columns.to_list()
    cate_features = affected.columns.difference(num_features)
    applied_affected = pd.DataFrame()
    if shared_resources["method"] == "glance":

        for i,val in enumerate(list(affected_clusters.Chosen_Action.unique())):
            aff = affected_clusters[affected_clusters['Chosen_Action'] == val]
            if val != '-':
                applied_df = apply_action_pandas(
                    aff[affected.columns.to_list()],
                    actions[int(val-1)],
                    num_features,
                    cate_features,
                    '-',
                )
                applied_df['Chosen_Action'] = val
                applied_affected = pd.concat([applied_affected,applied_df])
            else:
                aff['Chosen_Action'] = '-'
                cols = affected.columns.to_list()
                cols.append('Chosen_Action')
                applied_affected = pd.concat([applied_affected,aff[cols]])

        applied_affected = applied_affected.sort_index()
        applied_affected['index'] = index
        shared_resources['applied_affected'] = applied_affected
        return applied_affected.to_dict()
    elif shared_resources["method"] == "groupcfe":
        for i,val in enumerate(list(affected_clusters.Chosen_Action.unique())):
            aff = affected_clusters[affected_clusters['Chosen_Action'] == val]
            if val != '-':
                for col, value in actions[int(val) - 1].items():
                    aff[col] = value
                cols = affected.columns.to_list()
                cols.append('Chosen_Action')
                applied_affected = pd.concat([applied_affected,aff[cols]])
            else:
                aff['Chosen_Action'] = '-'
                cols = affected.columns.to_list()
                cols.append('Chosen_Action')
                applied_affected = pd.concat([applied_affected,aff[cols]])

        applied_affected = applied_affected.sort_index()
        applied_affected['index'] = index
        shared_resources['applied_affected'] = applied_affected
        return applied_affected.to_dict()


    