"use client";

import { SignInButton } from "@farcaster/auth-kit";

export const Header = () => {
  return (
    <header className=" text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div></div>
          <h1 className="text-4xl font-bold tracking-wider text-center md:text-center pt-4">
            <img src="/logo_cliped.png" alt="logo" className="inline h-14" />
          </h1>
          <div className="justify-self-center md:justify-self-end">
            {/* <SignInButton /> */}
          </div>
        </div>
        <nav className="mt-6">
          <ul className="flex flex-col items-center space-y-2 md:flex-row md:justify-center md:space-x-4 md:space-y-0">
            <li>
              <a
                href="/register"
                className="hover:text-indigo-200 transition duration-300"
              >
                Register
              </a>
            </li>
            <li>
              <a
                href="/list"
                className="hover:text-indigo-200 transition duration-300"
              >
                Explore
              </a>
            </li>
            <li>
              <a
                href="/"
                className="hover:text-indigo-200 transition duration-300"
              >
                About
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
