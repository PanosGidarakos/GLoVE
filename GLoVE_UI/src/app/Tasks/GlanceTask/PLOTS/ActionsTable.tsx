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

  // Function to generate columns dynamically, placing Eff and Cost next to Action
  const getColumns = (data: any[]): GridColDef[] => {
    const keys = getUniqueKeys(data);

    // Find the index of the Action column
    const actionIndex = keys.indexOf("Action");

    // Create base columns
    const baseColumns = keys.map((key) => ({
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

        return value ?? <span style={{ color: "#aaa" }}>-</span>;
      },
    }));

    // Define Effectiveness and Cost columns
    const effCostColumns: GridColDef[] = [
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
        renderCell: (params) => (params.value ? params.value.toFixed(2) : "-"),
      },
    ];

    // Insert Eff and Cost right after the Action column
    if (actionIndex !== -1) {
      baseColumns.splice(actionIndex + 1, 0, ...effCostColumns);
    } else {
      baseColumns.push(...effCostColumns);
    }

    return baseColumns;
  };

  // Merge eff_cost_actions into data rows
  const enrichedData = data.map((item, index) => {
    const actionId = item.Action?.toString();
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
        // hideFooter
      />
    </Box>
  );
};

export default ActionsTable;
