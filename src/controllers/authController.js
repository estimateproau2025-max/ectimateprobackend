const dayjs = require("dayjs");
const { body } = require("express-validator");
const Builder = require("../models/Builder");
const config = require("../config");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  generateRandomToken,
  hashToken,
} = require("../utils/tokens");
const { sendEmail } = require("../services/emailService");

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

const registerValidators = [
  body("businessName").notEmpty().withMessage("Business name is required"),
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 8 }).withMessage("Password too short"),
];

const loginValidators = [
  body("email").isEmail(),
  body("password").notEmpty(),
];

const refreshValidators = [body("refreshToken").notEmpty()];

const passwordResetRequestValidators = [body("email").isEmail()];

const passwordResetValidators = [
  body("token").notEmpty(),
  body("password").isLength({ min: 8 }),
];

function mapBuilderResponse(builder) {
  return {
    id: builder._id,
    businessName: builder.businessName,
    contactName: builder.contactName,
    email: builder.email,
    phone: builder.phone,
    role: builder.role,
    surveySlug: builder.surveySlug,
    trialEndsAt: builder.trialEndsAt,
    subscriptionStatus: builder.subscriptionStatus,
    hasPaymentMethod: builder.hasPaymentMethod,
    lastLoginAt: builder.lastLoginAt,
    createdAt: builder.createdAt,
  };
}

async function createBuilderAccount({
  businessName,
  contactName,
  email,
  password,
  phone,
}) {
  const lowerEmail = email.toLowerCase();
  const existing = await Builder.findOne({ email: lowerEmail });
  if (existing) {
    const error = new Error("Email already exists");
    error.status = 409;
    throw error;
  }

  const safeBusinessName =
    (businessName && businessName.trim()) ||
    lowerEmail.split("@")[0] ||
    "New Builder";
  const safeContactName =
    (contactName && contactName.trim()) || safeBusinessName;

  const trialEndsAt = dayjs().add(3, "month").toDate();
  const role =
    lowerEmail === (config.admin.email || "") ? "admin" : "builder";

  const builder = await Builder.create({
    businessName: safeBusinessName,
    email: lowerEmail,
    contactName: safeContactName,
    password,
    phone,
    role,
    trialEndsAt,
    subscriptionStatus: "trialing",
  });

  return builder;
}

async function issueSessionTokens(builder) {
  const validTokens = (builder.refreshTokens || []).filter((tokenDoc) =>
    dayjs(tokenDoc.expiresAt).isAfter(dayjs())
  );

  const accessToken = signAccessToken({ id: builder._id, role: builder.role });
  const refreshToken = signRefreshToken({ id: builder._id });
  validTokens.push({
    token: hashToken(refreshToken),
    expiresAt: dayjs().add(30, "day").toDate(),
  });

  builder.refreshTokens = validTokens.slice(-5);
  builder.lastLoginAt = new Date();
  await builder.save();

  return { accessToken, refreshToken };
}

async function rotateRefreshSession(refreshTokenValue) {
  const payload = verifyRefreshToken(refreshTokenValue);
  const builder = await Builder.findById(payload.id);
  if (!builder) {
    const error = new Error("Invalid token");
    error.status = 401;
    throw error;
  }

  const hashedRefresh = hashToken(refreshTokenValue);
  const storedToken = builder.refreshTokens.find(
    (tokenDoc) => tokenDoc.token === hashedRefresh
  );

  if (!storedToken || dayjs(storedToken.expiresAt).isBefore(dayjs())) {
    const error = new Error("Token expired");
    error.status = 401;
    throw error;
  }

  const accessToken = signAccessToken({
    id: builder._id,
    role: builder.role,
  });
  const newRefreshToken = signRefreshToken({ id: builder._id });
  storedToken.token = hashToken(newRefreshToken);
  storedToken.expiresAt = dayjs().add(30, "day").toDate();
  builder.lastLoginAt = new Date();
  await builder.save();

  return {
    builder,
    accessToken,
    refreshToken: newRefreshToken,
  };
}

