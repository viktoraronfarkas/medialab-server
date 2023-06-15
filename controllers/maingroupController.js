const multer = require('multer');
// const mime = require('mime-types');
const pool = require('../config/database');

const upload = multer().single('image');

exports.addImageToMainGroup = (req, res) => {
  // eslint-disable-next-line consistent-return
  upload(req, res, (error) => {
    if (error) {
      console.error('Error uploading file:', error);
      return res.status(400).json({ error: 'Failed to upload file' });
    }

    // Get the file data from req.file
    const { buffer, mimetype } = req.file;

    // Check if the uploaded file is an image (optional)
    // You can remove this check if you're allowing any image file type
    if (!mimetype.startsWith('image/')) {
      return res
        .status(400)
        .json({ error: 'Invalid file type. Only images are allowed.' });
    }

    const startGroupId = 38;
    const endGroupId = 38;

    // Store the image data in the title_image column for group IDs 4 to 35
    const query =
      'UPDATE maingroup SET title_image = ? WHERE group_id BETWEEN ? AND ?';

    // eslint-disable-next-line no-shadow
    pool.query(query, [buffer, startGroupId, endGroupId], (error) => {
      if (error) {
        console.error('Error querying MySQL:', error);
        return res.status(500).json({ error: 'Failed to update image data' });
      }

      return res.json({
        success: true,
        message: 'Image data added successfully',
      });
    });
  });
};

exports.getMainGroupsWithSubgroups = (req, res) => {
  // eslint-disable-next-line consistent-return
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting MySQL connection:', err);
      return res.status(500).json({ error: 'Failed to fetch data from MySQL' });
    }

    const query = `
      SELECT 
        maingroup.group_id AS mainGroupId, 
        maingroup.name AS mainGroupName, 
        maingroup.title_image AS mainGroupTitleImage,
        subgroups.user_id AS userId,
        subgroups.group_id AS subgroupId, 
        subgroups.name AS subgroupName, 
        subgroups.title_image AS subgroupTitleImage, 
        subgroups.members, 
        subgroups.events, 
        subgroups.threads, 
        subgroups.created_at,
        subgroups.caption AS subgroupCaption
      FROM maingroup 
      LEFT JOIN subgroups ON maingroup.group_id = subgroups.main_group_id
    `;

    connection.query(query, (error, results) => {
      connection.release();

      if (error) {
        console.error('Error querying MySQL:', error);
        return res
          .status(500)
          .json({ error: 'Failed to fetch data from MySQL' });
      }

      // Process the results and return the response
      const mainGroups = {};

      results.forEach((row) => {
        const {
          mainGroupId,
          mainGroupName,
          mainGroupTitleImage,
          userId,
          subgroupId,
          subgroupName,
          subgroupTitleImage,
          members,
          events,
          threads,
          createdAt,
          subgroupCaption,
        } = row;

        if (!mainGroups[mainGroupId]) {
          mainGroups[mainGroupId] = {
            mainGroupId,
            mainGroupName,
            mainGroupTitleImage: mainGroupTitleImage
              ? mainGroupTitleImage.toString('base64')
              : null, // Convert blob to base64 string
            subgroups: [],
          };
        }

        if (subgroupId) {
          // Only add subgroups if subgroupId exists
          mainGroups[mainGroupId].subgroups.push({
            userId,
            subgroupId,
            subgroupName,
            subgroupTitleImage: subgroupTitleImage
              ? subgroupTitleImage.toString('base64')
              : null, // Convert blob to base64 string
            members,
            events,
            threads,
            createdAt,
            subgroupCaption,
          });
        }
      });

      const response = Object.values(mainGroups);
      return res.json(response); // Return the response
    });
  });
};
