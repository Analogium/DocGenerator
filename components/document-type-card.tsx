"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { getUserProfile } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface DocumentTypeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  createNowText: string;
  isPremiumOnly?: boolean;
}

export function DocumentTypeCard({ 
  title, 
  description, 
  icon, 
  href, 
  createNowText,
  isPremiumOnly = false
}: DocumentTypeCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [canAccess, setCanAccess] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      if (!user) return;
      
      if (isPremiumOnly) {
        try {
          setIsLoading(true);
          const profile = await getUserProfile(user.id);
          
          // Only premium users or users with credits can access premium documents
          setCanAccess(
            profile.subscription_tier === 'premium' || 
            (profile.subscription_tier === 'payg' && (profile.credits || 0) > 0)
          );
        } catch (error) {
          console.error("Error checking access:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    checkAccess();
  }, [user, isPremiumOnly]);

  const handleClick = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (isPremiumOnly && !canAccess) {
      toast({
        title: "Premium Feature",
        description: "This document type requires a premium subscription or credits.",
        variant: "destructive"
      });
      router.push('/pricing');
      return;
    }
    
    router.push(href);
  };

  return (
    <Card className={`h-full transition-all hover:shadow-lg ${isPremiumOnly && !canAccess ? 'opacity-70' : ''}`}>
      <CardHeader className="flex items-center justify-center pt-6">
        {icon}
        <CardTitle className="mt-4">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <CardFooter className="flex justify-center pb-6">
        <Button 
          variant="ghost" 
          className="group-hover:bg-primary group-hover:text-primary-foreground"
          onClick={handleClick}
          disabled={isLoading}
        >
          {createNowText} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}