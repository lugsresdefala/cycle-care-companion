import { Router, type IRouter } from "express";
import healthRouter from "./health";
import meRouter from "./me";
import patientsRouter from "./patients";
import examsRouter from "./exams";
import plansRouter from "./plans";
import subscriptionRouter from "./subscription";
import stripeRouter from "./stripe";
import adminRouter from "./admin";
import calculateRouter from "./calculate";

const router: IRouter = Router();

router.use(healthRouter);
router.use(meRouter);
router.use(patientsRouter);
router.use(examsRouter);
router.use(plansRouter);
router.use(subscriptionRouter);
router.use(stripeRouter);
router.use(adminRouter);
router.use(calculateRouter);

export default router;
