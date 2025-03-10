"use client";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const pricingPlans = [
    {
      name: t('pricing.free.name'),
      description: t('pricing.free.description'),
      price: t('pricing.free.price'),
      duration: t('pricing.free.duration'),
      features: t('pricing.free.features', { returnObjects: true }),
      buttonText: t('pricing.free.button'),
      buttonVariant: "outline" as const,
      href: "/signup",
    },
    {
      name: t('pricing.premium.name'),
      description: t('pricing.premium.description'),
      price: t('pricing.premium.price'),
      duration: t('pricing.premium.duration'),
      features: t('pricing.premium.features', { returnObjects: true }),
      buttonText: t('pricing.premium.button'),
      buttonVariant: "default" as const,
      href: "/signup?plan=premium",
      popular: true,
    },
    {
      name: t('pricing.payg.name'),
      description: t('pricing.payg.description'),
      price: t('pricing.payg.price'),
      duration: t('pricing.payg.duration'),
      features: t('pricing.payg.features', { returnObjects: true }),
      buttonText: t('pricing.payg.button'),
      buttonVariant: "outline" as const,
      href: "/credits",
    },
  ];

  const faqQuestions = t('pricing.faq.questions', { returnObjects: true });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  {t('pricing.title')}
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  {t('pricing.subtitle')}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 mt-12">
              {pricingPlans.map((plan, index) => (
                <Card key={index} className={`flex flex-col h-full ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                  {plan.popular && (
                    <div className="absolute top-0 right-0 -mt-2 -mr-2">
                      <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                        {t('pricing.premium.popular')}
                      </span>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="mb-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground"> / {plan.duration}</span>
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center">
                          <Check className="mr-2 h-4 w-4 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {plan.name === t('pricing.payg.name') ? (
                      <Button 
                        variant={plan.buttonVariant} 
                        className="w-full"
                        onClick={() => router.push(plan.href)}
                      >
                        {plan.buttonText}
                      </Button>
                    ) : (
                      <Link href={plan.href} className="w-full">
                        <Button variant={plan.buttonVariant} className="w-full">
                          {plan.buttonText}
                        </Button>
                      </Link>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {t('pricing.faq.title')}
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  {t('pricing.faq.subtitle')}
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl mt-12 space-y-6">
              {faqQuestions.map((faq, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="text-xl font-bold">{faq.question}</h3>
                  <p className="text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}