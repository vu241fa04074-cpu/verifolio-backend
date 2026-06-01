const Endorsement =
  require("../models/Endorsement");

const ProfileAnalytics =
  require("../models/ProfileAnalytics");


// CREATE ENDORSEMENT
const createEndorsement = async (req, res) => {
  try {

    const {
      toUser,
      skill,
      message,
    } = req.body;

    // PREVENT SELF ENDORSEMENT
    if (
      toUser === req.user._id.toString()
    ) {
      return res.status(400).json({
        message:
          "You cannot endorse yourself",
      });
    }

    const endorsement =
      await Endorsement.create({
        fromUser: req.user._id,
        toUser,
        skill,
        message,
      });

    // UPDATE ANALYTICS
    let analytics =
      await ProfileAnalytics.findOne({
        user: toUser,
      });

    if (!analytics) {
      analytics =
        await ProfileAnalytics.create({
          user: toUser,
        });
    }

    analytics.endorsementsCount += 1;

    await analytics.save();

    res.status(201).json(endorsement);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET USER ENDORSEMENTS
const getUserEndorsements =
  async (req, res) => {
    try {

      const endorsements =
        await Endorsement.find({
          toUser: req.params.userId,
        })
          .populate(
            "fromUser",
            "name username"
          )
          .sort({ createdAt: -1 });

      res.json(endorsements);

    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };

module.exports = {
  createEndorsement,
  getUserEndorsements,
};