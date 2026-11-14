"use client";

import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState } from "react";

const navigation = [
  { name: "Features", href: "#features" },
  { name: "Auth", href: "#auth" },
  { name: "Docs", href: "https://docs.aws.amazon.com/cognito/" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="text-lg font-semibold tracking-tight text-white">
              Cognito App
            </span>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-slate-200"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden className="size-6" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-10">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-slate-200 transition hover:text-white"
              {...(item.href.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {item.name}
            </a>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <a
            href="#auth"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/10"
          >
            Sign in
          </a>
          <a
            href="#auth"
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-400"
          >
            Get started
          </a>
        </div>
      </nav>

      <Dialog
        open={mobileOpen}
        onClose={setMobileOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-50 bg-slate-950/80" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-slate-900 p-6 sm:max-w-sm sm:ring-1 sm:ring-white/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="text-lg font-semibold text-white">
                Cognito App
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-slate-200"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-white/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium text-white hover:bg-white/5"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              <div className="py-6">
                <Disclosure as="div">
                  <DisclosureButton className="flex w-full items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-left text-sm font-medium text-white">
                    Account
                  </DisclosureButton>
                  <DisclosurePanel className="mt-2 space-y-2 px-3">
                    <a
                      href="#auth"
                      className="block rounded-lg py-2 text-sm text-slate-300 hover:text-white"
                    >
                      Sign in
                    </a>
                    <a
                      href="#auth"
                      className="block rounded-lg py-2 text-sm text-indigo-300 hover:text-indigo-200"
                    >
                      Create account
                    </a>
                  </DisclosurePanel>
                </Disclosure>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
