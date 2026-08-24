from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from nutrition import build_nutrition_plan
from workout import build_workout_plan
from coach import build_coach_response


# =========================================================
# CREATE FASTAPI APP
# =========================================================

app = FastAPI(
    title="AI Wellness Coach API",
    description="Backend API for AI Wellness Coach",
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================
#
# Local development:
#   http://localhost:3000
#   http://127.0.0.1:3000
#
# Production:
#   Any Vercel deployment under *.vercel.app
#
# This avoids having to update CORS every time
# Vercel generates a new deployment URL.
#
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],

    allow_origin_regex=r"https://.*\.vercel\.app",

    allow_credentials=True,

    allow_methods=[
        "*"
    ],

    allow_headers=[
        "*"
    ],
)


# =========================================================
# REQUEST MODELS
# =========================================================

class NutritionRequest(BaseModel):
    profile: dict


class WorkoutRequest(BaseModel):
    profile: dict


class CoachRequest(BaseModel):
    question: str
    profile: dict
    nutrition_plan: Any = None
    workout_plan: Any = None
    tracker_history: Any = None


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "message":
            "AI Wellness Coach API is running!"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health_check():

    return {
        "status":
            "healthy"
    }


# =========================================================
# NUTRITION PLAN
# =========================================================

@app.post("/nutrition-plan")
def nutrition_plan(
    request: NutritionRequest
):

    try:

        print(
            "\n===================================="
        )

        print(
            "NUTRITION PLAN REQUEST RECEIVED"
        )

        print(
            "===================================="
        )

        plan = build_nutrition_plan(
            request.profile
        )

        return {
            "success":
                True,

            "plan":
                plan
        }


    except Exception as error:

        print(
            "\n===================================="
        )

        print(
            "NUTRITION ERROR"
        )

        print(
            "===================================="
        )

        print(
            repr(
                error
            )
        )

        return {
            "success":
                False,

            "error":
                str(
                    error
                )
        }


# =========================================================
# WORKOUT PLAN
# =========================================================

@app.post("/workout-plan")
def workout_plan(
    request: WorkoutRequest
):

    try:

        print(
            "\n===================================="
        )

        print(
            "WORKOUT PLAN REQUEST RECEIVED"
        )

        print(
            "===================================="
        )

        plan = build_workout_plan(
            request.profile
        )

        return {
            "success":
                True,

            "plan":
                plan
        }


    except Exception as error:

        print(
            "\n===================================="
        )

        print(
            "WORKOUT ERROR"
        )

        print(
            "===================================="
        )

        print(
            repr(
                error
            )
        )

        return {
            "success":
                False,

            "error":
                str(
                    error
                )
        }


# =========================================================
# AI COACH
# =========================================================

@app.post("/coach")
def coach(
    request: CoachRequest
):

    try:

        print(
            "\n===================================="
        )

        print(
            "COACH REQUEST RECEIVED"
        )

        print(
            "===================================="
        )

        if not request.question.strip():

            return {
                "success":
                    False,

                "error":
                    "Please enter a question."
            }


        answer = build_coach_response(

            question=
                request.question,

            profile=
                request.profile,

            nutrition_plan=
                request.nutrition_plan,

            workout_plan=
                request.workout_plan,

            tracker_history=
                request.tracker_history,

        )


        return {
            "success":
                True,

            "answer":
                answer
        }


    except Exception as error:

        print(
            "\n===================================="
        )

        print(
            "AI COACH ERROR"
        )

        print(
            "===================================="
        )

        print(
            repr(
                error
            )
        )

        return {
            "success":
                False,

            "error":
                str(
                    error
                )
        }