import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useSearchParams } from "react-router-dom";
import App from "./App.jsx";
import TeacherDashboard from "./teacher/pages/TeacherDashboard.jsx";
import CreateClassroomPage from "./teacher/pages/CreateClassroomPage.jsx";
import TeacherClassesPage from "./teacher/pages/TeacherClassesPage.jsx";
import ModuleSelectionPage from "./teacher/pages/ModuleSelectionPage.jsx";
import ClassroomDetailsPage from "./teacher/pages/ClassroomDetailsPage.jsx";

function TeacherClassesRoute() {
    const [params] = useSearchParams();
    return <TeacherClassesPage initialUsername={params.get("username") ?? ""} />;
}

function ClassroomDetailsRoute() {
    const [params] = useSearchParams();
    return <ClassroomDetailsPage initialClassId={params.get("id") ?? ""} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/teacher" element={<TeacherDashboard />} />
                <Route path="/teacher/create" element={<CreateClassroomPage />} />
                <Route path="/teacher/classes" element={<TeacherClassesRoute />} />
                <Route path="/teacher/modules" element={<ModuleSelectionPage />} />
                <Route path="/teacher/classroom" element={<ClassroomDetailsRoute />} />
                <Route path="/*" element={<App />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
)