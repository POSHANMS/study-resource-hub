const Resource = require('../models/Resource');
const path = require('path');
const fs = require('fs');

// @desc    Upload a resource
// @route   POST /api/resources
const uploadResource = async (req, res) => {
  try {
    const { title, description, subject, type, link, tags } = req.body;

    if (!title || !description || !subject || !type) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    if (type === 'link' && !link) {
      return res.status(400).json({ message: 'Link is required for link type' });
    }

    if ((type === 'pdf' || type === 'note') && !req.file) {
      return res.status(400).json({ message: 'File is required for pdf/note type' });
    }

    const resource = await Resource.create({
      title,
      description,
      subject,
      type,
      link: type === 'link' ? link : '',
      fileUrl: req.file ? `/uploads/${req.file.filename}` : '',
      fileName: req.file ? req.file.originalname : '',
      uploadedBy: req.user._id,
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
    });

    await resource.populate('uploadedBy', 'name email');
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all resources (with search & filter)
// @route   GET /api/resources
const getResources = async (req, res) => {
  try {
    const { search, subject, type, page = 1, limit = 12 } = req.query;

    let query = { isApproved: true };

    if (subject && subject !== 'All') {
      query.subject = { $regex: subject, $options: 'i' };
    }

    if (type && type !== 'All') {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const total = await Resource.countDocuments(query);
    const resources = await Resource.find(query)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      resources,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download resource (increment count)
// @route   GET /api/resources/:id/download
const downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    resource.downloads += 1;
    await resource.save();

    if (resource.type === 'link') {
      return res.json({ link: resource.link });
    }

    const filePath = path.join(__dirname, '..', resource.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(filePath, resource.fileName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my uploads
// @route   GET /api/resources/my-uploads
const getMyUploads = async (req, res) => {
  try {
    const resources = await Resource.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete own resource
// @route   DELETE /api/resources/:id
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    if (resource.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (resource.fileUrl) {
      const filePath = path.join(__dirname, '..', resource.fileUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await resource.deleteOne();
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unique subjects
// @route   GET /api/resources/subjects
const getSubjects = async (req, res) => {
  try {
    const subjects = await Resource.distinct('subject', { isApproved: true });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadResource,
  getResources,
  getResourceById,
  downloadResource,
  getMyUploads,
  deleteResource,
  getSubjects,
};
