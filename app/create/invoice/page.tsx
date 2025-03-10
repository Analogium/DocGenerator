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
import { generateInvoicePDF } from "@/lib/pdf-generator";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { SubscriptionGuard } from "@/components/subscription-guard";
import { canExportDocument } from "@/lib/subscription";

export default function InvoicePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const documentId = searchParams.get("id");
  const [activeTab, setActiveTab] = useState("details");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [canExport, setCanExport] = useState(true);
  const { t } = useTranslation();
  
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "",
    date: "",
    dueDate: "",
    yourInfo: {
      name: "",
      address: "",
      email: "",
      phone: "",
    },
    clientInfo: {
      name: "",
      address: "",
      email: "",
      phone: "",
    },
    items: [
      { description: "", quantity: 1, price: 0 }
    ],
    notes: "",
  });

  useEffect(() => {
    // Load document data if editing an existing document
    async function loadDocument() {
      if (!user || !documentId) return;
      
      try {
        setIsLoading(true);
        const documents = await getUserDocuments(user.id);
        const document = documents.find(doc => doc.id === documentId);
        
        if (document && document.type === 'invoice') {
          setInvoiceData(document.content);
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

  const handleChange = (section: string, field: string, value: string | number) => {
    setInvoiceData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...invoiceData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'quantity' || field === 'price' ? Number(value) : value
    };
    setInvoiceData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const addItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, price: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    if (invoiceData.items.length > 1) {
      const newItems = [...invoiceData.items];
      newItems.splice(index, 1);
      setInvoiceData(prev => ({
        ...prev,
        items: newItems
      }));
    }
  };

  const calculateSubtotal = () => {
    return invoiceData.items.reduce((total, item) => {
      return total + (item.quantity * item.price);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    // Add tax calculation if needed
    return subtotal;
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
        name: `Invoice ${invoiceData.invoiceNumber || 'Draft'}`,
        type: 'invoice',
        content: invoiceData
      }, documentId || undefined);
      
      toast({
        title: t('success.save.invoice.title'),
        description: t('success.save.invoice.message'),
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
      const doc = generateInvoicePDF(invoiceData);
      
      // Save to Supabase if user is logged in
      if (user) {
        await saveDocument(user.id, {
          name: `Invoice ${invoiceData.invoiceNumber || 'Draft'}`,
          type: 'invoice',
          content: invoiceData
        }, documentId || undefined);
        
        toast({
          title: t('success.save.invoice.title'),
          description: t('success.save.invoice.message'),
        });
      }
      
      // Download the PDF
      doc.save(`Invoice_${invoiceData.invoiceNumber || 'Draft'}.pdf`);
      
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
            <h1 className="text-3xl font-bold">{t('invoice.title')}</h1>
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
                  <TabsTrigger value="details">{t('invoice.tabs.details')}</TabsTrigger>
                  <TabsTrigger value="items">{t('invoice.tabs.items')}</TabsTrigger>
                  <TabsTrigger value="notes">{t('invoice.tabs.notes')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4 mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="invoiceNumber">{t('invoice.details.invoiceNumber')}</Label>
                          <Input 
                            id="invoiceNumber" 
                            value={invoiceData.invoiceNumber}
                            onChange={(e) => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})}
                            placeholder="INV-001" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="date">{t('invoice.details.date')}</Label>
                          <Input 
                            id="date" 
                            type="date" 
                            value={invoiceData.date}
                            onChange={(e) => setInvoiceData({...invoiceData, date: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="dueDate">{t('invoice.details.dueDate')}</Label>
                          <Input 
                            id="dueDate" 
                            type="date" 
                            value={invoiceData.dueDate}
                            onChange={(e) => setInvoiceData({...invoiceData, dueDate: e.target.value})}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-4">{t('invoice.details.yourInfo.title')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="yourName">{t('invoice.details.yourInfo.name')}</Label>
                          <Input 
                            id="yourName" 
                            value={invoiceData.yourInfo.name}
                            onChange={(e) => handleChange('yourInfo', 'name', e.target.value)}
                            placeholder="Your Company Name" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="yourEmail">{t('invoice.details.yourInfo.email')}</Label>
                          <Input 
                            id="yourEmail" 
                            type="email" 
                            value={invoiceData.yourInfo.email}
                            onChange={(e) => handleChange('yourInfo', 'email', e.target.value)}
                            placeholder="your@email.com" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="yourPhone">{t('invoice.details.yourInfo.phone')}</Label>
                          <Input 
                            id="yourPhone" 
                            value={invoiceData.yourInfo.phone}
                            onChange={(e) => handleChange('yourInfo', 'phone', e.target.value)}
                            placeholder="+1 (555) 123-4567" 
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="yourAddress">{t('invoice.details.yourInfo.address')}</Label>
                          <Input 
                            id="yourAddress" 
                            value={invoiceData.yourInfo.address}
                            onChange={(e) => handleChange('yourInfo', 'address', e.target.value)}
                            placeholder="123 Your Street, City, Country" 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-4">{t('invoice.details.clientInfo.title')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="clientName">{t('invoice.details.clientInfo.name')}</Label>
                          <Input 
                            id="clientName" 
                            value={invoiceData.clientInfo.name}
                            onChange={(e) => handleChange('clientInfo', 'name', e.target.value)}
                            placeholder="Client Company Name" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="clientEmail">{t('invoice.details.clientInfo.email')}</Label>
                          <Input 
                            id="clientEmail" 
                            type="email" 
                            value={invoiceData.clientInfo.email}
                            onChange={(e) => handleChange('clientInfo', 'email', e.target.value)}
                            placeholder="client@email.com" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="clientPhone">{t('invoice.details.clientInfo.phone')}</Label>
                          <Input 
                            id="clientPhone" 
                            value={invoiceData.clientInfo.phone}
                            onChange={(e) => handleChange('clientInfo', 'phone', e.target.value)}
                            placeholder="+1 (555) 987-6543" 
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="clientAddress">{t('invoice.details.clientInfo.address')}</Label>
                          <Input 
                            id="clientAddress" 
                            value={invoiceData.clientInfo.address}
                            onChange={(e) => handleChange('clientInfo', 'address', e.target.value)}
                            placeholder="456 Client Street, City, Country" 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="items" className="space-y-4 mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {invoiceData.items.map((item, index) => (
                          <div key={index} className="grid grid-cols-12 gap-4 items-end">
                            <div className="col-span-6">
                              <Label htmlFor={`item-${index}-desc`}>{t('invoice.items.description')}</Label>
                              <Input 
                                id={`item-${index}-desc`} 
                                value={item.description}
                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                placeholder="Item or service description" 
                              />
                            </div>
                            <div className="col-span-2">
                              <Label htmlFor={`item-${index}-qty`}>{t('invoice.items.quantity')}</Label>
                              <Input 
                                id={`item-${index}-qty`} 
                                type="number" 
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              />
                            </div>
                            <div className="col-span-3">
                              <Label htmlFor={`item-${index}-price`}>{t('invoice.items.price')}</Label>
                              <Input 
                                id={`item-${index}-price`} 
                                type="number" 
                                min="0"
                                step="0.01"
                                value={item.price}
                                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                              />
                            </div>
                            <div className="col-span-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removeItem(index)}
                                disabled={invoiceData.items.length <= 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        <Button variant="outline" onClick={addItem} className="w-full">
                          <Plus className="mr-2 h-4 w-4" /> {t('invoice.items.addItem')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="notes" className="space-y-4 mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="notes">{t('invoice.notes.title')}</Label>
                          <Textarea 
                            id="notes" 
                            value={invoiceData.notes}
                            onChange={(e) => setInvoiceData({...invoiceData, notes: e.target.value})}
                            placeholder={t('invoice.notes.placeholder')}
                            className="min-h-[150px]"
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
                  <h3 className="text-lg font-medium mb-4">{t('invoice.preview.title')}</h3>
                  <div className="space-y-4 text-sm max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                      <h4 className="font-semibold">{t('invoice.preview.invoiceNumber', { number: invoiceData.invoiceNumber || "INV-001" })}</h4>
                      <p>{t('invoice.preview.date', { date: invoiceData.date ? new Date(invoiceData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Not set" })}</p>
                      <p>{t('invoice.preview.dueDate', { date: invoiceData.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Not set" })}</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold">{t('invoice.preview.from')}</h4>
                      <p>{invoiceData.yourInfo.name || "Your Name"}</p>
                      <p>{invoiceData.yourInfo.address || "Your Address"}</p>
                      <p>{invoiceData.yourInfo.email || "your@email.com"}</p>
                      <p>{invoiceData.yourInfo.phone || "Your Phone"}</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold">{t('invoice.preview.to')}</h4>
                      <p>{invoiceData.clientInfo.name || "Client Name"}</p>
                      <p>{invoiceData.clientInfo.address || "Client Address"}</p>
                      <p>{invoiceData.clientInfo.email || "client@email.com"}</p>
                      <p>{invoiceData.clientInfo.phone || "Client Phone"}</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold">{t('invoice.preview.items')}</h4>
                      <div className="mt-2 space-y-2">
                        {invoiceData.items.map((item, index) => (
                          <div key={index} className="grid grid-cols-12 text-xs">
                            <div className="col-span-6">
                              <p>{item.description || "Item description"}</p>
                            </div>
                            <div className="col-span-2 text-center">
                              <p>{item.quantity}</p>
                            </div>
                            <div className="col-span-2 text-right">
                              <p>€{item.price.toFixed(2)}</p>
                            </div>
                            <div className="col-span-2 text-right">
                              <p>€{(item.quantity * item.price).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <p className="font-semibold">{t('invoice.preview.subtotal')}</p>
                        <p>€{calculateSubtotal().toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between font-bold mt-2">
                        <p>{t('invoice.preview.total')}</p>
                        <p>€{calculateTotal().toFixed(2)}</p>
                      </div>
                    </div>
                    
                    {invoiceData.notes && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold">{t('invoice.preview.notes')}</h4>
                          <p className="text-xs mt-1 whitespace-pre-wrap">{invoiceData.notes}</p>
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