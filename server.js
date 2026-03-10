const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const helmet   = require('helmet');
require('dotenv').config();

const app = express();

app.use(helmet());

app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5173',
    ].filter(Boolean);

    // Allow requests with no origin (mobile, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowed.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/halls',    require('./routes/halls'));
app.use('/api/exams',    require('./routes/exams'));
app.use('/api/activity', require('./routes/activityLog'));

app.get('/', (req,res)=>{
  res.send("Exam Scheduler Backend Running");
});

app.get('/health', (req, res) => res.status(200).send('OK'));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
  );
})
.catch((err) => console.error('DB connection failed:', err));