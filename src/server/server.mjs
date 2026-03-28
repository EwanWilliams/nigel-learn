import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
import moduleRoutes from './routes/module.mjs';


// define server details
const app = express();
const PORT = process.env._PORT;
const db_username = encodeURIComponent(process.env.db_user);
const db_password = encodeURIComponent(process.env.db_password);
const db_cluster = process.env.db_cluster;
const DB_URI = `mongodb+srv://${db_username}:${db_password}@${db_cluster}`;


// middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(cors({
    origin: ['http://localhost:5173']
}));


// connect to atlas database
mongoose.connect(DB_URI).then(() => console.log("Connected to DB.")).catch(error => console.log(error));


// use API routes from route folder
app.use('/api/module', moduleRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));