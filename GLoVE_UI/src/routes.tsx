import { createBrowserRouter } from "react-router-dom"
import ErrorPage from "./error-page";
import NotFound from "./not-found";
import GlanceComponent from "./app/Tasks/GlanceTask/GlanceComponent";

const routes = createBrowserRouter([
 
  {
    path: "/",
    element: <GlanceComponent />,
    errorElement: <NotFound />
  }
]);

export default routes;
