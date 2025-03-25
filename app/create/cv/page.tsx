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
import { Download, Plus, Trash2, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import { saveDocument, getUserDocuments, getUserProfile } from "@/lib/supabase";
import { generateCVPDF } from "@/lib/pdf-generator";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { SubscriptionGuard } from "@/components/subscription-guard";
import { canExportDocument } from "@/lib/subscription";

export default function CVPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const documentId = searchParams.get("id");
  const [activeTab, setActiveTab] = useState("personal");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [canExport, setCanExport] = useState(true);
  const { t } = useTranslation();
  
  const [cvData, setCvData] = useState({
    personal: {
      name: "",
      title: "",
      email: "",
      phone: "",
      address: "",
      website: "",
      summary: "",
    },
    experience: [
      { 
        company: "", 
        position: "", 
        startDate: "", 
        endDate: "", 
        current: false,
        description: "" 
      }
    ],
    education: [
      { 
        institution: "", 
        degree: "", 
        field: "", 
        startDate: "", 
        endDate: "", 
        description: "" 
      }
    ],
    skills: [""],
    languages: [""],
  });

  useEffect(() => {
    // Load document data if editing an existing document
    async function loadDocument() {
      if (!user || !documentId) return;
      
      try {
        setIsLoading(true);
        const documents = await getUserDocuments(user.id);
        const document = documents.find(doc => doc.id === documentId);
        
        if (document && document.type === 'cv') {
          setCvData(document.content);
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

  const handlePersonalChange = (field: string, value: string) => {
    setCvData(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value
      }
    }));
  };

  const handleExperienceChange = (index: number, field: string, value: string | boolean) => {
    const newExperience = [...cvData.experience];
    newExperience[index] = {
      ...newExperience[index],
      [field]: value
    };
    setCvData(prev => ({
      ...prev,
      experience: newExperience
    }));
  };

  const addExperience = () => {
    setCvData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { 
          company: "", 
          position: "", 
          startDate: "", 
          endDate: "", 
          current: false,
          description: "" 
        }
      ]
    }));
  };

  const removeExperience = (index: number) => {
    if (cvData.experience.length > 1) {
      const newExperience = [...cvData.experience];
      newExperience.splice(index, 1);
      setCvData(prev => ({
        ...prev,
        experience: newExperience
      }));
    }
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    const newEducation = [...cvData.education];
    newEducation[index] = {
      ...newEducation[index],
      [field]: value
    };
    setCvData(prev => ({
      ...prev,
      education: newEducation
    }));
  };

  const addEducation = () => {
    setCvData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { 
          institution: "", 
          degree: "", 
          field: "", 
          startDate: "", 
          endDate: "", 
          description: "" 
        }
      ]
    }));
  };

  const removeEducation = (index: number) => {
    if (cvData.education.length > 1) {
      const newEducation = [...cvData.education];
      newEducation.splice(index, 1);
      setCvData(prev => ({
        ...prev,
        education: newEducation
      }));
    }
  };

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...cvData.skills];
    newSkills[index] = value;
    setCvData(prev => ({
      ...prev,
      skills: newSkills
    }));
  };

  const addSkill = () => {
    setCvData(prev => ({
      ...prev,
      skills: [...prev.skills, ""]
    }));
  };

  const removeSkill = (index: number) => {
    if (cvData.skills.length > 1) {
      const newSkills = [...cvData.skills];
      newSkills.splice(index, 1);
      setCvData(prev => ({
        ...prev,
        skills: newSkills
      }));
    }
  };

  const handleLanguageChange = (index: number, value: string) => {
    const newLanguages = [...cvData.languages];
    newLanguages[index] = value;
    setCvData(prev => ({
      ...prev,
      languages: newLanguages
    }));
  };

  const addLanguage = () => {
    setCvData(prev => ({
      ...prev,
      languages: [...prev.languages, ""]
    }));
  };

  const removeLanguage = (index: number) => {
    if (cvData.languages.length > 1) {
      const newLanguages = [...cvData.languages];
      newLanguages.splice(index, 1);
      setCvData(prev => ({
        ...prev,
        languages: newLanguages
      }));
    }
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
        name: `CV - ${cvData.personal.name || 'Draft'}`,
        type: 'cv',
        content: cvData
      }, documentId || undefined);
      
      toast({
        title: t('success.save.cv.title'),
        description: t('success.save.cv.message'),
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
      const doc = generateCVPDF(cvData);
      
      // Save to Supabase if user is logged in
      if (user) {
        await saveDocument(user.id, {
          name: `CV - ${cvData.personal.name || 'Draft'}`,
          type: 'cv',
          content: cvData
        }, documentId || undefined);
        
        toast({
          title: t('success.save.cv.title'),
          description: t('success.save.cv.message'),
        });
      }
      
      // Download the PDF
      doc.save(`CV_${cvData.personal.name || 'Draft'}.pdf`);
      
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
            <h1 className="text-3xl font-bold">{t('cv.title')}</h1>
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
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">{t('cv.tabs.personal')}</TabsTrigger>
                  <TabsTrigger value="experience">{t('cv.tabs.experience')}</TabsTrigger>
                  <TabsTrigger value="education">{t('cv.tabs.education')}</TabsTrigger>
                  <TabsTrigger value="skills">{t('cv.tabs.skills')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="personal" className="space-y-4 mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fullName">{t('cv.personal.fullName')}</Label>
                          <Input 
                            id="fullName" 
                            value={cvData.personal.name}
                            onChange={(e) => handlePersonalChange('name', e.target.value)}
                            placeholder="John Doe" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="title">{t('cv.personal.title')}</Label>
                          <Input 
                            id="title" 
                            value={cvData.personal.title}
                            onChange={(e) => handlePersonalChange('title', e.target.value)}
                            placeholder="Software Engineer" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">{t('cv.personal.email')}</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={cvData.personal.email}
                            onChange={(e) => handlePersonalChange('email', e.target.value)}
                            placeholder="john@example.com" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">{t('cv.personal.phone')}</Label>
                          <Input 
                            id="phone" 
                            value={cvData.personal.phone}
                            onChange={(e) => handlePersonalChange('phone', e.target.value)}
                            placeholder="+1 (555) 123-4567" 
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="address">{t('cv.personal.address')}</Label>
                          <Input 
                            id="address" 
                            value={cvData.personal.address}
                            onChange={(e) => handlePersonalChange('address', e.target.value)}
                            placeholder="123 Main St, City, Country" 
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="website">{t('cv.personal.website')}</Label>
                          <Input 
                            id="website" 
                            value={cvData.personal.website}
                            onChange={(e) => handlePersonalChange('website', e.target.value)}
                            placeholder="https://linkedin.com/in/johndoe" 
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="summary">{t('cv.personal.summary')}</Label>
                          <Textarea 
                            id="summary" 
                            value={cvData.personal.summary}
                            onChange={(e) => handlePersonalChange('summary', e.target.value)}
                            placeholder={t('cv.personal.summaryPlaceholder')}
                            className="min-h-[150px]"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="experience" className="space-y-4 mt-4">
                  {cvData.experience.map((exp, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">{t('cv.experience.title', { number: index + 1 })}</h3>
                          {cvData.experience.length > 1 && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => removeExperience(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`exp-${index}-company`}>{t('cv.experience.company')}</Label>
                            <Input 
                              id={`exp-${index}-company`} 
                              value={exp.company}
                              onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                              placeholder="Company Name" 
                            />
                          </div>
                          <div>
                            <Label htmlFor={`exp-${index}-position`}>{t('cv.experience.position')}</Label>
                            <Input 
                              id={`exp-${index}-position`} 
                              value={exp.position}
                              onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                              placeholder="Software Engineer" 
                            />
                          </div>
                          <div>
                            <Label htmlFor={`exp-${index}-startDate`}>{t('cv.experience.startDate')}</Label>
                            <Input 
                              id={`exp-${index}-startDate`} 
                              type="month" 
                              value={exp.startDate}
                              onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                            />
                          </div>
                          <div>
                            <div className="flex items-center mb-2">
                              <input 
                                type="checkbox" 
                                id={`exp-${index}-current`}
                                checked={exp.current}
                                onChange={(e) => handleExperienceChange(index, 'current', e.target.checked)}
                                className="mr-2"
                              />
                              <Label htmlFor={`exp-${index}-current`}>{t('cv.experience.currentJob')}</Label>
                            </div>
                            {!exp.current && (
                              <>
                                <Label htmlFor={`exp-${index}-endDate`}>{t('cv.experience.endDate')}</Label>
                                <Input 
                                  id={`exp-${index}-endDate`} 
                                  type="month" 
                                  value={exp.endDate}
                                  onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                                />
                              </>
                            )}
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor={`exp-${index}-description`}>{t('cv.experience.description')}</Label>
                            <Textarea 
                              id={`exp-${index}-description`} 
                              value={exp.description}
                              onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                              placeholder={t('cv.experience.descriptionPlaceholder')}
                              className="min-h-[150px]"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button variant="outline" onClick={addExperience} className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> {t('cv.experience.addExperience')}
                  </Button>
                </TabsContent>
                
                <TabsContent value="education" className="space-y-4 mt-4">
                  {cvData.education.map((edu, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">{t('cv.education.title', { number: index + 1 })}</h3>
                          {cvData.education.length > 1 && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => removeEducation(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`edu-${index}-institution`}>{t('cv.education.institution')}</Label>
                            <Input 
                              id={`edu-${index}-institution`} 
                              value={edu.institution}
                              onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                              placeholder="University Name" 
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edu-${index}-degree`}>{t('cv.education.degree')}</Label>
                            <Input 
                              id={`edu-${index}-degree`} 
                              value={edu.degree}
                              onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                              placeholder="Bachelor of Science" 
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edu-${index}-field`}>{t('cv.education.field')}</Label>
                            <Input 
                              id={`edu-${index}-field`} 
                              value={edu.field}
                              onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                              placeholder="Computer Science" 
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor={`edu-${index}-startDate`}>{t('cv.education.start')}</Label>
                              <Input 
                                id={`edu-${index}-startDate`} 
                                type="month" 
                                value={edu.startDate}
                                onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`edu-${index}-endDate`}>{t('cv.education.end')}</Label>
                              <Input 
                                id={`edu-${index}-endDate`} 
                                type="month" 
                                value={edu.endDate}
                                onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor={`edu-${index}-description`}>{t('cv.education.description')}</Label>
                            <Textarea 
                              id={`edu-${index}-description`} 
                              value={edu.description}
                              onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                              placeholder={t('cv.education.descriptionPlaceholder')}
                              className="min-h-[100px]"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button variant="outline" onClick={addEducation} className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> {t('cv.education.addEducation')}
                  </Button>
                </TabsContent>
                
                <TabsContent value="skills" className="space-y-4 mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-4">{t('cv.skills.title')}</h3>
                      <div className="space-y-4">
                        {cvData.skills.map((skill, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input 
                              value={skill}
                              onChange={(e) => handleSkillChange(index, e.target.value)}
                              placeholder={t('cv.skills.skillPlaceholder')}
                            />
                            {cvData.skills.length > 1 && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removeSkill(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button variant="outline" onClick={addSkill} className="w-full">
                          <Plus className="mr-2 h-4 w-4" /> {t('cv.skills.addSkill')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-4">{t('cv.skills.languages')}</h3>
                      <div className="space-y-4">
                        {cvData.languages.map((language, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input 
                              value={language}
                              onChange={(e) => handleLanguageChange(index, e.target.value)}
                              placeholder={t('cv.skills.languagePlaceholder')}
                            />
                            {cvData.languages.length > 1 && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removeLanguage(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button variant="outline" onClick={addLanguage} className="w-full">
                          <Plus className="mr-2 h-4 w-4" /> {t('cv.skills.addLanguage')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="md:col-span-1">
              <Card className="sticky top-20">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">{t('cv.preview.title')}</h3>
                  <div className="space-y-4 text-sm max-h-[70vh] overflow-y-auto pr-2">
                    <div className="text-center">
                      <h2 className="text-xl font-bold">{cvData.personal.name || "Your Name"}</h2>
                      <p className="text-muted-foreground">{cvData.personal.title || "Professional Title"}</p>
                      <div className="flex flex-wrap justify-center gap-x-3 mt-2 text-xs">
                        {cvData.personal.email && <span>{cvData.personal.email}</span>}
                        {cvData.personal.phone && <span>{cvData.personal.phone}</span>}
                        {cvData.personal.address && <span>{cvData.personal.address}</span>}
                        {cvData.personal.website && <span>{cvData.personal.website}</span>}
                      </div>
                    </div>
                    
                    {cvData.personal.summary && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-1">{t('cv.preview.summary')}</h4>
                          <p className="text-xs whitespace-pre-wrap">{cvData.personal.summary}</p>
                        </div>
                      </>
                    )}
                    
                    {cvData.experience.some(exp => exp.company || exp.position) && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-1">{t('cv.preview.experience')}</h4>
                          <div className="space-y-3">
                            {cvData.experience.map((exp, index) => (
                              <div key={index} className="text-xs">
                                {(exp.company || exp.position) && (
                                  <div className="flex justify-between">
                                    <div>
                                      <p className="font-medium">{exp.position || "Position"}</p>
                                      <p>{exp.company || "Company"}</p>
                                    </div>
                                    <div className="text-right">
                                      <p>
                                        {exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : "Start Date"}
                                        {" - "}
                                        {exp.current ? t('cv.preview.present') : (exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : "End Date")}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                {exp.description && <p className="whitespace-pre-wrap mt-1">{exp.description}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    
                    {cvData.education.some(edu => edu.institution || edu.degree) && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-1">{t('cv.preview.education')}</h4>
                          <div className="space-y-3">
                            {cvData.education.map((edu, index) => (
                              <div key={index} className="text-xs">
                                {(edu.institution || edu.degree) && (
                                  <div className="flex justify-between">
                                    <div>
                                      <p className="font-medium">
                                        {edu.degree ? `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}` : "Degree"}
                                      </p>
                                      <p>{edu.institution || "Institution"}</p>
                                    </div>
                                    <div className="text-right">
                                      <p>
                                        {edu.startDate ? new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : "Start Date"}
                                        {" - "}
                                        {edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : "End Date"}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                {edu.description && <p className="whitespace-pre-wrap mt-1">{edu.description}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    
                    {cvData.skills.some(skill => skill) && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-1">{t('cv.preview.skills')}</h4>
                          <p className="text-xs">
                            {cvData.skills.filter(s => s).join(', ')}
                          </p>
                        </div>
                      </>
                    )}
                    
                    {cvData.languages.some(lang => lang) && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-1">{t('cv.preview.languages')}</h4>
                          <p className="text-xs">
                            {cvData.languages.filter(l => l).join(', ')}
                          </p>
                        </div>
                      </>
                    )}
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
