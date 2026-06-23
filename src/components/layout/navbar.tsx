"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { LogoutButton } from "@/components/auth/logout-button";
import { Menu, X, LayoutDashboard, PlusCircle } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="border-b bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary">
              AI App Generator
            </Link>
            {session && (
              <div className="hidden md:flex ml-10 space-x-4">
                <Link
                  href="/"
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Apps
                </Link>
                <Link
                  href="/builder"
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Builder
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                <NotificationBell />
                <div className="hidden md:flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {session.user?.name || session.user?.email}
                  </span>
                  <LogoutButton />
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
              >
                Sign In
              </Link>
            )}

            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && session && (
        <div className="md:hidden border-t px-4 py-3 space-y-2">
          <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">
            My Apps
          </Link>
          <Link href="/builder" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">
            Builder
          </Link>
          <div className="pt-2 border-t">
            <LogoutButton />
          </div>
        </div>
      )}
    </nav>
  );
}
