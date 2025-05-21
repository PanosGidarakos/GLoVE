import type React from "react"
import { useState } from "react"
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material"
import ResponsiveCardVegaLite from "../../../../shared/components/responsive-card-vegalite"
import {
  getAnalyzeCounterFactualsUmapApplyActionChartSpec,
  getAnalyzeCounterFactualsUmapSharedLegendChartSpec,
} from "../Plots/chartSpecs"

interface UmapGlanceComponentProps {
  applied_aff_data: any
  aff_data: any
  actions: any
}

const reshapeData = (
  inputData: Record<string, any>,
  actions: string[] | null,
) =>
  Object.keys(inputData?.[Object.keys(inputData)[0]] || {})
    .map((_, index) => {
      return Object.keys(inputData).reduce(
        (acc, key) => {
          acc[key] = inputData[key][index]
          return acc
        },
        {} as Record<string, any>,
      )
    })
    .map((item, index) => ({
      ...item,
      Chosen_Action: actions?.[index] ?? "-",
    }))

const UmapGlanceComponent: React.FC<UmapGlanceComponentProps> = ({
  applied_aff_data,
  aff_data,
  actions,
}) => {
  const reshapedData = reshapeData(
    aff_data["affectedData"].reduced_data,
    applied_aff_data.reduced_data.Chosen_Action,
  )
  const reshapedOtherData = reshapeData(
    applied_aff_data.reduced_data,
    applied_aff_data.reduced_data.Chosen_Action,
  )
  const scatterPlotTitles = ["Action Selection", "Post-Action Selection"]

  const [selectedAction, setSelectedAction] =
    useState<string>("Action1_Prediction")
    
  const formattedData = Object.keys(
    aff_data["affectedData"].reduced_data[0],
  ).map(key => ({
    x: aff_data["affectedData"].reduced_data[0][key], // First dimension (e.g., X-axis)
    y: aff_data["affectedData"].reduced_data[1][key], // Second dimension (e.g., Y-axis)
    [selectedAction]: Object.keys(actions)
      .filter(key => /^Action\d+_Prediction$/.test(key))
      .map(key => {
        const number = parseInt(key.match(/\d+/)?.[0] || "", 10)
        return { key, value: actions[key], number }
      })
      .find((action: any) => action.key === selectedAction)?.value[key],
  }))

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedAction(event.target.value as string)
  }

  const spec = {
    description: "Two scatter plots with a shared legend",
    hconcat: [reshapedData, reshapedOtherData].map((data, index) =>
      getAnalyzeCounterFactualsUmapSharedLegendChartSpec(
        data,
        scatterPlotTitles[index],
      ),
    ),
  }

  const specLast = getAnalyzeCounterFactualsUmapApplyActionChartSpec(
    formattedData,
    selectedAction,
  )

  return (
    <>
      <ResponsiveCardVegaLite spec={spec} actions={false} />

      <ResponsiveCardVegaLite
        spec={specLast}
        actions={false}
        controlPanel={
          <Box display="flex" justifyContent="center" gap={2}>
            <FormControl
              fullWidth
              margin="normal"
              style={{ minWidth: 200, marginRight: "20px" }}
            >
              <InputLabel id="select-action-label">Apply</InputLabel>
              <Select
                labelId="select-action-label"
                value={selectedAction}
                onChange={handleChange}
                label="Apply"
              >
                {Object.keys(actions)
                  .filter(key => /^Action\d+_Prediction$/.test(key))
                  .map(key => {
                    const number = parseInt(key.match(/\d+/)?.[0] || "", 10)
                    return { key, value: actions[key], number }
                  })
                  .map((action: any) => {
                    // Extract the number from the key dynamically
                    const displayText = action.key.replace(
                      /^Action(\d+)_Prediction$/,
                      "Action$1",
                    )

                    return (
                      <MenuItem key={action.key} value={action.key}>
                        {displayText}
                      </MenuItem>
                    )
                  })}
              </Select>
            </FormControl>
          </Box>
        }
      />
    </>
  )
}

export default UmapGlanceComponent
