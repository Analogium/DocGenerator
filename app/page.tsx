"use client";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FileSpreadsheet, FileBadge, FileSignature, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { DocumentTypeCard } from "@/components/document-type-card";

export default function Home() {
  const { t } = useTranslation();

  const documentTypes = [
    {
      title: t('home.documentTypes.invoice.title'),
      description: t('home.documentTypes.invoice.description'),
      icon: <FileSpreadsheet className="h-12 w-12 text-primary" />,
      href: "/create/invoice",
      isPremiumOnly: true
    },
    {
      title: t('home.documentTypes.quote.title'),
      description: t('home.documentTypes.quote.description'),
      icon: <FileText className="h-12 w-12 text-primary" />,
      href: "/create/quote",
      isPremiumOnly: false
    },
    {
      title: t('home.documentTypes.cv.title'),
      description: t('home.documentTypes.cv.description'),
      icon: <FileBadge className="h-12 w-12 text-primary" />,
      href: "/create/cv",
      isPremiumOnly: false
    },
    {
      title: t('home.documentTypes.coverLetter.title'),
      description: t('home.documentTypes.coverLetter.description'),
      icon: <FileSignature className="h-12 w-12 text-primary" />,
      href: "/create/cover-letter",
      isPremiumOnly: true
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  {t('home.hero.title')}
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  {t('home.hero.subtitle')}
                </p>
              </div>
              <div className="space-x-4">
                <Link href="#document-types">
                  <Button size="lg" className="mt-4">
                    {t('home.hero.getStarted')} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" size="lg" className="mt-4">
                    {t('home.hero.viewPricing')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Document Types Section */}
        <section id="document-types" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {t('home.documentTypes.title')}
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  {t('home.documentTypes.subtitle')}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mt-12">
              {documentTypes.map((type, index) => (
                <DocumentTypeCard
                  key={index}
                  title={type.title}
                  description={type.description}
                  icon={type.icon}
                  href={type.href}
                  createNowText={t('home.documentTypes.createNow')}
                  isPremiumOnly={type.isPremiumOnly}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {t('home.features.title')}
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  {t('home.features.subtitle')}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 mt-12">
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{t('home.features.templates.title')}</h3>
                <p className="text-muted-foreground">
                  {t('home.features.templates.description')}
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{t('home.features.preview.title')}</h3>
                <p className="text-muted-foreground">
                  {t('home.features.preview.description')}
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{t('home.features.export.title')}</h3>
                <p className="text-muted-foreground">
                  {t('home.features.export.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {t('home.cta.title')}
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  {t('home.cta.subtitle')}
                </p>
              </div>
              <div className="space-x-4">
                <Link href="#document-types">
                  <Button size="lg" className="mt-4">
                    {t('home.cta.button')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}