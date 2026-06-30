const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    updateProfile,
    getUsers,
    updateUser,
    deleteUser,
} = require('../controllers/userController');
const { protect, admin, superAdmin, authorize } = require('../middleware/authMiddleware');

router.get('/all', protect, admin, authorize('admins', 'view'), getUsers);
router.post('/', protect, admin, authorize('admins', 'create'), registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/:id', protect, admin, authorize('admins', 'edit'), updateUser);
router.delete('/:id', protect, admin, authorize('admins', 'delete'), deleteUser);

module.exports = router;
