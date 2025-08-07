import { Router } from "express";
import prisma from "../prismaClient";

const router = Router();

router.post("/email", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email } });
  }

  const token = `mock-token-${user.id}`;
  res.json({ token, user });
});

export default router;
