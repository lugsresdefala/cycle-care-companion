import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const planTierEnum = pgEnum("plan_tier", [
  "free_trial",
  "basic",
  "professional",
  "premium",
]);

export const calculationTypeEnum = pgEnum("calculation_type", [
  "biometry",
  "bpd",
  "crl",
  "efw",
  "doppler",
  "growth_curve",
  "gestational",
  "fertility",
  "preeclampsia_risk",
  "trisomy_risk",
]);

export const appRoleEnum = pgEnum("app_role", ["admin", "user"]);

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull().default(""),
  specialty: text("specialty").default("Obstetrícia"),
  crmNumber: text("crm_number").default(""),
  phone: text("phone").default(""),
  email: text("email").default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const patients = pgTable(
  "patients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    doctorId: text("doctor_id").notNull(),
    name: text("name").notNull(),
    age: integer("age"),
    medicalRecordId: text("medical_record_id").default(""),
    notes: text("notes").default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_patients_doctor").on(t.doctorId)],
);

export const examHistory = pgTable(
  "exam_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    doctorId: text("doctor_id").notNull(),
    patientId: uuid("patient_id"),
    calcType: calculationTypeEnum("calc_type").notNull(),
    inputData: jsonb("input_data").notNull().default({}),
    resultData: jsonb("result_data").notNull().default({}),
    gestationalAgeWeeks: integer("gestational_age_weeks"),
    gestationalAgeDays: integer("gestational_age_days"),
    notes: text("notes").default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_exam_history_doctor").on(t.doctorId),
    index("idx_exam_history_patient").on(t.patientId),
  ],
);

export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  tier: planTierEnum("tier").notNull().unique(),
  description: text("description").default(""),
  priceCents: integer("price_cents").notNull().default(0),
  durationMonths: integer("duration_months").notNull().default(1),
  tokensPerPeriod: integer("tokens_per_period").notNull().default(0),
  features: jsonb("features").notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  stripePriceId: text("stripe_price_id").default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userSubscriptions = pgTable(
  "user_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    doctorId: text("doctor_id").notNull(),
    planId: uuid("plan_id").notNull(),
    status: text("status").notNull().default("active"),
    startDate: timestamp("start_date", { withTimezone: true }).notNull().defaultNow(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
    tokensRemaining: integer("tokens_remaining").notNull().default(0),
    tokensUsed: integer("tokens_used").notNull().default(0),
    stripeCustomerId: text("stripe_customer_id").default(""),
    stripeSubscriptionId: text("stripe_subscription_id").default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_user_subscriptions_doctor").on(t.doctorId),
    index("idx_user_subscriptions_status").on(t.status, t.endDate),
  ],
);

export const userRoles = pgTable(
  "user_roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    role: appRoleEnum("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("user_roles_user_role_unique").on(t.userId, t.role)],
);

export const stripeWebhookEvents = pgTable(
  "stripe_webhook_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: text("event_id").notNull().unique(),
    eventType: text("event_type").notNull(),
    payloadCreatedAt: timestamp("payload_created_at", { withTimezone: true }),
    processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_stripe_webhook_events_type").on(t.eventType, t.processedAt)],
);

export const stripeCheckoutAttempts = pgTable(
  "stripe_checkout_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    doctorId: text("doctor_id").notNull(),
    priceId: text("price_id").notNull(),
    sessionId: text("session_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_stripe_checkout_attempts_user_time").on(t.doctorId, t.createdAt)],
);
