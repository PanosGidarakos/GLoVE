// import type React from "react"
// import { Box, Typography } from "@mui/material"
// import { ReactFlowProvider } from "reactflow"
// import FlowStepper from "./FlowStepper"
// import { useState } from "react"
// import GlanceTabs from "./GlanceTabs"
// // import GlanceTabs from "./GlanceTabs"

// const styles = {
//   header: {
//     textAlign: "center",
//     marginBottom: "24px",
//     background: "linear-gradient(90deg, green, blue)",
//     WebkitBackgroundClip: "text",
//     WebkitTextFillColor: "transparent",
//     fontWeight: "bold",
//     marginTop: "32px",
//   },
// }

// const GlanceLayout: React.FC = () => {
//   const [selectedTab, setSelectedTab] = useState(0)
//   const [activeStep, setActiveStep] = useState(0)

//   return (
//     <Box
//       sx={{
//         padding: 2,
//         backgroundColor: "#f9f9f9",
//         minHeight: "100vh",
//       }}
//     >
//       <Typography variant="h4" gutterBottom sx={styles.header}>
//         GLOVES: Global Counterfactual-based Visual Explanations
//       </Typography>

//       <ReactFlowProvider>
//         <FlowStepper
//           setSelectedTab={setSelectedTab}
//           setActiveStep={setActiveStep}
//           activeStep={activeStep}
//         />
//       </ReactFlowProvider>

//       <GlanceTabs
//         selectedTab={selectedTab}
//         setSelectedTab={setSelectedTab}
//         setActiveStep={setActiveStep}
//       />
//     </Box>
//   )
// }

// export default GlanceLayout





import React, { useState } from "react"
import { Box, Typography } from "@mui/material"
import { ReactFlowProvider } from "reactflow"
import FlowStepper from "./FlowStepper"
import GlanceTabs from "./GlanceTabs"

const styles = {
  header: {
    textAlign: "center",
    marginBottom: "16px",
    background: "linear-gradient(90deg, green, blue)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: "bold",
    marginTop: "16px",
  },
}

const GlanceLayout: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0)
  const [activeStep, setActiveStep] = useState(0)

  return (
    <Box
      sx={{
        padding: 2,
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Sticky header container */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          backgroundColor: "#f9f9f9",
          zIndex: 1100,
          paddingBottom: 2,
          borderBottom: "1px solid #ddd",
        }}
      >
        <Typography variant="h4" gutterBottom sx={styles.header}>
          GLOVES: Global Counterfactual-based Visual Explanations
        </Typography>

        <ReactFlowProvider>
          <FlowStepper
            setSelectedTab={setSelectedTab}
            setActiveStep={setActiveStep}
            activeStep={activeStep}
          />
        </ReactFlowProvider>
      </Box>

      {/* Tabs content - make this scrollable if needed */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          marginTop: 2,
        }}
      >
        <GlanceTabs
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          setActiveStep={setActiveStep}
        />
      </Box>
    </Box>
  )
}

export default GlanceLayout
