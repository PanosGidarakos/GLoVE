import React, { useEffect } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, OutlinedInput, Checkbox, SelectChangeEvent } from '@mui/material';
import { VisualColumn } from '../../../../shared/models/dataexploration.model';

interface ScatterChartControlPanelProps {
  columns: VisualColumn[];
  xAxis: VisualColumn;
  setXAxis: React.Dispatch<React.SetStateAction<VisualColumn>>
  yAxis: VisualColumn[];
  setYAxis: React.Dispatch<React.SetStateAction<VisualColumn[]>>
  colorBy: string;
  setColorBy: (colorBy: string) => void;
}

const ScatterChartControlPanel = ({ columns, xAxis, setXAxis, yAxis, setYAxis, colorBy, setColorBy }: ScatterChartControlPanelProps) => {
  console.log(columns, xAxis, setXAxis, yAxis, setYAxis, colorBy, setColorBy);

  useEffect(() => {
    if (columns && columns.length > 0) {
      // Set default xAxis and yAxis only if they haven't been initialized
      if (!xAxis || !columns.find(col => col.name === xAxis.name)) {
        setXAxis(columns[0]); // Set the first column as the xAxis by default
      }

      // Ensure the yAxis contains at least the second column by default if it's not yet initialized
      const validYAxis = yAxis.filter(yCol => columns.find(col => col.name === yCol.name));
      if (validYAxis.length === 0 && columns.length > 1) {
        setYAxis([columns[1]]); // Set the second column as default yAxis
      } else if (validYAxis.length !== yAxis.length) {
        setYAxis(validYAxis); // Update yAxis to remove any invalid columns
      }
    }
  }, [columns, xAxis, yAxis, setXAxis, setYAxis]);

  const handleColorByChange = (event: SelectChangeEvent<string>) => {
    setColorBy(event.target.value as string);
  }

  return (
    <Box sx={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
      {/* X-Axis Selector */}
      <FormControl fullWidth>
        <InputLabel id="x-axis-select-label">X-Axis</InputLabel>
        <Select
          labelId="x-axis-select-label"
          value={xAxis ? xAxis.name : ''}
          onChange={(e) => {
            const selectedColumn = columns.find((col) => col.name === e.target.value);
            setXAxis(selectedColumn ?? xAxis);
          }}
          label="X-Axis"
          MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}
        >
          {columns.map((col) => (
            <MenuItem key={col.name} value={col.name}>
              {col.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Y-Axis Multi-Selector */}
      <FormControl fullWidth>
        <InputLabel id="y-axis-multi-select-label">Y-Axis</InputLabel>
        <Select
          labelId="y-axis-multi-select-label"
          multiple
          value={yAxis.map((col) => col.name)}
          onChange={(e) => {
            const selectedColumns = Array.isArray(e.target.value)
              ? e.target.value.map((name) => columns.find((col) => col.name === name))
              : [columns.find((col) => col.name === e.target.value)];
            const validColumns = selectedColumns.filter((col) => col !== undefined);
            setYAxis(validColumns);
          }}
          input={<OutlinedInput label="Y-Axis" />}
          renderValue={(selected) => selected.join(', ')}
          MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}
        >
          {columns.map((col) => (
            <MenuItem key={col.name} value={col.name}>
              <Checkbox checked={yAxis.some((yCol) => yCol.name === col.name)} />
              {col.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Color By Selector */}
      <FormControl fullWidth>
        <InputLabel id="color-by-select-label">Color by</InputLabel>
        <Select
          labelId="color-by-select-label"
          value={colorBy}
          onChange={handleColorByChange}
          label="Color by"
          MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}
        >
          <MenuItem value="">None</MenuItem>
          {columns.map((col) => (
            <MenuItem key={col.name} value={col.name}>
              {col.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default ScatterChartControlPanel;
