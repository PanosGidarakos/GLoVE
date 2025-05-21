import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import ActionsTable from "./ActionsTable"
import ResponsiveCardTable from "../../../../shared/components/responsive-card-table"
import Card from "@mui/material/Card"
import Stack from "@mui/material/Stack"
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import LinearProgress from "@mui/material/LinearProgress"

interface MetricSummaryProps {
  cost: number
  eff: number
  actions: any
  instances: any
  eff_cost_actions: any
}

const MetricSummary: React.FC<MetricSummaryProps> = ({
  cost,
  eff,
  actions,
  instances,
  eff_cost_actions,
}) => {
  const counts: { [key: string]: number } = {}
  for (const key in instances) {
    const value = instances[key]
    counts[value] = (counts[value] || 0) + 1
  }

  const actionsWithAction = actions.map((item: any, index: number) => ({
    Action: index + 1,
    Population: counts[index + 1] || 0, // Add count for the current action
    ...Object.fromEntries(
      Object.entries(item).map(([key, value]) =>
        typeof value === "number"
          ? [key, Math.round(value * 100) / 100]
          : [key, value],
      ),
    ),
  }))

  if (cost == null || eff == null) {
    return <Typography>No data available</Typography>
  }

  return (
    <ResponsiveCardTable
      title={"Metric Summary"}
      details={
        "Total Effectiveness: is the percentage of individuals that achieve the favorable outcome, if each one of the final actions is applied to the whole affected population. Total Cost: is calculated as the mean recourse cost of the whole set of final actions over the entire population."
      }
    >
      <Box sx={{ minWidth: "300px" }}>
        <Stack direction="row" spacing={2} padding={2}>
          <Card
            sx={{
              flex: 1,
              padding: 1,
              borderRadius: 3,
              background: "linear-gradient(135deg, #f3f4f6, #e0e7ff)",
              boxShadow: 3,
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <AttachMoneyIcon color="primary" />
              <Typography fontWeight={600}>Total Cost:</Typography>
              <Typography variant="h6">{cost}</Typography>
            </Box>
          </Card>

          <Card
            sx={{
              flex: 1,
              padding: 1,
              borderRadius: 3,
              background: "linear-gradient(135deg, #d7f5d1, #a2d57a)",
              boxShadow: 3,
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <CheckCircleIcon color="success" />
              <Typography fontWeight={600}>Total Effectiveness:</Typography>
              <Typography variant="h6">{(eff * 100).toFixed(2)}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={eff * 100}
              sx={{ mt: 1, borderRadius: 1, height: 8 }}
            />
          </Card>
        </Stack>
      </Box>

      <ActionsTable
        data={actionsWithAction}
        showArrow={true}
        eff_cost_actions={eff_cost_actions}
        title={""}
      />
    </ResponsiveCardTable>
  )
}

export default MetricSummary
