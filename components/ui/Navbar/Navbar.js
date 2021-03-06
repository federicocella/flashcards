import Link from 'next/link';
import s from './Navbar.module.css';

import Logo from '@/components/icons/Logo';
import { useUser } from '@/utils/useUser';

const Navbar = () => {
  const { user, signOut } = useUser();

  return (
    <nav className={s.root}>
      <a href="#skip" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <div className="mx-auto max-w-8xl px-8">
        <div className="flex justify-between align-center flex-row py-4 md:py-4 relative">
          <div className="flex flex-1 items-center">
            <Link href="/">
              <a className="text-xl font-extrabold mr-4 text-accents-0" aria-label="Logo">
                Flashdex
              </a>
            </Link>
            <nav className="space-x-2 ml-6 hidden lg:block">
              {user ? <Link href="/dashboard">
                <a className={s.link}>Dashboard</a>
              </Link> : ''}
              {!user ? <Link href="/pricing">
                <a className={s.link}>Pricing</a>
              </Link> : ''}
              {user ? <Link href="/account">
                <a className={s.link}>Account</a>
              </Link> : ''}
            </nav>
          </div>

          <div className="flex flex-1 justify-end space-x-8">
            {user ? (
              <div className="flex items-center">
                <div className="mr-4">{user.email}</div>
                <Link href="#">
                  <a className={s.link} onClick={() => signOut()}>
                    Sign out
                  </a>
                </Link>
              </div>
            ) : (
              <Link href="/signin">
                <a className={s.link}>Sign in</a>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav >
  );
};

export default Navbar;
