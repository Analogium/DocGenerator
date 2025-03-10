"use client";

import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Plus, Settings, CreditCard, Loader2, Copy } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { getUserDocuments, getUserProfile, Document, Profile, updateProfile, duplicateDocument } from "@/lib/supabase";
import { generateInvoicePDF, generateQuotePDF, generateCVPDF, generateCoverLetterPDF } from "@/lib/pdf-generator";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export default function DashboardPage() {
  const { user, updateProfile: updateAuthProfile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("documents");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const { t } = useTranslation();
  
  useEffect(() => {
    async function loadUserData() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const [userDocs, userProfile] = await Promise.all([
          getUserDocuments(user.id),
          getUserProfile(user.id)
        ]);
        
        setDocuments(userDocs);
        setProfile(userProfile);
        setFullName(user.user_metadata?.full_name || "");
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
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get document icon based on type
  const getDocumentIcon = (type: string) => {
    return <FileText className="h-5 w-5" />;
  };
  
  const handleDownload = async (document: Document) => {
    try {
      let doc;
      
      switch (document.type) {
        case 'invoice':
          doc = generateInvoicePDF(document.content);
          break;
        case 'quote':
          doc = generateQuotePDF(document.content);
          break;
        case 'cv':
          doc = generateCVPDF(document.content);
          break;
        case 'cover-letter':
          doc = generateCoverLetterPDF(document.content);
          break; 
        default:
          throw new Error("Unknown document type");
      }
      
      doc.save(`${document.name}.pdf`);
      
      toast({
        title: "Download Complete",
        description: "Your document has been downloaded as a PDF.",
      });
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message || "There was an error downloading your document.",
        variant: "destructive"
      });
    }
  };

  const handleDuplicate = async (documentId: string) => {
    if (!user) return;
    
    try {
      setIsDuplicating(documentId);
      
      // Call the duplicateDocument function
      const newDocument = await duplicateDocument(user.id, documentId);
      
      // Update the documents list
      setDocuments(prev => [newDocument, ...prev]);
      
      // Update the profile to reflect the new document count or credits
      const updatedProfile = await getUserProfile(user.id);
      setProfile(updatedProfile);
      
      toast({
        title: t('dashboard.documents.duplicate.success'),
        description: t('dashboard.documents.duplicate.successMessage'),
      });
    } catch (error: any) {
      toast({
        title: t('dashboard.documents.duplicate.error'),
        description: error.message || t('dashboard.documents.duplicate.errorMessage'),
        variant: "destructive"
      });
    } finally {
      setIsDuplicating(null);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      // Update user metadata
      await updateAuthProfile({ full_name: fullName });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{t('dashboard.signInRequired.title')}</CardTitle>
              <CardDescription>
                {t('dashboard.signInRequired.message')}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/login" className="w-full">
                <Button className="w-full">{t('dashboard.signInRequired.button')}</Button>
              </Link>
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
          <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
          <div className="flex gap-2">
            <Link href="/#document-types">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> {t('dashboard.newDocument')}
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="documents">{t('dashboard.tabs.documents')}</TabsTrigger>
            <TabsTrigger value="subscription">{t('dashboard.tabs.subscription')}</TabsTrigger>
            <TabsTrigger value="settings">{t('dashboard.tabs.settings')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="documents" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <Card key={doc.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        {getDocumentIcon(doc.type)}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(doc.created_at)}
                        </span>
                      </div>
                      <CardTitle className="text-lg">{doc.name}</CardTitle>
                      <CardDescription>
                        {doc.type.charAt(0).toUpperCase() + doc.type.slice(1).replace('-', ' ')}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-2 flex-col gap-2">
                      <div className="flex justify-between w-full">
                        <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                          <Download className="mr-2 h-4 w-4" /> {t('common.download')}
                        </Button>
                        <Link href={`/create/${doc.type}?id=${doc.id}`}>
                          <Button variant="ghost" size="sm">
                            {t('common.edit')}
                          </Button>
                        </Link>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full" 
                        onClick={() => handleDuplicate(doc.id)}
                        disabled={isDuplicating === doc.id}
                      >
                        {isDuplicating === doc.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Copy className="mr-2 h-4 w-4" />
                        )}
                        {t('common.duplicate')}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">{t('dashboard.documents.empty.title')}</h3>
                  <p className="text-muted-foreground mb-6">{t('dashboard.documents.empty.subtitle')}</p>
                  <Link href="/#document-types">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> {t('dashboard.documents.empty.button')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="subscription" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t('dashboard.subscription.currentPlan', { 
                    plan: profile?.subscription_tier === 'premium' 
                      ? t('dashboard.subscription.premium') 
                      : profile?.subscription_tier === 'payg'
                        ? 'Pay As You Go'
                        : t('dashboard.subscription.free') 
                  })}
                </CardTitle>
                <CardDescription>
                  {profile?.subscription_tier === 'premium' 
                    ? t('account.subscription.premiumDescription')
                    : profile?.subscription_tier === 'payg'
                      ? `You have ${profile.credits || 0} credits available for document creation.`
                      : t('account.subscription.freeDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile?.subscription_tier === 'free' && (
                    <>
                      <div className="flex items-center justify-between">
                        <span>{t('account.subscription.documentsCreated')}</span>
                        <span className="font-medium">{profile?.documents_created_this_month || 0}/3</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${Math.min((profile?.documents_created_this_month || 0) / 3 * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t('dashboard.subscription.renewalFree')}
                      </p>
                    </>
                  )}
                  
                  {profile?.subscription_tier === 'payg' && (
                    <>
                      <div className="flex items-center justify-between">
                        <span>Available Credits</span>
                        <span className="font-medium">{profile?.credits || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <Link href="/credits">
                          <Button variant="outline">
                            <CreditCard className="mr-2 h-4 w-4" /> Purchase Credits
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}
                  
                  {profile?.subscription_tier === 'premium' && (
                    <div>
                      <h4 className="font-medium">{t('account.subscription.premiumBenefits.title')}</h4>
                      <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground">
                        {t('account.subscription.premiumBenefits.benefits', { returnObjects: true }).map((benefit: string, index: number) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                {profile?.subscription_tier === 'premium' ? (
                  <Button variant="outline">{t('account.subscription.manageSubscription')}</Button>
                ) : (
                  <Link href="/pricing">
                    <Button>{t('account.subscription.upgradeToPremium')}</Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.settings.title')}</CardTitle>
                <CardDescription>
                  {t('dashboard.settings.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{t('dashboard.settings.fullName')}</Label>
                      <Input 
                        id="name" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t('dashboard.settings.email')}</Label>
                      <Input id="email" type="email" value={user?.email || ''} disabled />
                    </div>
                  </div>
                  <div>
                    <Button 
                      variant="outline" 
                      onClick={handleUpdateProfile}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('dashboard.settings.updating')}
                        </>
                      ) : (
                        <>
                          <Settings className="mr-2 h-4 w-4" /> {t('dashboard.settings.updateProfile')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <SiteFooter />
    </div>
  );
}

interface LabelProps {
  htmlFor: string;
  children: React.ReactNode;
}

function Label({ htmlFor, children }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium mb-1">
      {children}
    </label>
  );
}

function Input({ ...props }) {
  return (
    <input
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    />
  );
}