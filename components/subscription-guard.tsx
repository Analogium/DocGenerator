"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getUserProfile } from "@/lib/supabase";
import { canCreateDocument } from "@/lib/subscription";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [canAccess, setCanAccess] = useState(false);
  const [limitReason, setLimitReason] = useState<string | undefined>(undefined);
  const { t } = useTranslation();

  useEffect(() => {
    async function checkSubscription() {
      if (!user) {
        setCanAccess(false);
        setIsLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(user.id);
        const { canCreate, reason } = canCreateDocument(profile);
        
        setCanAccess(canCreate);
        setLimitReason(reason);
      } catch (error) {
        console.error("Error checking subscription:", error);
        setCanAccess(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkSubscription();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 container py-8 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{t('subscription.guard.signInRequired.title')}</CardTitle>
              <CardDescription>
                {t('subscription.guard.signInRequired.message')}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full" onClick={() => router.push("/login")}>
                {t('subscription.guard.signInRequired.button')}
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 container py-8 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {limitReason === 'limit-reached' 
                  ? t('subscription.guard.limitReached.title')
                  : limitReason === 'no-credits'
                    ? t('subscription.guard.noCredits.title')
                    : t('subscription.guard.generic.title')}
              </CardTitle>
              <CardDescription>
                {limitReason === 'limit-reached' 
                  ? t('subscription.guard.limitReached.message')
                  : limitReason === 'no-credits'
                    ? t('subscription.guard.noCredits.message')
                    : t('subscription.guard.generic.message')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {limitReason === 'limit-reached'
                  ? t('subscription.guard.limitReached.upgrade')
                  : limitReason === 'no-credits'
                    ? t('subscription.guard.noCredits.purchase')
                    : t('subscription.guard.generic.message')}
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              {limitReason === 'no-credits' ? (
                <Button className="w-full" onClick={() => router.push("/credits")}>
                  {t('subscription.guard.noCredits.purchaseButton')}
                </Button>
              ) : (
                <Button className="w-full" onClick={() => router.push("/pricing")}>
                  {t('subscription.guard.limitReached.upgradeButton')}
                </Button>
              )}
              <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard")}>
                {t('subscription.guard.limitReached.dashboardButton')}
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }

  return <>{children}</>;
}