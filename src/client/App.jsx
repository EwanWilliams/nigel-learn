import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./app.css";

import LandingPage from "./screens/landing";
import JoinPage from "./screens/join";
import StudyPage from "./screens/study";
import ModuleCreation from "./pages/module-creation";
import CreateClassroomPage from "./teacher/pages/CreateClassroomPage.jsx";
import TeacherClassesPage from "./teacher/pages/TeacherClassesPage.jsx";
import ClassroomDetailsPage from "./teacher/pages/ClassroomDetailsPage.jsx";
import ClassroomProjectionPage from "./teacher/pages/ClassroomProjectionPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/study" element={<StudyPage />} />
        <Route path="/build" element={<ModuleCreation />} />
        <Route path="/teach" element={<Navigate to="/teach/classes" replace />} />
        <Route path="/teach/create" element={<CreateClassroomPage />} />
        <Route path="/teach/classes" element={<TeacherClassesPage />} />
        <Route path="/teach/classroom" element={<Navigate to="/teach/classes" replace />} />
        <Route path="/teach/classroom/:id" element={<ClassroomDetailsPage />} />
        <Route path="/teach/classroom/projection" element={<ClassroomProjectionPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}