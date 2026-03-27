import mongoose from 'mongoose';

function codeValidator (code) {
    return /^[A-HJ-NP-Z2-9]+$/.test(code);
}

const classroomSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        maxLength: 6,
        minLength: 6,
        validate: codeValidator
    }
});

const Classroom = mongoose.model('Classrooms', classroomSchema, 'Classrooms');
export default Classroom;