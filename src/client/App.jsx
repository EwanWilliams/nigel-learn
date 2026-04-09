import { Routes, Route } from "react-router-dom";
import "./app.css";

import LandingPage from "./screens/landing";
import StudyPage from "./screens/study";
import TeachPage from "./screens/teach";
import BuildPage from "./screens/build";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/study" element={<StudyPage />} />
      <Route path="/teach" element={<TeachPage />} />
      <Route path="/build" element={<BuildPage />} />
    </Routes>
  );
}