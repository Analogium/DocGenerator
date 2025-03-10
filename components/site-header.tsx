"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { FileText, User, CreditCard } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "react-i18next";

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <FileText className="h-6 w-6" />
            <span className="inline-block font-bold">{t('header.title')}</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <Link href="/pricing">
              <Button variant="ghost">{t('header.pricing')}</Button>
            </Link>
            
            {user ? (
              <>
                <Link href="/credits">
                  <Button variant="ghost">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Credits
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full overflow-hidden">
                      {user.user_metadata?.avatar_url ? (
                        <Image 
                          src={user.user_metadata.avatar_url} 
                          alt="Profile" 
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.user_metadata.full_name || 'User'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">{t('header.dashboard')}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account">{t('header.account')}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      {t('header.signOut')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">{t('header.login')}</Button>
                </Link>
                <Link href="/signup">
                  <Button>{t('header.signup')}</Button>
                </Link>
              </>
            )}
            <LanguageSwitcher />
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}