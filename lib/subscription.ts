"use client";

import { Profile } from "./supabase";

type SubscriptionTier = 'free' | 'premium' | 'payg';

interface SubscriptionLimits {
  maxDocumentsPerMonth: number;
  canExport: boolean;
}

// Define limits for each subscription tier
const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    maxDocumentsPerMonth: 3,
    canExport: true,
  },
  premium: {
    maxDocumentsPerMonth: Infinity,
    canExport: true,
  },
  payg: {
    maxDocumentsPerMonth: Infinity, // Pay per document, so no monthly limit
    canExport: true,
  }
};

/**
 * Check if a user can create a new document based on their subscription tier
 * and current usage
 */
export function canCreateDocument(profile: Profile | null): {
  canCreate: boolean;
  reason?: string;
} {
  if (!profile) {
    return { 
      canCreate: false, 
      reason: 'not-authenticated'
    };
  }

  const limits = SUBSCRIPTION_LIMITS[profile.subscription_tier as SubscriptionTier];
  
  // For free tier, check if they've reached their monthly limit
  if (profile.subscription_tier === 'free') {
    if (profile.documents_created_this_month >= limits.maxDocumentsPerMonth) {
      return {
        canCreate: false,
        reason: 'limit-reached',
      };
    }
  }
  
  // For PAYG, they need to have credits
  if (profile.subscription_tier === 'payg') {
    if ((profile.credits || 0) <= 0) {
      return {
        canCreate: false,
        reason: 'no-credits',
      };
    }
  }
  
  return { canCreate: true };
}

/**
 * Check if a user can export a document based on their subscription tier
 */
export function canExportDocument(profile: Profile | null): {
  canExport: boolean;
  reason?: string;
} {
  if (!profile) {
    return { 
      canExport: false, 
      reason: 'not-authenticated'
    };
  }

  const limits = SUBSCRIPTION_LIMITS[profile.subscription_tier as SubscriptionTier];
  
  return { 
    canExport: limits.canExport 
  };
}

/**
 * Get the cost of a document in credits based on subscription tier
 */
function getDocumentCreditCost(tier: SubscriptionTier): number {
  switch (tier) {
    case 'payg':
      return 1; // 1 credit per document
    default:
      return 0; // Free for other tiers
  }
}
