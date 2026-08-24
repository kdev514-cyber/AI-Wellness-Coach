"use client";

import Link from "next/link";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import { supabase } from "../lib/supabase";


// =========================================================
// NAVIGATION ITEMS
// =========================================================

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "🏠",
  },
  {
    name: "Nutrition",
    href: "/nutrition",
    icon: "🥗",
  },
  {
    name: "Workout",
    href: "/workout",
    icon: "🏋️",
  },
  {
    name: "Daily Tracker",
    href: "/tracker",
    icon: "✅",
  },
  {
    name: "Progress",
    href: "/progress",
    icon: "📈",
  },
  {
    name: "AI Coach",
    href: "/coach",
    icon: "🤖",
  },
  {
    name: "Profile",
    href: "/profile",
    icon: "👤",
  },
];


// =========================================================
// APP SIDEBAR
// =========================================================

export default function AppSidebar() {

  const pathname = usePathname();

  const router = useRouter();


  // =====================================================
  // LOGOUT
  // =====================================================

  async function handleLogout() {

    const {
      error,
    } = await supabase.auth.signOut();


    if (error) {

      console.error(
        "Logout error:",
        error
      );

      return;

    }


    router.replace(
      "/login"
    );

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <aside
      className="
        w-64
        min-h-screen
        bg-white
        border-r
        border-gray-200
        p-6
        flex
        flex-col
        shrink-0
      "
    >


      {/* ================================================
          BRAND
      ================================================ */}

      <div className="mb-10">

        <Link
          href="/dashboard"
          className="block"
        >

          <h1 className="text-xl font-bold text-black">

            AI Wellness Coach

          </h1>


          <p className="text-sm text-gray-500 mt-1">

            Personal wellness

          </p>

        </Link>

      </div>


      {/* ================================================
          MAIN NAVIGATION
      ================================================ */}

      <nav className="space-y-2 flex-1">

        {navItems.map((item) => {

          const isActive =
            pathname === item.href ||
            pathname.startsWith(
              `${item.href}/`
            );


          return (

            <Link

              key={item.href}

              href={item.href}

              className={`
                flex
                items-center
                gap-3
                rounded-xl
                px-4
                py-3
                transition-all
                duration-200

                ${
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-black"
                }
              `}

            >

              <span className="text-lg">

                {item.icon}

              </span>


              <span className="font-medium">

                {item.name}

              </span>

            </Link>

          );

        })}

      </nav>


      {/* ================================================
          BOTTOM SECTION
      ================================================ */}

      <div
        className="
          pt-6
          mt-6
          border-t
          border-gray-200
        "
      >


        {/* BACK TO DASHBOARD */}

        {pathname !== "/dashboard" && (

          <Link

            href="/dashboard"

            className="
              flex
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-gray-700
              hover:bg-gray-100
              hover:text-black
              transition
            "

          >

            <span className="text-lg">

              ←

            </span>


            <span className="font-medium">

              Back to Dashboard

            </span>

          </Link>

        )}


        {/* LOGOUT */}

        <button

          type="button"

          onClick={handleLogout}

          className="
            mt-2
            w-full
            flex
            items-center
            gap-3
            rounded-xl
            px-4
            py-3
            text-red-600
            hover:bg-red-50
            transition
            cursor-pointer
          "

        >

          <span className="text-lg">

            ↪

          </span>


          <span className="font-medium">

            Logout

          </span>

        </button>

      </div>


    </aside>

  );

}