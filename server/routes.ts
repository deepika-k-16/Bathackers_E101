import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { OpenAI } from "openai";

// === LOGIC ENGINE (Ported from Spec) ===

function calculateResourceScore(budget: string, time: string) {
  let budgetScore = 0;
  if (budget === "low") budgetScore = 1;
  if (budget === "medium") budgetScore = 2;

  let timeScore = 0;
  if (time === "5-10 hrs") timeScore = 1;
  if (time === "> 10 hrs") timeScore = 2;

  return {
    budgetScore,
    timeScore,
    growthCapacity: budgetScore + timeScore
  };
}

function determineGrowthStrategy(gc: number) {
  if (gc <= 1) {
    return {
      strategyName: "Lean Growth & Collaboration",
      actions: [
        { action: "Focus on organic posting (2 posts/week)", avoid: "Paid ads", reason: "Budget/Time is tight. Consistency > Frequency." },
        { action: "Seek collaborations", avoid: "Solo paid campaigns", reason: "Leverage other's audiences for free." }
      ]
    };
  } else if (gc <= 3) {
    return {
      strategyName: "Consistent Organic Growth",
      actions: [
        { action: "Post 3-5 times/week", avoid: "Sporadic posting", reason: "You have time to build momentum." },
        { action: "Engage with community daily", avoid: "Automated bots", reason: "Authentic engagement drives retention." }
      ]
    };
  } else {
    return {
      strategyName: "Aggressive Hybrid Growth",
      actions: [
        { action: "Combine Paid Ads + Organic", avoid: "Relying solely on organic", reason: "You have resources to scale faster." },
        { action: "Experiment with video content", avoid: "Low quality images", reason: "High effort content yields high reward." }
      ]
    };
  }
}

function recommendPlatforms(audience: string, category: string, timeConstraint: string) {
  const recommendations = [];
  
  // Instagram
  let igScore = 0;
  if (audience === "young" || audience === "general") igScore += 2;
  if (category === "clothing" || category === "food") igScore += 2;
  if (timeConstraint !== "< 5 hrs") igScore += 1; // Needs time
  recommendations.push({ platform: "Instagram", suitabilityScore: igScore, reason: "Visual & Audience fit" });

  // WhatsApp
  let waScore = 0;
  if (audience === "local") waScore += 3;
  if (category === "services" || category === "food") waScore += 2;
  recommendations.push({ platform: "WhatsApp Business", suitabilityScore: waScore, reason: "Direct local retention" });

  // Marketplace
  let mpScore = 0;
  if (category === "clothing" || category === "electronics") mpScore += 3;
  if (audience === "general") mpScore += 1;
  recommendations.push({ platform: "Online Marketplace", suitabilityScore: mpScore, reason: "Product discovery" });

  return recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
}

function findMatches(target: any, allVendors: any[]) {
  return allVendors
    .filter(v => v.id !== target.id)
    .map(v => {
      let score = 0;
      let reasons = [];
      
      // Same audience
      if (v.targetAudience === target.targetAudience) {
        score += 1;
        reasons.push("Shares same target audience");
      }
      
      // Complementary category (simple logic: not same category)
      if (v.businessCategory !== target.businessCategory) {
        score += 1;
        reasons.push("Complementary business category");
      }
      
      // Same goal
      if (v.growthGoal === target.growthGoal) {
        score += 1;
        reasons.push("Aligned growth goals");
      }

      return { vendor: v, matchScore: score, reasons };
    })
    .filter(m => m.matchScore >= 2)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
}

