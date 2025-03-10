"use client";

import { useState, useEffect, useRef } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import { getUserProfile, Profile } from "@/lib/supabase";
import { Loader2, Upload, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

export default function AccountPage() {
  const { user, signOut, updateProfile, deleteAccount, uploadAvatar } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        router.push("/login");
        return;
      }
      
      try {
        setIsLoading(true);
        const userProfile = await getUserProfile(user.id);
        setProfile(userProfile);
        setFormData({
          ...formData,
          fullName: user.user_metadata?.full_name || "",
          email: user.email || "",
        });
      } catch (error: any) {
        toast({
          title: "Error loading profile",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadProfile();
  }, [user, router, toast]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      // Update user metadata using the updateProfile function from AuthContext
      await updateProfile({ full_name: formData.fullName });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      // Error is handled in the updateProfile function
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      // First verify the current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: formData.currentPassword,
      });
      
      if (signInError) throw new Error("Current password is incorrect");
      
      // Then update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword
      });
      
      if (updateError) throw updateError;
      
      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating password",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    try {
      setIsSaving(true);
      
      // Call the deleteAccount function from AuthContext
      await deleteAccount();
      
      // Redirect to home page
      router.push("/");
    } catch (error: any) {
      // Error is handled in the deleteAccount function
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Upload the avatar
      await uploadAvatar(file);
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error: any) {
      // Error is handled in the uploadAvatar function
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Please Sign In</CardTitle>
              <CardDescription>
                You need to be signed in to access account settings.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full" onClick={() => router.push("/login")}>
                Go to Login
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
          <h1 className="text-3xl font-bold">Account Settings</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-4 mt-4">
              <Card>
                <form onSubmit={handleUpdateProfile}>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal information and how we can contact you.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col items-center mb-6">
                      <div 
                        className="relative w-24 h-24 rounded-full overflow-hidden bg-secondary cursor-pointer group"
                        onClick={handleAvatarClick}
                      >
                        {user.user_metadata?.avatar_url ? (
                          <Image 
                            src={user.user_metadata.avatar_url} 
                            alt="Profile" 
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Camera className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {isUploading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                          ) : (
                            <Upload className="h-6 w-6 text-white" />
                          )}
                        </div>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Click to upload a profile picture
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName" 
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="John Doe" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={formData.email}
                        disabled
                        placeholder="john@example.com" 
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed. Contact support if you need to update your email.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4 mt-4">
              <Card>
                <form onSubmit={handleUpdatePassword}>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input 
                        id="currentPassword" 
                        type="password" 
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input 
                        id="newPassword" 
                        type="password" 
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password" 
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Delete Account</CardTitle>
                  <CardDescription>
                    Permanently delete your account and all your data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    This action cannot be undone. Once you delete your account, all your data will be permanently removed.
                  </p>
                </CardContent>
                <CardFooter>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                          </>
                        ) : (
                          "Delete Account"
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Yes, delete my account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="subscription" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan: {profile?.subscription_tier === 'premium' ? 'Premium' : 'Free'}</CardTitle>
                  <CardDescription>
                    {profile?.subscription_tier === 'premium' 
                      ? 'You have unlimited access to all features.'
                      : 'You are on the free plan with limited features.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Documents created this month</span>
                      <span>{profile?.documents_created_this_month || 0}/{profile?.subscription_tier === 'premium' ? '∞' : '3'}</span>
                    </div>
                    {profile?.subscription_tier !== 'premium' && (
                      <div className="w-full bg-secondary rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${Math.min((profile?.documents_created_this_month || 0) / 3 * 100, 100)}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  
                  {profile?.subscription_tier === 'premium' && (
                    <div>
                      <h4 className="font-medium">Premium Benefits</h4>
                      <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground">
                        <li>Unlimited document creation</li>
                        <li>Access to all premium templates</li>
                        <li>No watermarks on documents</li>
                        <li>Priority support</li>
                      </ul>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {profile?.subscription_tier === 'premium' ? (
                    <Button variant="outline">Manage Subscription</Button>
                  ) : (
                    <Button onClick={() => router.push("/pricing")}>Upgrade to Premium</Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}