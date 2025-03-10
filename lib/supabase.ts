"use client";

import { createClient } from '@supabase/supabase-js';

// Get the environment variables
const supabaseUrl = 'https://zzmgvdecorrxanstafwn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6bWd2ZGVjb3JyeGFuc3RhZnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5OTc4MzgsImV4cCI6MjA1NjU3MzgzOH0.wFYVZta3j4TRvsNq6rVj4tdDIgJFxEN7QMkY6ebL22Y';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type Document = {
  id: string;
  user_id: string;
  name: string;
  type: 'invoice' | 'quote' | 'cv' | 'cover-letter';
  content: any;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'premium' | 'payg';
  documents_created_this_month: number;
  subscription_renewal_date?: string;
  credits?: number;
};

export type CreditTransaction = {
  id: string;
  user_id: string;
  amount: number;
  type: 'purchase' | 'usage';
  description: string;
  created_at: string;
};

// Helper functions for database operations
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data as Profile;
}

export async function getUserDocuments(userId: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Document[];
}

export async function saveDocument(userId: string, document: Omit<Document, 'id' | 'user_id' | 'created_at' | 'updated_at'>, documentId?: string) {
  // If documentId is provided, update the existing document
  if (documentId) {
    const { data, error } = await supabase
      .from('documents')
      .update({
        name: document.name,
        content: document.content,
      })
      .eq('id', documentId)
      .eq('user_id', userId) // Ensure the user owns this document
      .select()
      .single();
    
    if (error) throw error;
    return data as Document;
  } else {
    // First, increment the document count for the user
    await incrementDocumentCount(userId);
    
    // Then create the document
    const { data, error } = await supabase
      .from('documents')
      .insert([
        { 
          user_id: userId,
          ...document,
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return data as Document;
  }
}

export async function duplicateDocument(userId: string, documentId: string) {
  // First, get the document to duplicate
  const { data: document, error: fetchError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .eq('user_id', userId) // Ensure the user owns this document
    .single();
  
  if (fetchError) throw fetchError;
  
  if (!document) {
    throw new Error("Document not found or you don't have permission to access it");
  }
  
  // Check if the user can create a new document (this will throw an error if they can't)
  await incrementDocumentCount(userId);
  
  // Create a copy with a new name
  const { data: newDocument, error: insertError } = await supabase
    .from('documents')
    .insert([
      { 
        user_id: userId,
        name: `${document.name} (Copy)`,
        type: document.type,
        content: document.content
      }
    ])
    .select()
    .single();
  
  if (insertError) throw insertError;
  return newDocument as Document;
}

async function updateDocument(documentId: string, updates: Partial<Document>) {
  const { data, error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', documentId)
    .select()
    .single();
  
  if (error) throw error;
  return data as Document;
}

async function deleteDocument(documentId: string) {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId);
  
  if (error) throw error;
  return true;
}

async function incrementDocumentCount(userId: string) {
  // First get the current count
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('documents_created_this_month, subscription_tier, credits')
    .eq('id', userId)
    .single();
  
  if (fetchError) throw fetchError;
  
  // Only increment for free tier users
  if (profile?.subscription_tier === 'free') {
    // Check if they've reached their limit
    if ((profile?.documents_created_this_month || 0) >= 3) {
      throw new Error("You've reached your monthly limit of 3 free documents. Please upgrade to Premium or wait until next month.");
    }
    
    // Then increment it
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        documents_created_this_month: (profile?.documents_created_this_month || 0) + 1 
      })
      .eq('id', userId);
    
    if (updateError) throw updateError;
  } else if (profile?.subscription_tier === 'payg') {
    // For pay-as-you-go users, deduct a credit
    if ((profile?.credits || 0) <= 0) {
      throw new Error("Insufficient credits. Please purchase more credits to continue.");
    }
    
    // Deduct a credit
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        credits: (profile?.credits || 0) - 1 
      })
      .eq('id', userId);
    
    if (updateError) throw updateError;
    
    // Record the transaction
    await recordCreditTransaction(userId, -1, 'usage', 'Document creation');
  }
  
  return true;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data as Profile;
}

export async function deleteUserAccount(userId: string) {
  const { data, error } = await supabase
    .rpc('delete_user_account', { target_user_id: userId });
  
  if (error) throw error;
  return data;
}

export async function uploadAvatar(userId: string, file: File) {
  // Create a unique file name
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;
  
  // Upload the file to Supabase storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);
  
  if (uploadError) throw uploadError;
  
  // Get the public URL
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);
  
  // Update the user's metadata with the avatar URL
  const { error: updateError } = await supabase.auth.updateUser({
    data: { avatar_url: data.publicUrl }
  });
  
  if (updateError) throw updateError;
  
  return data.publicUrl;
}

// Credit system functions
export async function purchaseCredits(userId: string, amount: number) {
  // Get current profile
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single();
  
  if (fetchError) throw fetchError;
  
  // Update credits
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      credits: (profile?.credits || 0) + amount 
    })
    .eq('id', userId);
  
  if (updateError) throw updateError;
  
  // Record the transaction
  await recordCreditTransaction(userId, amount, 'purchase', 'Credit purchase');
  
  return true;
}

async function recordCreditTransaction(userId: string, amount: number, type: 'purchase' | 'usage', description: string) {
  const { error } = await supabase
    .from('credit_transactions')
    .insert([
      { 
        user_id: userId,
        amount,
        type,
        description
      }
    ]);
  
  if (error) throw error;
  return true;
}

export async function getUserCreditTransactions(userId: string) {
  const { data, error } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as CreditTransaction[];
}