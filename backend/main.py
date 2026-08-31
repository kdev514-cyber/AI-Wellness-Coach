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

    title="Daily Ally API",

    description="Backend API for Daily Ally",

    version="1.0.0",

)


# =========================================================
# CORS
# =========================================================

app.add_middleware(

    CORSMiddleware,

    allow_origins=[

        "http://localhost:3000",

        "http://127.0.0.1:3000",

        # Stable Vercel production domain

        "https://daily-ally8701.vercel.app",

    ],

    # Also allow Vercel preview/deployment URLs

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
            "Daily Ally API is running!"

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

            repr(error)

        )

        return {

            "success":
                False,

            "error":
                str(error)

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

            repr(error)

        )

        return {

            "success":
                False,

            "error":
                str(error)

        }


# =========================================================
# NALAMERA
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

            "NALAMERA REQUEST RECEIVED"

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

            "NALAMERA ERROR"

        )

        print(

            "===================================="

        )

        print(

            repr(error)

        )

        return {

            "success":
                False,

            "error":
                str(error)

        }