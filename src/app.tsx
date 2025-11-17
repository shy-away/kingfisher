import { createRoot } from "react-dom/client";
import Puzzle from "./components/puzzle";

function App() {
  return (
    <>
      <h1>Complete a Random Puzzle</h1>
      <Puzzle />
    </>
  );
}

createRoot(document.body).render(<App />);
