import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useSearchParams, Navigate, useLocation } from "react-router-dom";
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

function CreateClassroomRoute() {
    const [params] = useSearchParams();
    return <CreateClassroomPage initialUsername={params.get("username") ?? ""} />;
}

function ClassroomDetailsRoute() {
    const [params] = useSearchParams();
    return <ClassroomDetailsPage initialClassId={params.get("id") ?? ""} />;
}

function LegacyTeacherRedirect() {
    const location = useLocation();
    const nextPath = `/Teach${location.pathname.slice('/teacher'.length)}${location.search}${location.hash}`;
    return <Navigate to={nextPath} replace />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/teacher/*" element={<LegacyTeacherRedirect />} />

                <Route path="/Teach" element={<TeacherDashboard />} />
                <Route path="/Teach/create" element={<CreateClassroomRoute />} />
                <Route path="/Teach/classes" element={<TeacherClassesRoute />} />
                <Route path="/Teach/modules" element={<ModuleSelectionPage />} />
                <Route path="/Teach/classroom" element={<ClassroomDetailsRoute />} />
                <Route path="/*" element={<App />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
)