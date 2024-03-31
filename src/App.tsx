import { type Component, lazy } from "solid-js";
import { Router, Route, RouteSectionProps } from "@solidjs/router";
import Navbar from "./navigation/Navbar";

const Practice = lazy(() => import("./pages/Practice"));

const Layout: Component<RouteSectionProps> = (props) => {
  return (
    <>
      <Navbar />
      {props.children}
    </>
  );
};
const App: Component = () => {
  return (
    <>
      <Router root={Layout}>
        <Route path="/" component={Practice} />
      </Router>
    </>
  );
};

export default App;
