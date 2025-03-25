"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidLink, setIsValidLink] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const type = searchParams.get("type");
    
    if (token && type === "recovery") {
      setToken(token);
      setIsValidLink(true);
    } else {
      setIsValidLink(false);
      toast({
        title: "Lien invalide",
        description: "Le lien de réinitialisation est incorrect ou a expiré",
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.updateUser(
        { password },
        { 
          accessToken: token 
        }
      );

      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Votre mot de passe a été mis à jour",
      });

      router.push("/login");
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

  if (!isValidLink) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-grow flex items-center justify-center bg-gradient-to-b from-background to-muted">
          <div className="card-container">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Lien invalide</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Le lien de réinitialisation est incorrect ou a expiré
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center">
                <Link href="/forgot-password" className="w-full max-w-xs">
                  <Button className="btn-primary">
                    Demander un nouveau lien
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-grow flex items-center justify-center bg-gradient-to-b from-background to-muted">
        <div className="card-container">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Réinitialiser le mot de passe</CardTitle>
              <CardDescription className="text-muted-foreground">
                Entrez votre nouveau mot de passe ci-dessous
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit} className="form-container">
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nouveau mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    className="input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="input-field"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Mise à jour..." : "Mettre à jour"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
