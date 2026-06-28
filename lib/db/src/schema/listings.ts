import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const listingsTable = pgTable("listings", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  gender: text("gender").notNull(),
  area: text("area").notNull(),
  gali: text("gali").notNull(),
  landmark: text("landmark").notNull(),
  mapsLink: text("maps_link"),
  rent: integer("rent").notNull(),
  deposit: integer("deposit").notNull(),
  roomType: text("room_type").notNull(),
  ownerName: text("owner_name").notNull(),
  ownerPhone: text("owner_phone").notNull(),
  alternatePhone: text("alternate_phone"),
  verificationStatus: text("verification_status").notNull().default("unverified"),
  aadhaarImageUrl: text("aadhaar_image_url"),
  escrowEnabled: boolean("escrow_enabled").notNull().default(false),
  amenities: text("amenities").array().notNull().default([]),
  securityFeatures: text("security_features").array().notNull().default([]),
  curfewTime: text("curfew_time").notNull().default("No Curfew"),
  guestPolicy: text("guest_policy").notNull().default("Open"),
  smokingAllowed: boolean("smoking_allowed").notNull().default(false),
  alcoholAllowed: boolean("alcohol_allowed").notNull().default(false),
  nonVegAllowed: boolean("non_veg_allowed").notNull().default(true),
  photos: text("photos").array().notNull().default([]),
  visitCount: integer("visit_count").notNull().default(0),
  fraudReportCount: integer("fraud_report_count").notNull().default(0),
  rating: integer("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  isHidden: boolean("is_hidden").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertListingSchema = createInsertSchema(listingsTable).omit({ createdAt: true });
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;
