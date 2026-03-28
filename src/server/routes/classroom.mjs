import express from 'express';
import Classroom from '../models/Classroom.mjs';

const router = express.Router();


function generateClassCode() {
    // generate class code
}


// logic to generate an array of student objects with unique hex codes
function generateStudents(classSize) {
    // generate set of student codes
    let codes = new Set();
    while (codes.size < classSize) {
        codes.add(Math.floor(Math.random() * 4096).toString(16).toUpperCase().padStart(3, '0'));
    }
    codes = Array.from(codes); // convert to array

    // generate array of student objects
    const students = []
    for (let i = 0; i < classSize; i++) {
        const student = {
            studentCode: codes[i],
            mark: null,
            completedAt: new Date(0)
        }
        students.push(student);
    }
    return students;
}


router.post('/new', async (req, res) => {
    try {
        const newClassroom = {
            classCode: generateClassCode(),
            user: req.body.username,
            module: req.body.moduleId,
            students: generateStudents(req.body.classSize)
        }
    } catch (err) {
        console.error("New classroom error: ", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


export default router;