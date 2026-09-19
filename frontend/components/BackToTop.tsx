"use client";

import {
  ArrowUp
} from "lucide-react";

import {
  useEffect,
  useState
} from "react";


// =========================================================
// BACK TO TOP
// =========================================================

export default function BackToTop() {

  const [
    visible,
    setVisible
  ] = useState(
    false
  );


  // =======================================================
  // SHOW BUTTON AFTER SCROLLING DOWN
  // =======================================================

  useEffect(() => {

    function handleScroll() {

      setVisible(
        window.scrollY > 400
      );

    }


    handleScroll();


    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true
      }
    );


    return () => {

      window.removeEventListener(
        "scroll",
        handleScroll
      );

    };

  }, []);


  // =======================================================
  // HIDE WHEN NEAR TOP
  // =======================================================

  if (
    !visible
  ) {

    return null;

  }


  // =======================================================
  // UI
  // =======================================================

  return (

    <button

      type="button"

      onClick={() => {

        window.scrollTo({

          top: 0,

          behavior:
            "smooth",

        });

      }}

      aria-label="Back to top"

      title="Back to top"

      className="
        fixed
        bottom-6
        right-5
        z-50
        flex
        h-12
        w-12
        items-center
        justify-center
        rounded-full
        bg-black
        text-white
        shadow-lg
        transition
        hover:bg-gray-800
        focus:outline-none
        focus:ring-2
        focus:ring-black
        focus:ring-offset-2
        sm:bottom-8
        sm:right-8
      "

    >

      <ArrowUp
        size={21}
        strokeWidth={2.4}
      />

    </button>

  );

}