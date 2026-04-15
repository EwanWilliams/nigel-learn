import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./app.css";

import LandingPage from "./screens/landing_page";
import StudyPage from "./screens/study_page";
import TeachPage from "./screens/teach_page";
import BuildPage from "./screens/build_page";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/study" element={<StudyPage />} />
        <Route path="/teach" element={<TeachPage />} />
        <Route path="/build" element={<BuildPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}