"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  LayoutDashboard,
  Salad,
  Dumbbell,
  ListChecks,
  ChartNoAxesCombined,
  Bot,
  UserRound,
  LogOut,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";


// =========================================================
// NAVIGATION ITEMS
// =========================================================

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Nutrition",
    href: "/nutrition",
    icon: Salad,
  },
  {
    name: "Workout",
    href: "/workout",
    icon: Dumbbell,
  },
  {
    name: "Daily Tracker",
    href: "/tracker",
    icon: ListChecks,
  },
  {
    name: "Progress",
    href: "/progress",
    icon: ChartNoAxesCombined,
  },
  {
    name: "Ask Nalamera",
    href: "/coach",
    icon: Bot,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: UserRound,
  },
];


// =========================================================
// SIDEBAR
// =========================================================

export default function AppSidebar() {

  const pathname =
    usePathname();

  const router =
    useRouter();

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);


  // =====================================================
  // CLOSE MOBILE MENU AFTER ROUTE CHANGE
  // =====================================================

  useEffect(() => {

    setMobileMenuOpen(
      false
    );

  }, [
    pathname,
  ]);


  // =====================================================
  // PREVENT PAGE SCROLL WHILE MOBILE MENU IS OPEN
  // =====================================================

  useEffect(() => {

    if (
      mobileMenuOpen
    ) {

      document.body.style.overflow =
        "hidden";

    } else {

      document.body.style.overflow =
        "";

    }


    return () => {

      document.body.style.overflow =
        "";

    };

  }, [
    mobileMenuOpen,
  ]);


  // =====================================================
  // LOGOUT
  // =====================================================

  async function handleLogout() {

    const {
      error,
    } =
      await supabase.auth.signOut();


    if (
      error
    ) {

      console.error(
        "Logout error:",
        error
      );

      return;
    }


    setMobileMenuOpen(
      false
    );


    router.replace(
      "/login"
    );
  }


  // =====================================================
  // NAVIGATION CONTENT
  // =====================================================

  function NavigationContent() {

    return (

      <>

        {/* BRAND */}

        <div className="mb-8">

          <Link
            href="/dashboard"
            className="block"
          >

            <h1
              className="
                text-xl
                font-bold
                text-black
              "
            >

              Daily Ally

            </h1>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
              "
            >

              Your everyday wellness companion

            </p>

          </Link>

        </div>


        {/* NAVIGATION */}

        <nav
          className="
            flex-1
            space-y-2
          "
        >

          {
            navItems.map(
              (
                item
              ) => {

                const Icon =
                  item.icon;


                const isActive =
                  pathname ===
                    item.href ||
                  pathname.startsWith(
                    `${item.href}/`
                  );


                return (

                  <Link

                    key={
                      item.href
                    }

                    href={
                      item.href
                    }

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

                    <Icon
                      size={20}
                      strokeWidth={1.8}
                    />

                    <span
                      className="
                        font-medium
                      "
                    >

                      {
                        item.name
                      }

                    </span>

                  </Link>

                );
              }
            )
          }

        </nav>


        {/* BOTTOM */}

        <div
          className="
            mt-6
            border-t
            border-gray-200
            pt-6
          "
        >

          {
            pathname !==
              "/dashboard" && (

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
                  transition
                  hover:bg-gray-100
                  hover:text-black
                "

              >

                <ArrowLeft
                  size={20}
                  strokeWidth={1.8}
                />

                <span
                  className="
                    font-medium
                  "
                >

                  Back to Dashboard

                </span>

              </Link>

            )
          }


          <button

            type="button"

            onClick={
              handleLogout
            }

            className="
              mt-2
              flex
              w-full
              cursor-pointer
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-red-600
              transition
              hover:bg-red-50
            "

          >

            <LogOut
              size={20}
              strokeWidth={1.8}
            />

            <span
              className="
                font-medium
              "
            >

              Logout

            </span>

          </button>

        </div>

      </>

    );
  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <>

      {/* =================================================
          DESKTOP SIDEBAR
      ================================================= */}

      <aside
        className="
          hidden
          min-h-screen
          w-64
          shrink-0
          flex-col
          border-r
          border-gray-200
          bg-white
          p-6
          lg:flex
        "
      >

        <NavigationContent />

      </aside>


      {/* =================================================
          MOBILE TOP BAR
      ================================================= */}

      <header
        className="
          fixed
          left-0
          right-0
          top-0
          z-40
          flex
          h-16
          items-center
          justify-between
          border-b
          border-gray-200
          bg-white
          px-4
          lg:hidden
        "
      >

        <Link
          href="/dashboard"
          className="
            min-w-0
          "
        >

          <p
            className="
              truncate
              text-base
              font-bold
              text-black
            "
          >

            Daily Ally

          </p>

        </Link>


        <button

          type="button"

          aria-label="Open navigation menu"

          onClick={() =>
            setMobileMenuOpen(
              true
            )
          }

          className="
            flex
            h-10
            w-10
            cursor-pointer
            items-center
            justify-center
            rounded-xl
            border
            border-gray-200
            bg-white
            text-black
            transition
            hover:bg-gray-100
          "

        >

          <Menu
            size={22}
            strokeWidth={1.8}
          />

        </button>

      </header>


      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {
        mobileMenuOpen && (

          <div
            className="
              fixed
              inset-0
              z-50
              lg:hidden
            "
          >

            {/* BACKDROP */}

            <button

              type="button"

              aria-label="Close navigation menu"

              onClick={() =>
                setMobileMenuOpen(
                  false
                )
              }

              className="
                absolute
                inset-0
                h-full
                w-full
                cursor-default
                bg-black/40
              "

            />


            {/* DRAWER */}

            <aside
              className="
                absolute
                left-0
                top-0
                flex
                h-full
                w-[85%]
                max-w-[320px]
                flex-col
                overflow-y-auto
                bg-white
                p-6
                shadow-xl
              "
            >

              {/* CLOSE BUTTON */}

              <div
                className="
                  mb-6
                  flex
                  justify-end
                "
              >

                <button

                  type="button"

                  aria-label="Close navigation menu"

                  onClick={() =>
                    setMobileMenuOpen(
                      false
                    )
                  }

                  className="
                    flex
                    h-10
                    w-10
                    cursor-pointer
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-gray-200
                    text-black
                    transition
                    hover:bg-gray-100
                  "

                >

                  <X
                    size={22}
                    strokeWidth={1.8}
                  />

                </button>

              </div>


              <NavigationContent />

            </aside>

          </div>

        )
      }

    </>

  );
}