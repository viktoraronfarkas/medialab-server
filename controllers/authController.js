const bcrypt = require('bcrypt');
const multer = require('multer');
const sharp = require('sharp');
const pool = require('../config/database');

// Configure multer for file upload
const upload = multer({
  limits: { fileSize: 25 * 1024 * 1024 }, // Set a file size limit (5MB in this example)
  fileFilter: (req, file, cb) => {
    // Check the file type and only allow certain file extensions
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'), false); // Reject the file
    }
  },
}).single('profile_image');

// eslint-disable-next-line consistent-return
exports.checkEmailExists = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email not provided' });
  }

  pool.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Error querying MySQL:', err);
      return res.status(500).json({ error: 'Failed to fetch data from MySQL' });
    }

    const emailExists = results.length > 0;
    return res.json({ exists: emailExists });
  });
};
/**
 * User signup API
 * Handles user registration and profile image upload.
 *
 * Request body:
 * {
 *   email: string,
 *   name: string,
 *   username: string,
 *   password: string
 * }
 *
 * Response:
 * {
 *   message: string,
 *   userId: number
 * }
 */
exports.signup = async (req, res) => {
  upload(req, res, async (uploadErr) => {
    // Handle file upload errors
    if (uploadErr instanceof multer.MulterError) {
      return res.status(500).json({ message: 'Error uploading file' });
    }
    if (uploadErr) {
      console.error('Error uploading file:', uploadErr);
      return res
        .status(500)
        .json({ message: 'Error uploading file', error: uploadErr.message });
    }

    // Retrieve user registration data from the request body
    const { email, name, username, password } = req.body;
    const roleId = 1; // assuming role_id for regular users is 1

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email or password not provided' });
    }

    try {
      // Hash the password
      const passwordHash = await bcrypt.hash(password, 12);

      // Get the profile image file data
      let profileImageData;
      if (req.file) {
        const compressedImageBuffer = await sharp(req.file.buffer)
          .resize(500, 500) // Resize the image to a specific size (e.g., 500x500 pixels)
          .jpeg({ quality: 80 }) // Convert the image to JPEG format with 80% quality
          .toBuffer();

        profileImageData = compressedImageBuffer;
      }

      // Check if the email already exists
      const emailExists = await new Promise((resolve, reject) => {
        pool.query(
          'SELECT * FROM users WHERE email = ?',
          [email],
          (err, results) => {
            if (err) {
              reject(err);
            } else {
              resolve(results.length > 0);
            }
          }
        );
      });

      if (emailExists) {
        // If an error occurred or the email already exists, delete the uploaded profile image
        if (req.file) {
          req.file.buffer = null;
        }
        return res.status(409).json({ message: 'Email already registered' });
      }

      // Insert the user data into the database
      const queryResult = await new Promise((resolve, reject) => {
        pool.query(
          'INSERT INTO users (email, name, username, password, profile_image, role_id) VALUES (?, ?, ?, ?, ?, ?)',
          [email, name, username, passwordHash, profileImageData, roleId],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });

      return res
        .status(200)
        .json({ message: 'User created', userId: queryResult.insertId });
    } catch (error) {
      console.error('Error creating user:', error);
      // If an error occurred, delete the uploaded profile image
      if (req.file) {
        req.file.buffer = null;
      }
      return res.status(500).json({ message: 'Error while creating user' });
    }
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  pool.getConnection((connectionErr, connection) => {
    if (connectionErr) {
      console.error('Error getting MySQL connection:', connectionErr);
      return res.status(500).json({ error: 'Failed to connect to MySQL' });
    }

    // Query the database for the user with the provided email
    connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email],
      // eslint-disable-next-line consistent-return
      (queryErr, results) => {
        connection.release();

        if (queryErr) {
          console.error('Error querying MySQL:', queryErr);
          return res
            .status(500)
            .json({ error: 'Failed to fetch data from MySQL' });
        }

        // Check if the user exists
        if (results.length === 0) {
          return res.status(401).json({ error: 'invalidEmail' });
        }

        const user = results[0];

        // Compare the provided password with the stored password hash
        bcrypt.compare(password, user.password, (bcryptErr, result) => {
          if (bcryptErr) {
            console.error('Error comparing password hashes:', bcryptErr);
            return res
              .status(500)
              .json({ error: 'Error while comparing password hashes' });
          }

          // If the passwords match, return a success message and the user object
          if (!result) {
            return res.status(401).json({ error: 'invalidPassword' });
          }

          return res.json({ message: 'Login successful', user });
        });
      }
    );

    return null; // Add this line to satisfy the consistent-return ESLint rule
  });
};
