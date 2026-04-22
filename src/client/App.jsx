import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./app.css";

import LandingPage from "./screens/landing";
import JoinPage from "./screens/join";
import StudyPage from "./screens/study";
import TeachPage from "./screens/teach";
import BuildPage from "./screens/build";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/study" element={<StudyPage />} />
        <Route path="/teach" element={<TeachPage />} />
        <Route path="/build" element={<BuildPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}