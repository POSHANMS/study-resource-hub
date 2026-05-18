const express = require('express');
const router = express.Router();
const {
  uploadResource,
  getResources,
  getResourceById,
  downloadResource,
  getMyUploads,
  deleteResource,
  getSubjects,
} = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getResources);
router.get('/subjects', getSubjects);
router.get('/my-uploads', protect, getMyUploads);
router.get('/:id', getResourceById);
router.get('/:id/download', protect, downloadResource);
router.post('/', protect, upload.single('file'), uploadResource);
router.delete('/:id', protect, deleteResource);

module.exports = router;
