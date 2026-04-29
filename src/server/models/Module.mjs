import mongoose from 'mongoose';

const mailSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        maxLength: 20
    },
    type: {
        type: String,
        required: true,
        enum: ['expense', 'income', 'info']
    },
    sender: {
        type: String,
        required: true,
        maxLength: 30
    },
    date: {
        type: Date,
        required: true
    },
    subject: {
        type: String,
        required: true,
        maxLength: 50
    },
    body: {
        type: String,
        required: true,
        maxLength: 300
    },
    amount: {
        type: Number
    }
});

const incomeSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        maxLength: 20
    },
    category: {
        type: String,
        required: true,
        enum: ['PAYE', 'Invoice', 'Casual']
    },
    amount: {
        type: Number,
        required: true
    }
});

const expenseSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        maxLength: 20
    },
    category: {
        type: String,
        required: true,
        enum: ['Rent', 'Travel', 'Food', 'Phone', 'Subscriptions', 'Savings', 'Fun', 'Other']
    },
    amount: {
        type: Number,
        required: true
    } 
});

const weekSchema = new mongoose.Schema({
    dateStarting: {
        type: Date,
        required: true
    },
    mailPool: [mailSchema],
    incomePool: [incomeSchema],
    expensePool: [expenseSchema]
});

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        maxLength: 100
    },
    options: [{
        text: {
            type: String,
            required: true,
            maxLength: 50
        },
        correct: {
            type: Boolean,
            required: true
        }
    }]
});

const moduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxLength: 30
    },
    brief: {
        type: String,
        required: true,
        maxLength: 1000
    },
    weekPool: [weekSchema],
    quiz: [questionSchema]
});

const Module = mongoose.model('Modules', moduleSchema, 'Modules');
export default Module;