const Certification = require("../models/Certification");


// CREATE CERTIFICATION
const createCertification = async (req, res) => {
  try {

    const {
      title,
      issuer,
      issueDate,
      credentialId,
      credentialUrl,
    } = req.body;

    const certification = await Certification.create({
      user: req.user._id,
      title,
      issuer,
      issueDate,
      credentialId,
      credentialUrl,

      certificateFile: req.file
        ? req.file.path
        : "",
    });

    res.status(201).json(certification);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET CERTIFICATIONS
const getCertifications = async (req, res) => {
  try {

    const certifications =
      await Certification.find({
        user: req.user._id,
      });

    res.json(certifications);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// UPDATE CERTIFICATION
const updateCertification = async (req, res) => {
  try {

    const certification =
      await Certification.findById(req.params.id);

    if (!certification) {
      return res.status(404).json({
        message: "Certification not found",
      });
    }

    // OWNERSHIP CHECK
    if (
      certification.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const {
      title,
      issuer,
      issueDate,
      credentialId,
      credentialUrl,
    } = req.body;

    certification.title =
      title || certification.title;

    certification.issuer =
      issuer || certification.issuer;

    certification.issueDate =
      issueDate || certification.issueDate;

    certification.credentialId =
      credentialId || certification.credentialId;

    certification.credentialUrl =
      credentialUrl || certification.credentialUrl;

    // UPDATE FILE
    if (req.file) {
      certification.certificateFile = `/uploads/${req.file.filename}`;
    }

    await certification.save();

    res.json(certification);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// DELETE CERTIFICATION
const deleteCertification = async (req, res) => {
  try {

    const certification =
      await Certification.findById(req.params.id);

    if (!certification) {
      return res.status(404).json({
        message: "Certification not found",
      });
    }

    // OWNERSHIP CHECK
    if (
      certification.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    await certification.deleteOne();

    res.json({
      message: "Certification deleted",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createCertification,
  getCertifications,
  updateCertification,
  deleteCertification,
};