import React from "react"
import { Grid } from "@mui/material"
import UmapScatterGlance from "./PLOTS/UmapScatterGlance"
import LastUmap from "./LastUmap"
import WorkflowCard from "../../../shared/components/workflow-card"

interface UmapGlanceComponentProps {
  applied_aff_data: any
  aff_data: any
  actions: any
}

const UmapGlanceComponent: React.FC<UmapGlanceComponentProps> = ({
  applied_aff_data,
  aff_data,
  actions,
}) => {
  return (
    <>
          
            <UmapScatterGlance
              data={aff_data["affectedData"].reduced_data}
              color=""
              actions={applied_aff_data.reduced_data.Chosen_Action}
              name="Affected population"
              otherdata={applied_aff_data.reduced_data}
            />
      

      <LastUmap
        data={aff_data["affectedData"].reduced_data}
        actions={Object.keys(actions)
          .filter(key => /^Action\d+_Prediction$/.test(key))
          .map(key => {
            const number = parseInt(key.match(/\d+/)?.[0] || "", 10)
            return { key, value: actions[key], number }
          })}
      />
    </>
  )
}

export default UmapGlanceComponent
