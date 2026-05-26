import { Router, type IRouter } from "express";
import { db, subscriptionPlans } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/plans", async (_req, res) => {
  const rows = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.isActive, true))
    .orderBy(asc(subscriptionPlans.priceCents));
  res.json(rows);
});

export default router;