function buildSupabaseUser(builder) {
  return {
    id: builder._id.toString(),
    email: builder.email,
    phone: builder.phone || null,
    app_metadata: {
      provider: "email",
      providers: ["email"],
    },
    user_metadata: {
      businessName: builder.businessName,
      role: builder.role,
      surveySlug: builder.surveySlug,
    },
    aud: "authenticated",
    role: builder.role,
    created_at: builder.createdAt?.toISOString() || new Date().toISOString(),
    updated_at: builder.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

function buildSupabaseResponse(builder, tokens) {
  return {
    access_token: tokens.accessToken,
    token_type: "bearer",
    expires_in: ACCESS_TOKEN_TTL_SECONDS,
    refresh_token: tokens.refreshToken,
    expires_at: dayjs().add(ACCESS_TOKEN_TTL_SECONDS, "second").unix(),
    user: buildSupabaseUser(builder),
  };
}

function supabaseError(res, status, error, description) {
  return res.status(status).json({
    error,
    error_description: description,
  });
}

async function register(req, res) {
  try {
    const builder = await createBuilderAccount({
      businessName: req.body.businessName,
      contactName: req.body.contactName || req.body.businessName,
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
    });
    const tokens = await issueSessionTokens(builder);
    res.status(201).json({
      builder: mapBuilderResponse(builder),
      tokens,
    });
  } catch (error) {
    if (error.status === 409) {
      return res.status(409).json({ message: error.message });
    }
    console.error("Register failed", error);
    return res.status(500).json({ message: "Unable to register" });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  const builder = await Builder.findOne({ email: email.toLowerCase() });
  if (!builder) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const passwordMatch = await builder.comparePassword(password);
  if (!passwordMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (builder.isAccessDisabled) {
    return res.status(403).json({ message: "Account disabled" });
  }

  const tokens = await issueSessionTokens(builder);

  res.json({
    builder: mapBuilderResponse(builder),
    tokens,
  });
}

async function refresh(req, res) {
  const { refreshToken } = req.body;
  try {
    const { builder, accessToken, refreshToken: rotatedToken } =
      await rotateRefreshSession(refreshToken);
    res.json({
      builder: mapBuilderResponse(builder),
      tokens: { accessToken, refreshToken: rotatedToken },
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
}

async function logout(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken || !req.user) {
    return res.status(400).json({ message: "Refresh token required" });
  }

  const hashedRefresh = hashToken(refreshToken);
  req.user.refreshTokens = req.user.refreshTokens.filter(
    (tokenDoc) => tokenDoc.token !== hashedRefresh
  );
  await req.user.save();
  res.json({ message: "Logged out" });
}

async function requestPasswordReset(req, res) {
  const { email } = req.body;
  const builder = await Builder.findOne({ email: email.toLowerCase() });
  if (!builder) {
    return res.json({ message: "If the email exists, a link was sent" });
  }

  const resetToken = generateRandomToken();
  builder.passwordResetToken = hashToken(resetToken);
  builder.passwordResetExpires = dayjs().add(1, "hour").toDate();
  await builder.save();

  const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}&email=${email}`;

  await sendEmail({
    to: builder.email,
    subject: "Reset your EstiMate Pro password",
    html: `<p>Use the link below to reset your password:</p>
      <p><a href="${resetUrl}" target="_blank">${resetUrl}</a></p>
      <p>This link expires in 1 hour.</p>`,
  });

  res.json({ message: "If the email exists, a link was sent" });
}

async function resetPassword(req, res) {
  const { token, password } = req.body;
  const hashed = hashToken(token);
  const builder = await Builder.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!builder) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  builder.password = password;
  builder.passwordResetToken = undefined;
  builder.passwordResetExpires = undefined;
  await builder.save();

  res.json({ message: "Password updated" });
}

async function supabaseSignup(req, res) {
  const { email, password, data = {}, phone } = req.body;
  if (!email || !password) {
    return supabaseError(
      res,
      400,
      "invalid_request",
      "Email and password are required"
    );
  }

  const derivedBusinessName =
    data.businessName ||
    data.full_name ||
    req.body.businessName ||
    email.split("@")[0];

  try {
    const builder = await createBuilderAccount({
      businessName: derivedBusinessName,
      contactName: data.full_name || derivedBusinessName,
      email,
      password,
      phone: phone || data.phone,
    });
    const tokens = await issueSessionTokens(builder);
    return res.status(200).json(buildSupabaseResponse(builder, tokens));
  } catch (error) {
    if (error.status === 409) {
      return supabaseError(
        res,
        400,
        "user_already_exists",
        "User already registered"
      );
    }
    console.error("Supabase signup failed", error);
    return supabaseError(
      res,
      500,
      "server_error",
      "Unable to complete signup"
    );
  }
}

async function supabaseToken(req, res) {
  const grantType = (
    req.query.grant_type ||
    req.body.grant_type ||
    ""
  ).toLowerCase();

  if (grantType === "password") {
    const { email, password } = req.body;
    if (!email || !password) {
      return supabaseError(
        res,
        400,
        "invalid_request",
        "Email and password are required"
      );
    }
    const builder = await Builder.findOne({ email: email.toLowerCase() });
    if (!builder) {
      return supabaseError(
        res,
        400,
        "invalid_grant",
        "Invalid login credentials"
      );
    }
    const passwordMatch = await builder.comparePassword(password);
    if (!passwordMatch) {
      return supabaseError(
        res,
        400,
        "invalid_grant",
        "Invalid login credentials"
      );
    }
    if (builder.isAccessDisabled) {
      return supabaseError(
        res,
        403,
        "access_denied",
        "Account is disabled"
      );
    }
    const tokens = await issueSessionTokens(builder);
    return res.json(buildSupabaseResponse(builder, tokens));
  }

  if (grantType === "refresh_token") {
    const { refresh_token: refreshToken } = req.body;
    if (!refreshToken) {
      return supabaseError(
        res,
        400,
        "invalid_request",
        "Refresh token is required"
      );
    }
    try {
      const { builder, accessToken, refreshToken: rotatedToken } =
        await rotateRefreshSession(refreshToken);
      return res.json(
        buildSupabaseResponse(builder, {
          accessToken,
          refreshToken: rotatedToken,
        })
      );
    } catch (error) {
      return supabaseError(
        res,
        401,
        "invalid_grant",
        "Refresh token invalid or expired"
      );
    }
  }

  return supabaseError(
    res,
    400,
    "unsupported_grant_type",
    "grant_type must be password or refresh_token"
  );
}

module.exports = {
  registerValidators,
  loginValidators,
  refreshValidators,
  passwordResetRequestValidators,
  passwordResetValidators,
  register,
  login,
  refresh,
  logout,
  requestPasswordReset,
  resetPassword,
  supabaseSignup,
  supabaseToken,
};

