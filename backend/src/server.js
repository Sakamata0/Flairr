import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import postsRouter from './routes/posts.js';
import uploadsRouter from './routes/uploads.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/posts', postsRouter);
app.use('/api/uploads', uploadsRouter);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Backend listening on ${port}`));
