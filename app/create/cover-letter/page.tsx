"use client";

import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Download, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import { saveDocument, getUserDocuments, getUserProfile } from "@/lib/supabase";
import { generateCoverLetterPDF } from "@/lib/pdf-generator";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { SubscriptionGuard } from "@/components/subscription-guard";
import { canExportDocument } from "@/lib/subscription";

export default function CoverLetterPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const documentId = searchParams.get("id");
  const [activeTab, setActiveTab] = useState("details");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [canExport, setCanExport] = useState(true);
  const { t } = useTranslation();
  
  const [letterData, setLetterData] = useState({
    date: "",
    yourInfo: {
      name: "",
      address: "",
      email: "",
      phone: "",
    },
    recipientInfo: {
      name: "",
      title: "",
      company: "",
      address: "",
    },
    jobInfo: {
      title: "",
      reference: "",
    },
    content: {
      greeting: "Dear",
      introduction: "",
      body: "",
      conclusion: "",
      closing: "Sincerely,",
    }
  });

  useEffect(() => {
    // Load document data if editing an existing document
    async function loadDocument() {
      if (!user || !documentId) return;
      
      try {
        setIsLoading(true);
        const documents = await getUserDocuments(user.id);
        const document = documents.find(doc => doc.id === documentId);
        
        if (document && document.type === 'cover-letter') {
          setLetterData(document.content);
          toast({
            title: t('success.document.title'),
            description: t('success.document.message'),
          });
        }
        
        // Check export permissions
        const profile = await getUserProfile(user.id);
        const { canExport: canExportDoc } = canExportDocument(profile);
        setCanExport(canExportDoc);
      } catch (error: any) {
        toast({
          title: t('errors.document.title'),
          description: error.message || t('errors.document.message'),
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadDocument();
  }, [user, documentId, toast, t]);

  const handleChange = (section: string, field: string, value: string) => {
    setLetterData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: t('errors.save.title'),
        description: t('errors.save.signInRequired'),
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Save to Supabase, passing documentId if we're editing an existing document
      await saveDocument(user.id, {
        name: `Cover Letter - ${letterData.jobInfo.title || 'Draft'}`,
        type: 'cover-letter',
        content: letterData
      }, documentId || undefined);
      
      toast({
        title: t('success.save.coverLetter.title'),
        description: t('success.save.coverLetter.message'),
      });
    } catch (error: any) {
      toast({
        title: t('errors.save.title'),
        description: error.message || t('errors.save.message'),
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    if (!canExport) {
      toast({
        title: t('subscription.export.denied.title'),
        description: t('subscription.export.denied.message'),
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Generate PDF
      const doc = generateCoverLetterPDF(letterData);
      
      // Save to Supabase if user is logged in
      if (user) {
        await saveDocument(user.id, {
          name: `Cover Letter - ${letterData.jobInfo.title || 'Draft'}`,
          type: 'cover-letter',
          content: letterData
        }, documentId || undefined);
        
        toast({
          title: t('success.save.coverLetter.title'),
          description: t('success.save.coverLetter.message'),
        });
      }
      
      // Download the PDF
      doc.save(`Cover_Letter_${letterData.jobInfo.title || 'Draft'}.pdf`);
      
      toast({
        title: t('success.export.title'),
        description: t('success.export.message'),
      });
    } catch (error: any) {
      toast({
        title: t('errors.export.title'),
        description: error.message || t('errors.export.message'),
        variant: "destructive"
      });
    }
  };

  return (
    <SubscriptionGuard>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 container py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{t('coverLetter.title')}</h1>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" /> {isSaving ? t('common.saving') : t('common.save')}
              </Button>
              <Button onClick={handleExport} disabled={!canExport}>
                <Download className="mr-2 h-4 w-4" /> {t('common.export')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">{t('coverLetter.tabs.details')}</TabsTrigger>
                  <TabsTrigger value="job">{t('coverLetter.tabs.job')}</TabsTrigger>
                  <TabsTrigger value="content">{t('coverLetter.tabs.content')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4 mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label htmlFor="date">{t('coverLetter.details.date')}</Label>
                          <Input 
                            id="date" 
                            type="date" 
                            value={letterData.date}
                            onChange={(e) => setLetterData({...letterData, date: e.target.value})}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-4">{t('coverLetter.details.yourInfo.title')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="yourName">{t('coverLetter.details.yourInfo.fullName')}</Label>
                          <Input 
                            id="yourName" 
                            value={letterData.yourInfo.name}
                            onChange={(e) => handleChange('yourInfo', 'name', e.target.value)}
                            placeholder="Your Full Name" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="yourEmail">{t('coverLetter.details.yourInfo.email')}</Label>
                          <Input 
                            id="yourEmail" 
                            type="email" 
                            value={letterData.yourInfo.email}
                            onChange={(e) => handleChange('yourInfo', 'email', e.target.value)}
                            placeholder="your@email.com" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="yourPhone">{t('coverLetter.details.yourInfo.phone')}</Label>
                          <Input 
                            id="yourPhone" 
                            value={letterData.yourInfo.phone}
                            onChange={(e) => handleChange('yourInfo', 'phone', e.target.value)}
                            placeholder="+1 (555) 123-4567" 
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="yourAddress">{t('coverLetter.details.yourInfo.address')}</Label>
                          <Input 
                            id="yourAddress" 
                            value={letterData.yourInfo.address}
                            onChange={(e) => handleChange('yourInfo', 'address', e.target.value)}
                            placeholder="123 Your Street, City, Country" 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-4">{t('coverLetter.details.recipientInfo.title')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="recipientName">{t('coverLetter.details.recipientInfo.name')}</Label>
                          <Input 
                            id="recipientName" 
                            value={letterData.recipientInfo.name}
                            onChange={(e) => handleChange('recipientInfo', 'name', e.target.value)}
                            placeholder="Hiring Manager's Name" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="recipientTitle">{t('coverLetter.details.recipientInfo.title')}</Label>
                          <Input 
                            id="recipientTitle" 
                            value={letterData.recipientInfo.title}
                            onChange={(e) => handleChange('recipientInfo', 'title', e.target.value)}
                            placeholder="Hiring Manager" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="recipientCompany">{t('coverLetter.details.recipientInfo.company')}</Label>
                          <Input 
                            id="recipientCompany" 
                            value={letterData.recipientInfo.company}
                            onChange={(e) => handleChange('recipientInfo', 'company', e.target.value)}
                            placeholder="Company Name" 
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="recipientAddress">{t('coverLetter.details.recipientInfo.address')}</Label>
                          <Input 
                            id="recipientAddress" 
                            value={letterData.recipientInfo.address}
                            onChange={(e) => handleChange('recipientInfo', 'address', e.target.value)}
                            placeholder="456 Company Street, City, Country" 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="job" className="space-y-4 mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-4">{t('coverLetter.job.title')}</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label htmlFor="jobTitle">{t('coverLetter.job.positionTitle')}</Label>
                          <Input 
                            id="jobTitle" 
                            value={letterData.jobInfo.title}
                            onChange={(e) => handleChange('jobInfo', 'title', e.target.value)}
                            placeholder="Software Engineer" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="jobReference">{t('coverLetter.job.reference')}</Label>
                          <Input 
                            id="jobReference" 
                            value={letterData.jobInfo.reference}
                            onChange={(e) => handleChange('jobInfo', 'reference', e.target.value)}
                            placeholder="JOB-123" 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="content" className="space-y-4 mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="greeting">{t('coverLetter.content.greeting')}</Label>
                          <Input 
                            id="greeting" 
                            value={letterData.content.greeting}
                            onChange={(e) => handleChange('content', 'greeting', e.target.value)}
                            placeholder="Dear" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="introduction">{t('coverLetter.content.introduction')}</Label>
                          <Textarea 
                            id="introduction" 
                            value={letterData.content.introduction}
                            onChange={(e) => handleChange('content', 'introduction', e.target.value)}
                            placeholder={t('coverLetter.content.introductionPlaceholder')}
                            className="min-h-[100px]"
                          />
                        </div>
                        <div>
                          <Label htmlFor="body">{t('coverLetter.content.body')}</Label>
                          <Textarea 
                            id="body" 
                            value={letterData.content.body}
                            onChange={(e) => handleChange('content', 'body', e.target.value)}
                            placeholder={t('coverLetter.content.bodyPlaceholder')}
                            className="min-h-[200px]"
                          />
                        </div>
                        <div>
                          <Label htmlFor="conclusion">{t('coverLetter.content.conclusion')}</Label>
                          <Textarea 
                            id="conclusion" 
                            value={letterData.content.conclusion}
                            onChange={(e) => handleChange('content', 'conclusion', e.target.value)}
                            placeholder={t('coverLetter.content.conclusionPlaceholder')}
                            className="min-h-[100px]"
                          />
                        </div>
                        <div>
                          <Label htmlFor="closing">{t('coverLetter.content.closing')}</Label>
                          <Input 
                            id="closing" 
                            value={letterData.content.closing}
                            onChange={(e) => handleChange('content', 'closing', e.target.value)}
                            placeholder="Sincerely," 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="md:col-span-1">
              <Card className="sticky top-20">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">{t('coverLetter.preview.title')}</h3>
                  <div className="space-y-4 text-sm max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                      <p className="text-right">{letterData.date ? new Date(letterData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "[Date]"}</p>
                    </div>
                    
                    <div>
                      <p>{letterData.yourInfo.name || "[Your Name]"}</p>
                      <p>{letterData.yourInfo.address || "[Your Address]"}</p>
                      <p>{letterData.yourInfo.email || "[Your Email]"}</p>
                      <p>{letterData.yourInfo.phone || "[Your Phone]"}</p>
                    </div>
                    
                    <div>
                      <p>{letterData.recipientInfo.name || "[Recipient Name]"}</p>
                      <p>{letterData.recipientInfo.title || "[Recipient Title]"}</p>
                      <p>{letterData.recipientInfo.company || "[Company Name]"}</p>
                      <p>{letterData.recipientInfo.address || "[Company Address]"}</p>
                    </div>
                    
                    <div>
                      <p>
                        {letterData.content.greeting || "Dear"} {letterData.recipientInfo.name ? `${letterData.recipientInfo.name},` : "[Recipient Name],"}
                      </p>
                    </div>
                    
                    <div>
                      <p className="whitespace-pre-wrap">{letterData.content.introduction || "[Your introduction paragraph will appear here]"}</p>
                    </div>
                    
                    <div>
                      <p className="whitespace-pre-wrap">{letterData.content.body || "[Your body paragraphs will appear here]"}</p>
                    </div>
                    
                    <div>
                      <p className="whitespace-pre-wrap">{letterData.content.conclusion || "[Your conclusion paragraph will appear here]"}</p>
                    </div>
                    
                    <div>
                      <p>{letterData.content.closing || "Sincerely,"}</p>
                      <p className="mt-4">{letterData.yourInfo.name || "[Your Name]"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    </SubscriptionGuard>
  );
}
