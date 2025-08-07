import { Router } from "express";
import prisma from "../prismaClient";

const router = Router();

router.post("/", async (req, res) => {
  const { title, artist, link, userId } = req.body;
  if (!title || !artist || !link || !userId) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const today = new Date();
  today.setHours(0,0,0,0);

  const existing = await prisma.songPost.findFirst({
    where: {
      userId,
      date: { gte: today }
    }
  });
  if (existing) return res.status(400).json({ error: "Already posted today" });

  const post = await prisma.songPost.create({
    data: { title, artist, link, userId }
  });

  res.json(post);
});

router.get("/today", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  const friends = await prisma.friendship.findMany({
    where: { userId: Number(userId) },
    select: { friendId: true }
  });

  const friendIds = friends.map(f => f.friendId);

  const today = new Date();
  today.setHours(0,0,0,0);

  const posts = await prisma.songPost.findMany({
    where: {
      userId: { in: friendIds },
      date: { gte: today }
    },
    include: { user: true }
  });

  res.json(posts);
});

router.get("/me", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  const posts = await prisma.songPost.findMany({
    where: { userId: Number(userId) },
    orderBy: { date: "desc" }
  });

  res.json(posts);
});

export default router;
