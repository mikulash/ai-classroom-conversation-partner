import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { LANGUAGE, Language } from '@repo/shared/enums/Language';
import { useSession } from '../hooks/useSession';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import { useAppStore } from '../hooks/useAppStore';
import { isProfileAdmin } from '@repo/shared/utils/access';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { createInitials } from '@repo/shared/utils/usernameUtils';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '../lib/utils';

export function Header() {
  const { i18n } = useTypedTranslation();
  const { session, ready } = useSession();
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const { app_name } = useAppStore((state) => state.appConfig);
  const profile = useProfile();
  const isSignedIn = ready && !!session?.user;
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Disable language change on /chat/* but allow on /chat or /chat/
  const langDisabled = /^\/chat\/.+/.test(pathname);

  const availableLangs = Object.values(LANGUAGE);
  const currentLang = availableLangs.find((l) => l.ISO639 === i18n.language) || LANGUAGE.EN;

  const isAdmin = !!profile && isProfileAdmin(profile);
  const initials = createInitials(profile?.full_name);

  const handleLanguageChange = (newIso: string) => {
    if (langDisabled) return;
    void i18n.changeLanguage(newIso);
  };

  return (
    <header className="py-4 px-4 sm:px-6 shadow-sm mb-4 bg-background text-foreground border-b border-border/60">
      <div className="container mx-auto flex justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">
          <Link to="/">{app_name}</Link>
        </h1>

        <BurgerButton open={menuOpen} onToggle={() => setMenuOpen((o) => !o)}/>

        {/* Desktop */}
        <div className="items-center flex-wrap gap-2 hidden sm:flex">
          <LanguageSelector
            availableLangs={availableLangs}
            currentLang={currentLang}
            disabled={langDisabled}
            onChange={handleLanguageChange}
            compact
          />

          <ThemeToggle/>

          {!isSignedIn && ready && (
            <AuthButtons/>
          )}

          {isSignedIn && (
            <>
              {isAdmin && <AdminSectionButton/>}
              <ProfileAvatarLink initials={initials}/>
              <SignOutBtn
                onSignOut={() => {
                  void signOut();
                  navigate('/');
                }}
              />
            </>
          )}
        </div>

        {/* Mobile menu */}
        <MobileMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)}>
          <LanguageSelector
            availableLangs={availableLangs}
            currentLang={currentLang}
            disabled={langDisabled}
            onChange={(iso) => {
              handleLanguageChange(iso);
            }}
          />

          <ThemeToggle fullWidth/>

          {!isSignedIn && ready && (
            <AuthButtons fullWidth onAnyClick={() => setMenuOpen(false)}/>
          )}

          {isSignedIn && (
            <>
              {isAdmin && <AdminSectionButton fullWidth onClick={() => setMenuOpen(false)}/>}
              <ProfileAvatarLink initials={initials} onClick={() => setMenuOpen(false)}/>
              <SignOutBtn
                fullWidth
                onSignOut={() => {
                  setMenuOpen(false);
                  void signOut();
                  navigate('/');
                }}
              />
            </>
          )}
        </MobileMenuDrawer>
      </div>
    </header>
  );
}


const BurgerButton: React.FC<{ open: boolean; onToggle: () => void }> = ({ open, onToggle }) => (
  <button
    className="sm:hidden flex flex-col justify-center items-center w-10 h-10 rounded-md border border-border/60 bg-card text-foreground focus:outline-none"
    aria-label={open ? 'Close menu' : 'Open menu'}
    aria-expanded={open}
    onClick={onToggle}
  >
    <span className={`block w-6 h-0.5 bg-foreground mb-1 transition-all ${open ? 'rotate-45 translate-y-1.5' : ''}`}/>
    <span className={`block w-6 h-0.5 bg-foreground mb-1 transition-all ${open ? 'opacity-0' : ''}`}/>
    <span className={`block w-6 h-0.5 bg-foreground transition-all ${open ? '-rotate-45 -translate-y-1.5' : ''}`}/>
  </button>
);


const LanguageSelector: React.FC<{
    availableLangs: Language[];
    currentLang: Language;
    disabled?: boolean;
    onChange: (iso: string) => void;
    compact?: boolean; // desktop small width
}> = ({ availableLangs, currentLang, disabled, onChange, compact }) => {
  const { t } = useTypedTranslation();
  return (
    <Select value={currentLang.ISO639} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          compact ? 'w-24' : 'w-full',
          'bg-background dark:bg-input/30',
          disabled && 'opacity-60 cursor-not-allowed',
        )}
        disabled={disabled}
        title={disabled ? (t?.('languageChangeDisabledInChat') ?? 'Language change is disabled inside a chat thread.') : undefined}
        aria-disabled={disabled}
      >
        <SelectValue placeholder={currentLang.NATIVE_NAME.toUpperCase()}/>
      </SelectTrigger>
      <SelectContent className="bg-popover text-popover-foreground">
        {availableLangs.map((lang) => (
          <SelectItem key={lang.ISO639} value={lang.ISO639} disabled={disabled}>
            {lang.NATIVE_NAME} {lang.ISO639 === 'sk' ? t('slovakLanguageNote') : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const AuthButtons: React.FC<{
    fullWidth?: boolean;
    onAnyClick?: () => void;
}> = ({ fullWidth, onAnyClick }) => {
  const { t } = useTypedTranslation();
  return (
    <>
      <Button asChild className={fullWidth ? 'w-full' : undefined} onClick={onAnyClick}>
        <Link to="/auth" state={{ isSignIn: false }}>
          {t('register')}
        </Link>
      </Button>
      <Button variant="outline" asChild className={fullWidth ? 'w-full' : undefined} onClick={onAnyClick}>
        <Link to="/auth" state={{ isSignIn: true }}>
          {t('signIn')}
        </Link>
      </Button>
    </>
  );
};

const AdminSectionButton: React.FC<{
    fullWidth?: boolean;
    onClick?: () => void;
}> = ({ fullWidth, onClick }) => {
  const { t } = useTypedTranslation();
  return (
    <Button variant="secondary" asChild className={fullWidth ? 'w-full' : undefined} onClick={onClick}>
      <Link to="/admin">{t('adminSection')}</Link>
    </Button>
  );
};

const ProfileAvatarLink: React.FC<{
    initials?: string;
    onClick?: () => void;
}> = ({ initials, onClick }) => (
  <Link to="/profile" onClick={onClick}>
    <Avatar>
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  </Link>
);

const SignOutBtn: React.FC<{
    onSignOut: () => void;
    fullWidth?: boolean;
}> = ({ onSignOut, fullWidth }) => {
  const { t } = useTypedTranslation();
  return (
    <Button variant="destructive" className={fullWidth ? 'w-full' : undefined} onClick={onSignOut}>
      {t('signOut')}
    </Button>
  );
};

const MobileMenuDrawer: React.FC<{
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 sm:hidden" onClick={onClose}>
      <div
        className="absolute top-0 right-0 w-64 h-full bg-card text-card-foreground border-l border-border shadow-lg p-4 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button className="text-2xl font-bold text-foreground" aria-label="Close menu" onClick={onClose}>
                        &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
