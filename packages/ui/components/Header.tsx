import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { LANGUAGE } from '@repo/shared/enums/Language';
import { useSession } from '../hooks/useSession';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import { useAppStore } from '../hooks/useAppStore';
import { isProfileAdmin } from '@repo/shared/utils/access';
import { useTypedTranslation } from '../hooks/useTypedTranslation';

const Header: React.FC = () => {
  const { t, i18n } = useTypedTranslation();
  const { session, ready } = useSession();
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const { app_name } = useAppStore((state) => state.appConfig);
  const profile = useProfile();
  const isSignedIn = ready && !!session?.user;
  const navigate = useNavigate();

  const handleLanguageChange = (newIso: string) => {
    void i18n.changeLanguage(newIso);
  };

  const availableLangs = Object.values(LANGUAGE);
  const currentLang = availableLangs.find((l) => l.ISO639 === i18n.language) || LANGUAGE.EN;

  const isAdmin = profile && isProfileAdmin(profile);

  const initials =
      profile?.full_name
        ?.split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() ?? '👤';

  return (
    <header className="py-4 px-4 sm:px-6 shadow-md mb-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Link to="/">{app_name}</Link>
        </h1>

        <button
          className="sm:hidden flex flex-col justify-center items-center w-10 h-10 rounded focus:outline-none"
          aria-label="Open menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className={`block w-6 h-0.5 bg-black mb-1 transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-black mb-1 transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-black transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
        </button>

        <div className={`items-center flex-wrap gap-2 hidden sm:flex`}>
          <Select value={currentLang.ISO639} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-24 bg-white">
              <SelectValue placeholder={currentLang.NATIVE_NAME.toUpperCase()} />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {availableLangs.map((lang) => (
                <SelectItem key={lang.ISO639} value={lang.ISO639}>
                  {lang.NATIVE_NAME} {lang.ISO639 === 'sk' ? t('slovakLanguageNote') : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {ready && !isSignedIn && (
            <>
              <Button asChild>
                <Link to="/auth" state={{ isSignIn: false }}>
                  {t('register')}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/auth" state={{ isSignIn: true }}>
                  {t('signIn')}
                </Link>
              </Button>
            </>
          )}

          {isSignedIn && (
            <>
              {isAdmin && (
                <Button variant="secondary" asChild>
                  <Link to="/admin">{t('adminSection')}</Link>
                </Button>
              )}
              <Link to="/profile">
                <Avatar>
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Link>
              <Button variant="destructive" onClick={() => {
                void signOut();
                navigate('/');
              }}>
                {t('signOut')}
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu drawer */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 sm:hidden" onClick={() => setMenuOpen(false)}>
            <div
              className="absolute top-0 right-0 w-64 h-full bg-white shadow-lg p-4 flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end">
                <button
                  className="text-2xl font-bold"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                >
                  &times;
                </button>
              </div>
              <Select value={currentLang.ISO639} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder={currentLang.NATIVE_NAME.toUpperCase()} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {availableLangs.map((lang) => (
                    <SelectItem key={lang.ISO639} value={lang.ISO639}>
                      {lang.NATIVE_NAME} {lang.ISO639 === 'sk' ? t('slovakLanguageNote') : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {ready && !isSignedIn && (
                <>
                  <Button asChild className="w-full" onClick={() => setMenuOpen(false)}>
                    <Link to="/auth" state={{ isSignIn: false }}>
                      {t('register')}
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full" onClick={() => setMenuOpen(false)}>
                    <Link to="/auth" state={{ isSignIn: true }}>
                      {t('signIn')}
                    </Link>
                  </Button>
                </>
              )}
              {isSignedIn && (
                <>
                  {isAdmin && (
                    <Button variant="secondary" asChild className="w-full" onClick={() => setMenuOpen(false)}>
                      <Link to="/admin">{t('adminSection')}</Link>
                    </Button>
                  )}
                  <Link to="/profile" onClick={() => setMenuOpen(false)}>
                    <Avatar>
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      setMenuOpen(false);
                      void signOut();
                      navigate('/');
                    }}
                  >
                    {t('signOut')}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
