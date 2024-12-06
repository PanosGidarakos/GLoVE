import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store";
import { uploadDataset, uploadModel, uploadTestDataset } from "../../../store/slices/glanceSlice";
import axios from "axios";

const UploadComponent: React.FC = () => {
    const dispatch = useAppDispatch();
    const [file, setFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState("dataset");
  const loading = useSelector((state: RootState) => state.glance.loading);
  const error = useSelector((state: RootState) => state.glance.error);
  const [dataResponse, setDataResponse] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');



  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  // Handle type selection
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUploadType(e.target.value);
  };

  // Handle upload
  const handleUpload = () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    switch (uploadType) {
      case "dataset":
        dispatch(uploadDataset(file));
        break;
      case "testDataset":
        dispatch(uploadTestDataset(file));
        break;
      case "model":
        dispatch(uploadModel(file));
        break;
      default:
        alert("Invalid upload type selected.");
    }
  };

  const handleData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/get-data/');
      setDataResponse(response.data);
      setStatusMessage('Data fetched successfully.');
    } catch (error) {
      setStatusMessage('Error fetching data.');
    }
  };
  const glanceState = useAppSelector((state) => state.glance);





  return (
    <div style={styles.container}>
      <h2>Upload File</h2>
      <input type="file" onChange={handleFileChange} style={styles.fileInput} />
      <select value={uploadType} onChange={handleTypeChange} style={styles.select}>
        <option value="dataset">Dataset</option>
        <option value="testDataset">Test Dataset</option>
        <option value="model">Model</option>
      </select>
      <button onClick={handleUpload} style={styles.uploadButton} disabled={loading}>
        {loading ? "Uploading..." : "Upload files"}
      </button>
      <button onClick={handleData} style={styles.uploadButton} disabled={loading}>
        {loading ? "Uploading..." : "Get DAta"}
      </button>
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
};

// Inline styles for simplicity
const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    gap: "10px",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    width: "300px",
    margin: "0 auto",
  },
  fileInput: {
    width: "100%",
    padding: "8px",
  },
  select: {
    width: "100%",
    padding: "8px",
  },
  uploadButton: {
    padding: "8px 12px",
    fontSize: "16px",
    cursor: "pointer",
  },
  error: {
    color: "red",
  },
};

export default UploadComponent;
