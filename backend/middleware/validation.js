import { body, validationResult } from 'express-validator';

export const validate = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

export const signupValidation = [
  body('fullName')
    .trim()
    .matches(/^[A-Za-z\s]{3,}$/)
    .withMessage('Full name must be at least 3 characters and contain only letters and spaces'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[A-Z])(?=.*[0-9])/)
    .withMessage('Password must be at least 8 characters and include at least one uppercase letter and one number'),
  body('phone')
    .matches(/^(98|97)[0-9]{8}$/)
    .withMessage('Phone number must be a valid Nepal number starting with 98 or 97')
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

