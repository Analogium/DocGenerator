"use client";

import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import { getUserProfile, purchaseCredits, getUserCreditTransactions, CreditTransaction } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard, Plus, Minus, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

export default function CreditsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [credits, setCredits] = useState(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    async function loadUserData() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const profile = await getUserProfile(user.id);
        setCredits(profile.credits || 0);
        
        const userTransactions = await getUserCreditTransactions(user.id);
        setTransactions(userTransactions);
      } catch (error: any) {
        toast({
          title: "Error loading data",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadUserData();
  }, [user, toast]);

  const handlePurchaseCredits = async (amount: number) => {
    if (!user) return;
    
    try {
      setIsPurchasing(true);
      
      // In a real app, this would integrate with a payment processor
      // For this demo, we'll just add the credits directly
      await purchaseCredits(user.id, amount);
      
      // Update the UI
      setCredits(prev => prev + amount);
      
      // Refresh transactions
      const userTransactions = await getUserCreditTransactions(user.id);
      setTransactions(userTransactions);
      
      toast({
        title: t('credits.purchase.success.title'),
        description: t('credits.purchase.success.message', { amount }),
      });
    } catch (error: any) {
      toast({
        title: t('credits.purchase.error.title'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
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
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{t('credits.title')}</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>{t('credits.balance.title')}</CardTitle>
                  <CardDescription>
                    {t('credits.balance.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-6">
                    <div className="text-center">
                      <p className="text-5xl font-bold">{credits}</p>
                      <p className="text-muted-foreground mt-2">{t('credits.balance.available')}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => router.push("/create/invoice")}
                    disabled={credits <= 0}
                  >
                    {t('credits.balance.createDocument')}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t('credits.purchase.title')}</CardTitle>
                  <CardDescription>
                    {t('credits.purchase.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-2 hover:border-primary transition-colors cursor-pointer">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl">{t('credits.purchase.packages.small.title')}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-3xl font-bold">€4.99</p>
                        <p className="text-muted-foreground">{t('credits.purchase.packages.small.description')}</p>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          onClick={() => handlePurchaseCredits(3)}
                          disabled={isPurchasing}
                        >
                          {isPurchasing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('common.processing')}
                            </>
                          ) : (
                            <>
                              <CreditCard className="mr-2 h-4 w-4" /> {t('credits.purchase.buyButton')}
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card className="border-2 border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-xl">{t('credits.purchase.packages.medium.title')}</CardTitle>
                          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                            {t('credits.purchase.bestValue')}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-3xl font-bold">€9.99</p>
                        <p className="text-muted-foreground">{t('credits.purchase.packages.medium.description')}</p>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          onClick={() => handlePurchaseCredits(7)}
                          disabled={isPurchasing}
                        >
                          {isPurchasing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('common.processing')}
                            </>
                          ) : (
                            <>
                              <CreditCard className="mr-2 h-4 w-4" /> {t('credits.purchase.buyButton')}
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card className="border-2 hover:border-primary transition-colors cursor-pointer">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl">{t('credits.purchase.packages.large.title')}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-3xl font-bold">€19.99</p>
                        <p className="text-muted-foreground">{t('credits.purchase.packages.large.description')}</p>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          onClick={() => handlePurchaseCredits(15)}
                          disabled={isPurchasing}
                        >
                          {isPurchasing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('common.processing')}
                            </>
                          ) : (
                            <>
                              <CreditCard className="mr-2 h-4 w-4" /> {t('credits.purchase.buyButton')}
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>{t('credits.history.title')}</CardTitle>
                  <CardDescription>
                    {t('credits.history.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">{t('credits.history.empty')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between border-b pb-3">
                          <div className="flex items-center">
                            {transaction.type === 'purchase' ? (
                              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-3">
                                <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                            ) : (
                              <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full mr-3">
                                <Minus className="h-4 w-4 text-red-600 dark:text-red-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">
                                {transaction.type === 'purchase' 
                                  ? t('credits.history.purchased', { amount: transaction.amount })
                                  : t('credits.history.used', { amount: Math.abs(transaction.amount) })}
                              </p>
                              <p className="text-sm text-muted-foreground">{transaction.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(transaction.created_at), 'PPp')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
