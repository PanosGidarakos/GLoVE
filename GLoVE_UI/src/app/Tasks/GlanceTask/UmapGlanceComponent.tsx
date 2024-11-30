import React from "react";
import { Box, Grid } from "@mui/material";
import UmapScatterGlance from "./PLOTS/UmapScatterGlance";
import LastUmap from "./LastUmap";
import WorkflowCard from "../../../shared/components/workflow-card";

interface UmapGlanceComponentProps {
  data:any;
  actions:any;
  eff_cost_actions:any;
}

const UmapGlanceComponent: React.FC<UmapGlanceComponentProps> = ({ data,actions ,eff_cost_actions}) => {


  return (
  <>
         <WorkflowCard title="General title" description="des" >

  
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <WorkflowCard title="title" description="des" >
          <UmapScatterGlance
          data={data["affectedData"].reduced_data}
          color=""
          actions={data["appliedAffected"].reduced_data.Chosen_Action}
          name="Affected population"
          />
        </WorkflowCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <WorkflowCard title="title" description="des" >
          <UmapScatterGlance
          data={data["appliedAffected"].reduced_data}
          color=""
          actions={data["appliedAffected"].reduced_data.Chosen_Action}
          name="Affected population after Actions Applied"
          />
        </WorkflowCard>
      </Grid>
    </Grid>
  </WorkflowCard>
      
    
      
      
<LastUmap 
data={data["affectedData"].reduced_data} 
actions={Object.keys(actions)
  .filter(key => /^Action\d+_Prediction$/.test(key)) 
  .map(key => {
    const number = parseInt(key.match(/\d+/)?.[0] || '', 10);
    return { key, value: actions[key], number }; 
  })}
  name={"Affected with Actions Label"}
  eff_cost_actions={eff_cost_actions}
  />
</>
  );
};

export default UmapGlanceComponent;
