// import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";
import { ArrowDropUp, ArrowDropDown } from "@mui/icons-material";

interface DataTableProps {
  title: string;
  data: any[];
  showArrow: boolean; // New parameter to toggle arrows
  
}

const DataTable: React.FC<DataTableProps> = ({ title, data, showArrow }) => {
  // Function to dynamically generate columns based on the data keys
  const getColumns = (data: any[]): GridColDef[] => {
    if (data.length === 0) return [];
    
    const keys = Object.keys(data[0]).filter((key) => key !== "index");

    // Ensure "label" is the first column if it exists
    const sortedKeys = keys.includes("label")
      ? ["label", ...keys.filter((key) => key !== "label")]
      : keys;

    return sortedKeys.map((key) => ({
      field: key,
      headerName: key.charAt(0).toUpperCase() + key.slice(1),
      width: 150,
      renderCell: (params) => {
        if (key === "label") {
          // Define the conditions for "affected" and "non-affected"
          const isAffected = params.value === 1; // Adjust based on your criteria (e.g., 1 = affected)
          const cellStyle = {
            backgroundColor: isAffected ? "lightgreen" : "lightcoral",
            color: "#000", // Text color, adjust as needed
            padding: "8px",
          };

          return (
            <div style={cellStyle}>
              {params.value}
            </div>
          );
        }

        if (showArrow && typeof params.value === "number") {
          return (
            <div style={{ display: "flex", alignItems: "center" }}>
              {params.value}
              {params.value > 0 ? (
                <ArrowDropUp style={{ color: "green" }} />
              ) : params.value < 0 ? (
                <ArrowDropDown style={{ color: "red" }} />
              ) : null}
            </div>
          );
        }

        return params.value; // Default rendering for other columns
      },
    }));
  };

  return (
    <>
     
      <DataGrid
        rows={data.map((item, index) => ({ id: index, ...item }))}
        columns={getColumns(data)}
        autoHeight
        sx={{ marginTop: 1 }}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          }}
        }
        pageSizeOptions={[5, 10]}
      />
    </>
  );
};

export default DataTable;
