"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password?type=recovery`,
      });

      if (error) throw error;
      
      setEmailSent(true);
      toast({
        title: "Email envoyé",
        description: "Vérifiez votre email pour le lien de réinitialisation",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-grow flex items-center justify-center bg-gradient-to-b from-background to-muted">
        <div className="card-container">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Mot de passe oublié</CardTitle>
              <CardDescription className="text-muted-foreground">
                {emailSent 
                  ? "Vérifiez votre email pour le lien de réinitialisation"
                  : "Entrez votre email pour recevoir un lien de réinitialisation"}
              </CardDescription>
            </CardHeader>
            {!emailSent ? (
              <form onSubmit={handleSubmit} className="form-container">
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      className="input-field"
                      placeholder="email@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button 
                    type="submit" 
                    className="btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
                  </Button>
                  <div className="text-center text-sm text-muted-foreground">
                    Vous vous souvenez de votre mot de passe ?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                      Se connecter
                    </Link>
                  </div>
                </CardFooter>
              </form>
            ) : (
              <CardFooter className="flex justify-center">
                <Button 
                  className="btn-primary"
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                >
                  Renvoyer l'email
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
