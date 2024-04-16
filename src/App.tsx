import { type Component, lazy } from "solid-js";
import { Router, Route, RouteSectionProps } from "@solidjs/router";
import Navbar from "./navigation/Navbar";

const Practice = lazy(() => import("./pages/Practice"));
const Loops = lazy(() => import("./pages/Loops"));

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
        <Route path="/loops" component={Loops} />
      </Router>
    </>
  );
};

export default App;
