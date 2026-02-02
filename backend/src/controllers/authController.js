import { findUserByEmail, findUserById } from "../services/users.js";
import { verifyPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user || !user.is_active) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = signToken({
      id: user.id,
      role: user.role,
      email: user.email,
      branchId: user.branch_id,
    });
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
        branchId: user.branch_id,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
}
