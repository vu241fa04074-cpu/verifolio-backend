const mongoose = require(
  "mongoose"
);

const projectSchema =
  new mongoose.Schema(
    {
      user: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,
      },

      title: {
        type: String,

        required: true,

        trim: true,

        minlength: 3,

        maxlength: 100,
      },

      description: {
        type: String,

        required: true,

        trim: true,

        minlength: 10,

        maxlength: 1000,
      },

      technologies: [
        {
          type: String,

          trim: true,
        },
      ],

      githubLink: {
        type: String,

        trim: true,

        default: "",
      },

      liveLink: {
        type: String,

        trim: true,

        default: "",
      },

      proofFile: {
        type: String,

        default: "",
      },

      verified: {
        type: Boolean,

        default: false,
      },
    },

    {
      timestamps: true,
    }
  );
projectSchema.index(
  {
    user:1,
  });
projectSchema.index({
  title: 1,
});
module.exports =
  mongoose.model(
    "Project",
    projectSchema
  );