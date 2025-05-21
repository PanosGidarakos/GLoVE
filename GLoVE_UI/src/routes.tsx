import { createBrowserRouter } from "react-router-dom"
import NotFound from "./not-found";
import GlanceComponent from "./app/Tasks/GlanceTask/GlanceComponent";

const routes = createBrowserRouter([
 
  {
    path: "/",
    element: <GlanceComponent />,
    errorElement: <NotFound />
  },
  // {
  //   path: "/login",
  //   element: <Login />,
  //   errorElement: <ErrorPage />,
  // },
]);

export default routes;



