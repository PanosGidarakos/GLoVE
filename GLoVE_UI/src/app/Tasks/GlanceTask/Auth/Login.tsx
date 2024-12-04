// import React, { useState } from "react";
// import {
//   Box,
//   TextField,
//   Button,
//   Typography,
//   Container,
//   Paper,
// } from "@mui/material";

// const Login = () => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");

//   const handleLogin = (e) => {
//     e.preventDefault();
//     if (username === "admin" && password === "admin") {
//       localStorage.setItem("token", "sampleToken123");
//       window.location.href = "/";
//     } else {
//       alert("Invalid credentials");
//     }
//   };

//   return (
//     <Container
//       maxWidth="sm"
//       sx={{
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "center",
//         alignItems: "center",
//         minHeight: "100vh",
//       }}
//     >
//       <Paper
//         elevation={3}
//         sx={{
//           padding: 4,
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           width: "100%",
//         }}
//       >
//         <Typography
//           variant="h4"
//           gutterBottom
//           sx={{ textAlign: "center", marginBottom: 2 }}
//         >
//           Welcome to GLoVE
//         </Typography>
//         <Typography
//           variant="subtitle1"
//           gutterBottom
//           sx={{ textAlign: "center", marginBottom: 4 }}
//         >
//           Global Counterfactuals for Visual Explanations
//         </Typography>

//         <form
//           onSubmit={handleLogin}
//           style={{ display: "flex", flexDirection: "column", width: "100%" }}
//         >
//           <TextField
//             label="Username"
//             variant="outlined"
//             fullWidth
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             sx={{ marginBottom: 2 }}
//           />
//           <TextField
//             label="Password"
//             type="password"
//             variant="outlined"
//             fullWidth
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             sx={{ marginBottom: 2 }}
//           />
//           <Button
//             type="submit"
//             variant="contained"
//             color="primary"
//             fullWidth
//             sx={{ marginBottom: 2 }}
//           >
//             Login
//           </Button>
//         </form>
//       </Paper>
//     </Container>
//   );
// };

// export default Login;


import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
} from "@mui/material";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      localStorage.setItem("token", "sampleToken123");
      window.location.href = "/";
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: (theme) => theme.palette.customGradient.main, // Gradient background
        padding: 4,
        borderRadius: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          backgroundColor: (theme) => theme.palette.background.paper, // Use theme color
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            textAlign: "center",
            marginBottom: 2,
            color: (theme) => theme.palette.text.primary,
          }}
        >
          Welcome to GLoVE
        </Typography>
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{
            textAlign: "center",
            marginBottom: 4,
            color: (theme) => theme.palette.text.secondary,
          }}
        >
          Global Counterfactuals for Visual Explanations
        </Typography>

        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", width: "100%" }}
        >
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{
              marginBottom: 2,
              "& .MuiInputBase-root": {
                backgroundColor: (theme) => theme.palette.customGrey.light,
              },
            }}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              marginBottom: 2,
              "& .MuiInputBase-root": {
                backgroundColor: (theme) => theme.palette.customGrey.light,
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginBottom: 2 }}
          >
            Login
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
