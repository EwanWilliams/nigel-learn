import express from 'express';
import Classroom from '../models/Classroom.mjs';

const router = express.Router();


// UPDATE THIS FUNCTION
// placeholder username check!!!
function checkValidUser(username) {
    if (username) {
        return true;
    }
    return false;
}


// logic to generate valid class code and check it isn't already in use
async function generateClassCode() {
    const codeLength = 6;
    const allowedChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var codeChecked = false;

    while (codeChecked == false) {
        // generate valid class code
        var code = "";
        for (let i = 0; i < codeLength; i++ ) {
            code += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
        }

        // check code isn't already in use
        const existingCode = await Classroom.findOne({ classCode: code });
        if (!existingCode) { codeChecked = true }
    }

    return code;
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
            completedAt: new Date(0) // default to unix epoch as our null state
        }
        students.push(student);
    }
    return students;
}


// create new classroom
router.post('/new', async (req, res) => {
    try { // validate inputs
        if (checkValidUser(req.body.username) == false) {
            res.status(400).json({error: "username bad"});
        } else if (req.body.classSize > 50 || req.body.classSize < 1) {
            res.status(400).json({error: "class size bad"});
        } else { // validation passed
            const newClassroom = {
                label: req.body.label,
                classCode: await generateClassCode(),
                user: req.body.username,
                module: req.body.moduleId,
                students: generateStudents(req.body.classSize)
            }
            const classroom = await Classroom.create(newClassroom);
            res.status(200).json({
                classroomId: classroom._id,
                message: "Classroom created successfully"
            });
        }
    } catch (err) {
        console.error("New classroom error: ", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// get classroom details by id
router.get('/:classId', async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.classId);
        if (!classroom) {
            res.status(404).json({error: "No classroom found with that id"});
        } else {
            res.status(200).json(classroom);
        }
    } catch (err) {
        console.error("Find class by ID error: ", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// get just the list of students and marks by classId for easy mark updates
router.get('/:classId/marks', async (req, res) => {
    try {
        const students = await Classroom.findById(req.params.classId, "students");
        if (!students) {
            res.status(404).json({error: "No classroom found with that id"});
        } else {
            res.status(200).json(students.students);
        }
    } catch (err) {
        console.error("Find class by ID error: ", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// get list of classrooms by teacher username
router.get('/userClasses/:username', async (req, res) => {
    try {
        const classrooms = await Classroom.find(
            {user: req.params.username},
            "_id label"
        ).exec();
        if (!classrooms) {
            res.status(404).json({error: "No classrooms found under username"});
        } else {
            res.status(200).json(classrooms);
        }
    } catch (err) {
        console.error("Find classes by user error: ", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// get module id from class and student code
router.get('/study/:classCode/:studentCode', async (req, res) => {
    try {
        const moduleId = await Classroom.findOne(
            {classCode: req.params.classCode, students: { $elemMatch: { studentCode: req.params.studentCode } }},
            "module"
        ).exec();
        if (!moduleId) {
            res.status(404).json({error: "No module found"});
        } else {
            res.status(200).json({moduleId: moduleId.module});
        }
    } catch (err) {
        console.error("Find module id for class error: ", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


export default router;