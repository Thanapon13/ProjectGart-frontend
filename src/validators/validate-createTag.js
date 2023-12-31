import Joi from "joi";

const createTagSchema = Joi.object({
  TagName: Joi.string().trim().messages({
    "string.empty": "tag name is required"
  }),
  image: Joi.array()
    .items(
      Joi.object({
        image: Joi.any()
          .required()
          .messages({ "any.required": "image is required" })
      })
    )
    .required()
    .messages({
      "array.base": "image is required"
    })
});

const validateCreateTag = input => {
  const { error } = createTagSchema.validate(input, {
    abortEarly: false
  });

  if (error) {
    const result = error.details.reduce((acc, el) => {
      acc[el.path[0]] = el.message;
      return acc;
    }, {});
    return result;
  }
};

export default validateCreateTag;
