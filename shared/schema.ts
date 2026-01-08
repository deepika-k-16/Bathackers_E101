import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === TABLE DEFINITIONS ===

export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull(),
  businessCategory: text("business_category").notNull(), // clothing, food, services
  targetAudience: text("target_audience").notNull(), // local, young, general
  budget: text("budget").notNull(), // zero, low, medium
  timeAvailability: text("time_availability").notNull(), // < 5 hrs, 5-10 hrs, > 10 hrs
  growthGoal: text("growth_goal").notNull(), // visibility, sales, expansion

  // ✅ Instagram account (NEW FEATURE)
  instagramUrl: text("instagram_url"), // example: https://instagram.com/urban_threads

  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const collaborationRequests = pgTable("collaboration_requests", {
  id: serial("id").primaryKey(),
  fromVendorId: integer("from_vendor_id").notNull(),
  toVendorId: integer("to_vendor_id").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"), // open, accepted, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const expansionRequests = pgTable("expansion_requests", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull(),
  pitch: text("pitch").notNull(),
  supportType: text("support_type").notNull(), // partner, promotion
  status: text("status").notNull().default("open"), // open, closed
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const collaborationRequestsRelations = relations(
  collaborationRequests,
  ({ one }) => ({
    fromVendor: one(vendors, {
      fields: [collaborationRequests.fromVendorId],
      references: [vendors.id],
      relationName: "fromVendor",
    }),
    toVendor: one(vendors, {
      fields: [collaborationRequests.toVendorId],
      references: [vendors.id],
      relationName: "toVendor",
    }),
  })
);

export const expansionRequestsRelations = relations(
  expansionRequests,
  ({ one }) => ({
    vendor: one(vendors, {
      fields: [expansionRequests.vendorId],
      references: [vendors.id],
    }),
  })
);

// === BASE SCHEMAS ===

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
}).extend({
  // ✅ Validate Instagram URL (optional)
  instagramUrl: z
    .string()
    .url("Enter a valid Instagram URL")
    .optional()
    .or(z.literal("")),
});

export const insertCollaborationRequestSchema =
  createInsertSchema(collaborationRequests).omit({
    id: true,
    status: true,
    createdAt: true,
  });

export const insertExpansionRequestSchema =
  createInsertSchema(expansionRequests).omit({
    id: true,
    status: true,
    createdAt: true,
  });

// === TYPES ===

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type UpdateVendorRequest = Partial<InsertVendor>;

export type CollaborationRequest =
  typeof collaborationRequests.$inferSelect;
export type InsertCollaborationRequest = z.infer<
  typeof insertCollaborationRequestSchema
>;

export type ExpansionRequest = typeof expansionRequests.$inferSelect;
export type InsertExpansionRequest = z.infer<
  typeof insertExpansionRequestSchema
>;

// === LOGIC OUTPUT TYPES ===

export interface ResourceScore {
  budgetScore: number;
  timeScore: number;
  growthCapacity: number;
}

export interface GrowthStrategyAction {
  action: string;
  avoid: string;
  reason: string;
}

export interface GrowthStrategy {
  score: ResourceScore;
  strategyName: string;
  actions: GrowthStrategyAction[];
}

export interface PlatformRecommendation {
  platform: string;
  reason: string;
  suitabilityScore: number;
}

export interface ContentGuidanceRequest {
  topic: string;
  platform: string;
  tone?: string;
}

export interface ContentGuidanceResponse {
  caption: string;
  hashtags: string[];
  explanation: string;
}

export interface VendorMatch {
  vendor: Vendor;
  matchScore: number;
  reasons: string[];
}

export interface DashboardData {
  vendor: Vendor;
  resourceScore: ResourceScore;
  growthStrategy: GrowthStrategy;
  platformRecommendations: PlatformRecommendation[];
}
