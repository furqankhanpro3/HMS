const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();

// Middleware
// CORS configuration
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
// app.get('/', (req, res) => {
//     res.status(200).json({ message: 'Welcome to the Hostel Management API' });
// });

app.use('/api/admin', require('./routes/userRoutes'));
app.use('/api/hostels', require('./routes/hostelRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/mess', require('./routes/messRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/fee', require('./routes/feeRoutes'))
app.use('/api/challans', require('./routes/challanRoutes'))
app.use('/api/inventory', require('./routes/inventoryRoutes'))
app.use('/api/mess/stock', require('./routes/messStockDedRoutes'))
app.use('/api/expenses', require('./routes/expenseRoutes'))
app.use('/api/income', require('./routes/incomeRoutes'))
app.use('/api/staff', require('./routes/staffRoutes'))
// Error Middleware
app.use(notFound);
app.use(errorHandler);


app.listen(process.env.PORT || 10000, '0.0.0.0', () => {
    console.log('Server running');
});