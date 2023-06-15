const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Import routes
const maingroupRoutes = require('./routes/maingroup');
const subgroupRoutes = require('./routes/subgroup');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

// Use routes
app.use('/maingroup', maingroupRoutes);
app.use('/subgroup', subgroupRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
