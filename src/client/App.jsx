import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./app.css";

import LandingPage from "./pages/landing_page";
import StudyPage from "./pages/study_page";
import TeachPage from "./pages/teach_page";
import BuildPage from "./pages/build_page";

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