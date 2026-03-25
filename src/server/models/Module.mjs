import mongoose from "mongoose";

const mailSchema = new mongoose.Schema({
    label: {type: String, required: true, maxLength: 20},
    type: {type: String, required: true, enum: ['expense', 'income', 'info']},
    sender: {type: String, required: true, maxLength: 30},
    date: {type: Date, required: true},
    subject: {type: String, required: true, maxLength: 50},
    body: {type: String, required: true, maxLength: 300},
    amount: {type: Double}
});

const incomeSchema = new mongoose.Schema({
    label: {type: String, required: true},
    catagory: {type: String, required: true, enum: ['paye', 'invoice', 'casual']},
    amount: {type: Double, required: true}
});

const moduleSchema = new mongoose.Schema({
    title: {type: String, required: true},
    mailPool: [mailSchema],
    incomePool: [incomeSchema]
});

const Module = mongoose.model('Modules', moduleSchema, 'Modules');
export default Module;