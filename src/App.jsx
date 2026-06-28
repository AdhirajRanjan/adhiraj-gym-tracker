import { HomePage } from "./pages/HomePage.jsx";
import { TrackerPage } from "./pages/TrackerPage.jsx";

function App() {
  const path = window.location.pathname;

  if (path === "/app") {
    return <TrackerPage />;
  }

  return <HomePage />;
}

export default App;