// === API ROUTES ===

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Vendor Routes
  app.get(api.vendors.list.path, async (req, res) => {
    const vendors = await storage.getVendors();
    res.json(vendors);
  });

  app.get(api.vendors.get.path, async (req, res) => {
    const vendor = await storage.getVendor(Number(req.params.id));
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    res.json(vendor);
  });

  app.post(api.vendors.create.path, async (req, res) => {
    try {
      const input = api.vendors.create.input.parse(req.body);
      const vendor = await storage.createVendor(input);
      res.status(201).json(vendor);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.vendors.getDashboard.path, async (req, res) => {
    const vendor = await storage.getVendor(Number(req.params.id));
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const resourceScore = calculateResourceScore(vendor.budget, vendor.timeAvailability);
    const growthStrategy = determineGrowthStrategy(resourceScore.growthCapacity);
    const platformRecommendations = recommendPlatforms(vendor.targetAudience, vendor.businessCategory, vendor.timeAvailability);

    res.json({
      vendor,
      resourceScore,
      growthStrategy: { ...growthStrategy, score: resourceScore },
      platformRecommendations
    });
  });

  app.get(api.vendors.getMatches.path, async (req, res) => {
    const vendor = await storage.getVendor(Number(req.params.id));
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    
    const allVendors = await storage.getVendors();
    const matches = findMatches(vendor, allVendors);
    
    res.json(matches);
  });

  // Collaboration Routes
  app.get(api.collaboration.list.path, async (req, res) => {
    const { vendorId, type } = req.query;
    const requests = await storage.getCollaborationRequests(
      vendorId ? Number(vendorId) : undefined,
      type as 'sent' | 'received'
    );
    res.json(requests);
  });

  app.post(api.collaboration.create.path, async (req, res) => {
    try {
      const input = api.collaboration.create.input.parse(req.body);
      const request = await storage.createCollaborationRequest(input);
      res.status(201).json(request);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.message });
      throw err;
    }
  });

  app.patch(api.collaboration.updateStatus.path, async (req, res) => {
    const { status } = req.body;
    const request = await storage.updateCollaborationRequestStatus(Number(req.params.id), status);
    res.json(request);
  });

  // Expansion Routes
  app.get(api.expansion.list.path, async (req, res) => {
    const requests = await storage.getExpansionRequests();
    res.json(requests);
  });

  app.post(api.expansion.create.path, async (req, res) => {
    const input = api.expansion.create.input.parse(req.body);
    const request = await storage.createExpansionRequest(input);
    res.status(201).json(request);
  });

  // AI Content Route
  app.post(api.ai.generateContent.path, async (req, res) => {
    try {
      const { topic, platform, tone } = req.body;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const prompt = `
        Act as a social media expert for small vendors. 
        Generate a caption, 5-10 relevant hashtags, and a brief explanation of why this content works.
        
        Topic: ${topic}
        Platform: ${platform}
        Tone: ${tone || "Professional yet engaging"}
        
        Return JSON format: { "caption": "...", "hashtags": ["..."], "explanation": "..." }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const content = JSON.parse(response.choices[0].message.content || "{}");
      res.json(content);
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ message: "Failed to generate content" });
    }
  });

  return httpServer;
}

// Seed Data (Simulating a running app state)
async function seed() {
  const vendors = await storage.getVendors();
  if (vendors.length === 0) {
    console.log("Seeding database...");
    
    const v1 = await storage.createVendor({
      businessName: "Mama's Bakery",
      businessCategory: "food",
      targetAudience: "local",
      budget: "low",
      timeAvailability: "> 10 hrs",
      growthGoal: "sales",
      bio: "Freshly baked goods every morning."
    });

    const v2 = await storage.createVendor({
      businessName: "Urban Threads",
      businessCategory: "clothing",
      targetAudience: "young",
      budget: "medium",
      timeAvailability: "5-10 hrs",
      growthGoal: "visibility",
      bio: "Streetwear for the modern soul."
    });

    const v3 = await storage.createVendor({
      businessName: "Tech Fix",
      businessCategory: "services",
      targetAudience: "general",
      budget: "zero",
      timeAvailability: "< 5 hrs",
      growthGoal: "expansion",
      bio: "Fast and reliable phone repairs."
    });

    await storage.createExpansionRequest({
      vendorId: v3.id,
      pitch: "Looking to open a second kiosk downtown. Need a partner for shared rent.",
      supportType: "partner"
    });
    
    console.log("Seeding complete.");
  }
}

// Run seed on startup (async)
seed().catch(console.error);
