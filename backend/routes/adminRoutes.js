const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getAllResources,
  adminDeleteResource,
  toggleApprove,
  changeUserRole,
  deleteUser,
  getStats,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/resources', getAllResources);
router.put('/resources/:id/approve', toggleApprove);
router.delete('/resources/:id', adminDeleteResource);
router.put('/users/:id/role', changeUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
