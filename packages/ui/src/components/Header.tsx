import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { LANGUAGE, Language } from '@repo/frontend-utils/src/enums/Language';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useAuth } from '../hooks/useAuth';
import { useAppStore } from '../hooks/useAppStore';
import { isProfileAdmin } from '../lib/access';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { createInitials } from '../lib/usernameUtils';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const { i18n } = useTypedTranslation();
  const { session, ready, profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const appName = useAppStore((state) => state.appConfig.appName);
  const isSignedIn = ready && !!session?.user;
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Disable language change on /chat/* but allow on /chat or /chat/
  const isLanguageChangeDisabled = /^\/chat\/.+/.test(pathname);

  const availableLangs = Object.values(LANGUAGE);
  const currentLang = availableLangs.find((l) => l.ISO639 === i18n.language) ?? LANGUAGE.EN;

  const isAdmin = !!profile && isProfileAdmin(profile);
  const initials = createInitials(profile?.fullName);

  const handleLanguageChange = (newIso: string) => {
    if (isLanguageChangeDisabled) return;
    void i18n.changeLanguage(newIso);
  };

  return (
    <header className="py-4 px-4 sm:px-6 shadow-md mb-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Link to="/">{appName}</Link>
        </h1>

        <BurgerButton open={menuOpen} onToggle={() => {
          setMenuOpen((o) => !o);
        }}/>

        {/* Desktop */}
        <div className="items-center flex-wrap gap-2 hidden sm:flex">
          <ThemeToggle/>
          <LanguageSelector
            availableLangs={availableLangs}
            currentLang={currentLang}
            disabled={isLanguageChangeDisabled}
            onChange={handleLanguageChange}
            compact
          />

          {!isSignedIn && ready && (
            <AuthButtons/>
          )}

          {isSignedIn && (
            <>
              {isAdmin && <AdminSectionButton/>}
              <ProfileAvatarLink initials={initials}/>
              <SignOutBtn
                onSignOut={() => {
                  void signOut().then(() => {
                    void navigate('/');
                  });
                }}
              />
            </>
          )}
        </div>

        {/* Mobile menu */}
        <MobileMenuDrawer open={menuOpen} onClose={() => {
          setMenuOpen(false);
        }}>
          <ThemeToggle/>
          <LanguageSelector
            availableLangs={availableLangs}
            currentLang={currentLang}
            disabled={isLanguageChangeDisabled}
            onChange={(iso) => {
              handleLanguageChange(iso);
            }}
          />

          {!isSignedIn && ready && (
            <AuthButtons fullWidth onAnyClick={() => {
              setMenuOpen(false);
            }}/>
          )}

          {isSignedIn && (
            <>
              {isAdmin && <AdminSectionButton fullWidth onClick={() => {
                setMenuOpen(false);
              }}/>}
              <ProfileAvatarLink initials={initials} onClick={() => {
                setMenuOpen(false);
              }}/>
              <SignOutBtn
                fullWidth
                onSignOut={() => {
                  setMenuOpen(false);
                  void signOut().then(() => {
                    void navigate('/');
                  });
                }}
              />
            </>
          )}
        </MobileMenuDrawer>
      </div>
    </header>
  );
}


const BurgerButton: React.FC<{ open: boolean; onToggle: () => void }> = ({ open, onToggle }) => {
  const { t } = useTypedTranslation();
  return (
    <button
      className="sm:hidden flex flex-col justify-center items-center w-11 h-11 rounded outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
      aria-expanded={open}
      onClick={onToggle}
    >
      <span aria-hidden="true" className={`block w-6 h-0.5 bg-foreground mb-1 transition-all ${open ? 'rotate-45 translate-y-1.5' : ''}`}/>
      <span aria-hidden="true" className={`block w-6 h-0.5 bg-foreground mb-1 transition-all ${open ? 'opacity-0' : ''}`}/>
      <span aria-hidden="true" className={`block w-6 h-0.5 bg-foreground transition-all ${open ? '-rotate-45 -translate-y-1.5' : ''}`}/>
    </button>
  );
};


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
        className={`${compact ? 'w-24' : 'w-full'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        disabled={disabled}
        title={disabled ? t('languageChangeDisabledInChat') : undefined}
        aria-disabled={disabled}
        aria-label={t('nav.selectLanguage')}
      >
        <SelectValue placeholder={currentLang.NATIVE_NAME.toUpperCase()}/>
      </SelectTrigger>
      <SelectContent>
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
        <Link to="/register" >
          {t('register')}
        </Link>
      </Button>
      <Button variant="outline" asChild className={fullWidth ? 'w-full' : undefined} onClick={onAnyClick}>
        <Link to="/sign-in" >
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
}> = ({ initials, onClick }) => {
  const { t } = useTypedTranslation();
  return (
    <Link
      to="/profile"
      onClick={onClick}
      aria-label={t('nav.profile')}
      className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <Avatar>
        <AvatarFallback aria-hidden="true">{initials}</AvatarFallback>
      </Avatar>
    </Link>
  );
};

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
  const { t } = useTypedTranslation();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 sm:hidden" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.menu')}
        tabIndex={-1}
        className="absolute top-0 right-0 w-64 h-full overflow-y-auto bg-background text-foreground shadow-lg p-4 flex flex-col gap-4"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="flex justify-end">
          <button
            className="flex items-center justify-center w-11 h-11 rounded text-2xl font-bold outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            aria-label={t('nav.closeMenu')}
            onClick={onClose}
          >
                        &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
