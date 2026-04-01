import mongoose from 'mongoose';

function codeValidator (code) {
    return /^[A-HJ-NP-Z2-9]{6}$/.test(code);
}

function hexValidator (code) {
    return /^[0-9A-F]{3}$/.test(code);
}

const studentSchema = new mongoose.Schema({
    studentCode: { // student code rules
        type: String,
        required: true,
        validate: hexValidator
    },
    mark: {
        type: mongoose.Schema.Types.Int32,
        default: null
    },
    completedAt: {
        type: Date
    }
});

const classroomSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        maxLength: 30
    },
    classCode: { // classroom code rules
        type: String,
        required: true,
        unique: true,
        validate: codeValidator
    },
    // just storing a username right now, full implementation would need decision on internal accounts||third party user auth
    user: {
        type: String,
        required: true
    },
    module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
        required: true
    },
    students: [studentSchema] // undefined length, pass correct number of students in at API level
});

const Classroom = mongoose.model('Classrooms', classroomSchema, 'Classrooms');
export default Classroom;