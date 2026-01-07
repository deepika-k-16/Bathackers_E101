import { db } from "./db";
import {
  vendors,
  collaborationRequests,
  expansionRequests,
  type InsertVendor,
  type InsertCollaborationRequest,
  type InsertExpansionRequest,
  type Vendor,
  type CollaborationRequest,
  type ExpansionRequest
} from "@shared/schema";
import { eq, or, desc } from "drizzle-orm";

export interface IStorage {
  // Vendors
  getVendor(id: number): Promise<Vendor | undefined>;
  getVendors(): Promise<Vendor[]>; // For matching
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  
  // Collaboration
  getCollaborationRequests(vendorId?: number, type?: 'sent' | 'received'): Promise<(CollaborationRequest & { fromVendor?: Vendor, toVendor?: Vendor })[]>;
  createCollaborationRequest(request: InsertCollaborationRequest): Promise<CollaborationRequest>;
  updateCollaborationRequestStatus(id: number, status: string): Promise<CollaborationRequest>;

  // Expansion
  getExpansionRequests(): Promise<(ExpansionRequest & { vendor?: Vendor })[]>;
  createExpansionRequest(request: InsertExpansionRequest): Promise<ExpansionRequest>;
}

export class DatabaseStorage implements IStorage {
  async getVendor(id: number): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor;
  }

  async getVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors);
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [newVendor] = await db.insert(vendors).values(vendor).returning();
    return newVendor;
  }

  async getCollaborationRequests(vendorId?: number, type?: 'sent' | 'received'): Promise<(CollaborationRequest & { fromVendor?: Vendor, toVendor?: Vendor })[]> {
    let query = db.query.collaborationRequests.findMany({
      with: {
        fromVendor: true,
        toVendor: true
      },
      orderBy: [desc(collaborationRequests.createdAt)]
    });

    if (vendorId) {
      if (type === 'sent') {
        return await db.query.collaborationRequests.findMany({
          where: eq(collaborationRequests.fromVendorId, vendorId),
          with: { fromVendor: true, toVendor: true },
          orderBy: [desc(collaborationRequests.createdAt)]
        });
      } else if (type === 'received') {
        return await db.query.collaborationRequests.findMany({
          where: eq(collaborationRequests.toVendorId, vendorId),
          with: { fromVendor: true, toVendor: true },
          orderBy: [desc(collaborationRequests.createdAt)]
        });
      } else {
        return await db.query.collaborationRequests.findMany({
          where: or(
            eq(collaborationRequests.fromVendorId, vendorId),
            eq(collaborationRequests.toVendorId, vendorId)
          ),
          with: { fromVendor: true, toVendor: true },
          orderBy: [desc(collaborationRequests.createdAt)]
        });
      }
    }

    return await query;
  }

  async createCollaborationRequest(request: InsertCollaborationRequest): Promise<CollaborationRequest> {
    const [newRequest] = await db.insert(collaborationRequests).values(request).returning();
    return newRequest;
  }

  async updateCollaborationRequestStatus(id: number, status: string): Promise<CollaborationRequest> {
    const [updated] = await db.update(collaborationRequests)
      .set({ status })
      .where(eq(collaborationRequests.id, id))
      .returning();
    return updated;
  }

  async getExpansionRequests(): Promise<(ExpansionRequest & { vendor?: Vendor })[]> {
    return await db.query.expansionRequests.findMany({
      with: { vendor: true },
      orderBy: [desc(expansionRequests.createdAt)]
    });
  }

  async createExpansionRequest(request: InsertExpansionRequest): Promise<ExpansionRequest> {
    const [newRequest] = await db.insert(expansionRequests).values(request).returning();
    return newRequest;
  }
}

export const storage = new DatabaseStorage();
