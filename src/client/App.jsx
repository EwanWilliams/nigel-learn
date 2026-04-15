import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./app.css";

import LandingPage from "./screens/landing";
import StudyPage from "./screens/study";
import BuildPage from "./screens/build";

import TeacherDashboard from "./teacher/pages/TeacherDashboard.jsx";
import CreateClassroomPage from "./teacher/pages/CreateClassroomPage.jsx";
import TeacherClassesPage from "./teacher/pages/TeacherClassesPage.jsx";
import ClassroomDetailsPage from "./teacher/pages/ClassroomDetailsPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/study" element={<StudyPage />} />
        <Route path="/teach" element={<TeacherDashboard />} />
        <Route path="/teach/create" element={<CreateClassroomPage />} />
        <Route path="/teach/classes" element={<TeacherClassesPage />} />
        <Route path="/teach/classroom" element={<ClassroomDetailsPage />} />
        <Route path="/build" element={<BuildPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}