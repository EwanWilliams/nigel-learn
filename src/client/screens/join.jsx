import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function JoinPage() {
  const [classroomCode, setClassroomCode] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joining, setJoining] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    const trimmedClassroomCode = classroomCode.trim().toUpperCase();
    const trimmedStudentCode = studentCode.trim().toUpperCase();

    if (!trimmedClassroomCode || !trimmedStudentCode) {
      setJoinError("Please enter both the classroom code and student code.");
      return;
    }

    try {
      setJoining(true);
      setJoinError("");

      const res = await fetch(
        `http://localhost:3000/api/classroom/study/${trimmedClassroomCode}/${trimmedStudentCode}`
      );

      if (!res.ok) {
        throw new Error("Invalid classroom code or student code.");
      }

      const data = await res.json();

      sessionStorage.setItem("classroomCode", trimmedClassroomCode);
      sessionStorage.setItem("studentCode", trimmedStudentCode);
      sessionStorage.setItem("moduleId", data.moduleId);

      navigate("/study", {
        state: {
          classroomCode: trimmedClassroomCode,
          studentCode: trimmedStudentCode,
          moduleId: data.moduleId,
        },
      });
    } catch (err) {
      setJoinError(err.message || "Could not join classroom.");
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="routePage">
      <div className="routeCard">
        <div className="routeBadge">Join</div>

        <h1 className="routeSectionTitle">Join classroom</h1>

        <p className="routeSectionText">
          Enter the classroom code and your student code to access the
          simulation.
        </p>

        <form onSubmit={handleSubmit} className="joinForm">
          <input
            className="joinInput"
            type="text"
            value={classroomCode}
            onChange={(e) => setClassroomCode(e.target.value)}
            placeholder="Classroom code"
          />

          <input
            className="joinInput"
            type="text"
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            placeholder="Student code"
          />

          {joinError && <div className="joinError">{joinError}</div>}

          <button
            type="submit"
            className="routeBtn routeBtnPrimary joinBtn"
            disabled={joining}
          >
            {joining ? "Joining..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}