import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";
import { ArrowDropUp, ArrowDropDown } from "@mui/icons-material";

interface DataTableProps {
  title: string;
  data: any[];
  showArrow: boolean;
  eff_cost_actions: Record<string, { eff: number; cost: number }>;
}

const ActionsTable: React.FC<DataTableProps> = ({ title, data, showArrow, eff_cost_actions }) => {
  console.log("eff_cost_actions", eff_cost_actions);

  // Function to extract unique keys from the data array
  const getUniqueKeys = (data: any[]): string[] => {
    const keysSet = new Set<string>();
    data.forEach((item) => {
      Object.keys(item).forEach((key) => keysSet.add(key));
    });
    return Array.from(keysSet);
  };

  // Function to generate columns dynamically, including eff and cost
  const getColumns = (data: any[]): GridColDef[] => {
    const keys = getUniqueKeys(data);

    // Move "Population" key to the end
    const reorderedKeys = keys.filter((key) => key !== "Population");
    if (keys.includes("Population")) {
      reorderedKeys.push("Population");
    }

    const baseColumns = reorderedKeys.map((key) => ({
      field: key,
      headerName: key.charAt(0).toUpperCase() + key.slice(1),
      width: 200,
      renderCell: (params) => {
        const value = params.value;
        if (key === "Action" || key === "Population") {
          return value || "-";
        }

        if (showArrow && typeof value === "number") {
          return (
            <div style={{ display: "flex", alignItems: "center" }}>
              {value}
              {value > 0 ? (
                <ArrowDropUp style={{ color: "green" }} />
              ) : value < 0 ? (
                <ArrowDropDown style={{ color: "red" }} />
              ) : null}
            </div>
          );
        }

        if (value === undefined || value === null) {
          return <span style={{ color: "#aaa" }}>-</span>;
        }

        return value;
      },
    }));

    // Add Eff and Cost columns
    const additionalColumns: GridColDef[] = [
      {
        field: "eff",
        headerName: "Effectiveness %",
        width: 150,
        renderCell: (params) => (params.value ? (params.value * 100).toFixed(2) : "-"),
      },
      {
        field: "cost",
        headerName: "Cost",
        width: 150,
        renderCell: (params) => params.value?.toFixed(2) ?? "-",
      },
    ];

    return [...baseColumns, ...additionalColumns];
  };

  // Merge eff_cost_actions into data rows
  const enrichedData = data.map((item, index) => {
    const actionId = item.Action?.toString(); // Assuming the "Action" field matches the eff_cost_actions keys
    const effCost = actionId ? eff_cost_actions[actionId] : { eff: null, cost: null };
    return { id: index, ...item, ...effCost };
  });

  return (
    <Box>
      <Box display="flex" alignItems="center">
        <Typography variant="h6" sx={{ padding: 1, fontWeight: "bold" }}>
          {title}
        </Typography>
      </Box>
      <DataGrid
        rows={enrichedData}
        columns={getColumns(data)}
        autoHeight
        sx={{ marginTop: 1 }}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        pageSizeOptions={[5, 10]}
        hideFooter
      />
    </Box>
  );
};

export default ActionsTable;
