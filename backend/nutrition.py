import json
import os

from dotenv import load_dotenv
from groq import Groq


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv(".env")


# =========================================================
# GROQ API KEY
# =========================================================

groq_api_key = os.getenv("GROQ_API_KEY")

if not groq_api_key:
    raise ValueError(
        "GROQ_API_KEY was not found. "
        "Check your backend/.env file."
    )


# =========================================================
# CREATE GROQ CLIENT
# =========================================================

client = Groq(
    api_key=groq_api_key
)


# =========================================================
# BUILD 7-DAY NUTRITION PLAN
# =========================================================

def build_nutrition_plan(profile: dict):

    # -----------------------------------------------------
    # USER PROFILE
    # -----------------------------------------------------

    full_name = profile.get(
        "full_name",
        "User"
    )

    age = profile.get("age")

    gender = profile.get(
        "gender"
    )

    height_cm = profile.get(
        "height_cm"
    )

    weight_kg = profile.get(
        "weight_kg"
    )

    goal = profile.get(
        "goal"
    )

    activity_level = profile.get(
        "activity_level"
    )

    workout_days = profile.get(
        "workout_days"
    )

    workout_duration = profile.get(
        "workout_duration"
    )

    diet_preference = (
        profile.get("diet_preference")
        or "No specific preference"
    )

    favorite_foods = (
        profile.get("favorite_foods")
        or "None specified"
    )

    avoided_foods = (
        profile.get("avoided_foods")
        or "None specified"
    )

    allergies = (
        profile.get("allergies")
        or "None specified"
    )


    # =====================================================
    # SYSTEM PROMPT
    # =====================================================

    system_prompt = """
You are an AI general wellness nutrition planning assistant.

Create practical and sustainable nutrition plans.

Return ONLY valid JSON.

Do not return Markdown.

Do not explain your reasoning outside the JSON.

Do not diagnose medical conditions.

Do not prescribe medication.

Do not recommend extreme diets.
"""


    # =====================================================
    # USER PROMPT
    # =====================================================

    user_prompt = f"""
Create a personalized 7-day nutrition plan.

USER PROFILE

Name:
{full_name}

Age:
{age}

Gender:
{gender}

Height:
{height_cm} cm

Weight:
{weight_kg} kg

Primary Goal:
{goal}

Activity Level:
{activity_level}

Workout Days Per Week:
{workout_days}

Workout Duration:
{workout_duration} minutes

Diet Preference:
{diet_preference}

Foods User Enjoys:
{favorite_foods}

Foods User Avoids:
{avoided_foods}

Food Allergies:
{allergies}


IMPORTANT RULES

1. Respect the user's dietary preference.

2. Never include foods listed under avoided foods.

3. Never include foods that conflict with allergies.

4. Prefer foods the user enjoys when appropriate.

5. Create exactly seven days:

Monday
Tuesday
Wednesday
Thursday
Friday
Saturday
Sunday

6. Every day must contain exactly:

Breakfast
Lunch
Dinner

7. Give practical portion sizes.

8. Give estimated calories for each meal.

9. Give estimated protein grams for each meal.

10. Estimate an appropriate DAILY calorie target.

11. Estimate an appropriate DAILY protein target.

12. Estimate an appropriate DAILY water target.

13. Keep meals varied throughout the week.

14. Avoid extreme calorie restriction.

15. Provide general wellness guidance only.

16. Return ONLY valid JSON.


RETURN THIS JSON STRUCTURE:

{{
    "daily_calories": 2200,

    "protein_grams": 150,

    "water_litres": 2.5,

    "days": [

        {{
            "day": "Monday",

            "meals": [

                {{
                    "name": "Breakfast",

                    "foods": [
                        "Food - portion",
                        "Food - portion"
                    ],

                    "calories": 500,

                    "protein_grams": 30,

                    "reason": "Short explanation"
                }},

                {{
                    "name": "Lunch",

                    "foods": [
                        "Food - portion",
                        "Food - portion"
                    ],

                    "calories": 750,

                    "protein_grams": 50,

                    "reason": "Short explanation"
                }},

                {{
                    "name": "Dinner",

                    "foods": [
                        "Food - portion",
                        "Food - portion"
                    ],

                    "calories": 700,

                    "protein_grams": 45,

                    "reason": "Short explanation"
                }}

            ]
        }}

    ]
}}
"""


    # =====================================================
    # CALL QWEN THROUGH GROQ
    # =====================================================

    print("\n====================================")
    print("GENERATING 7-DAY NUTRITION PLAN")
    print("====================================")


    response = client.chat.completions.create(

        model="qwen/qwen3.6-27b",

        messages=[

            {
                "role": "system",
                "content": system_prompt,
            },

            {
                "role": "user",
                "content": user_prompt,
            },

        ],

        reasoning_effort="none",

        response_format={
            "type": "json_object"
        },

        temperature=0.3,

        max_completion_tokens=5000,
    )


    # =====================================================
    # GET RESPONSE
    # =====================================================

    content = (
        response
        .choices[0]
        .message
        .content
    )


    if not content:

        raise ValueError(
            "AI returned an empty response."
        )


    print("\n====================================")
    print("RAW AI RESPONSE")
    print("====================================")

    print(content)


    # =====================================================
    # PARSE JSON
    # =====================================================

    try:

        plan = json.loads(
            content
        )

    except json.JSONDecodeError as error:

        raise ValueError(
            "AI returned invalid JSON."
        ) from error


    # =====================================================
    # VALIDATE MAIN FIELDS
    # =====================================================

    required_fields = [

        "daily_calories",

        "protein_grams",

        "water_litres",

        "days",

    ]


    for field in required_fields:

        if field not in plan:

            raise ValueError(
                f"Nutrition plan missing: {field}"
            )


    # =====================================================
    # NORMALIZE TARGETS
    # =====================================================

    try:

        plan["daily_calories"] = int(
            plan["daily_calories"]
        )

        plan["protein_grams"] = int(
            plan["protein_grams"]
        )

        plan["water_litres"] = float(
            plan["water_litres"]
        )

    except (TypeError, ValueError):

        raise ValueError(
            "Invalid nutrition target values."
        )


    # =====================================================
    # SAFETY LIMITS
    # =====================================================

    if not 1200 <= plan["daily_calories"] <= 5000:

        raise ValueError(
            "AI generated an unreasonable calorie target."
        )


    if not 20 <= plan["protein_grams"] <= 350:

        raise ValueError(
            "AI generated an unreasonable protein target."
        )


    if not 1 <= plan["water_litres"] <= 6:

        raise ValueError(
            "AI generated an unreasonable water target."
        )


    # =====================================================
    # VALIDATE DAYS
    # =====================================================

    days = plan["days"]


    if not isinstance(days, list):

        raise ValueError(
            "Days must be a list."
        )


    if len(days) != 7:

        raise ValueError(
            "Nutrition plan must contain exactly 7 days."
        )


    expected_days = {

        "monday",

        "tuesday",

        "wednesday",

        "thursday",

        "friday",

        "saturday",

        "sunday",

    }


    returned_days = set()


    # =====================================================
    # VALIDATE EACH DAY
    # =====================================================

    for day in days:

        if not isinstance(day, dict):

            raise ValueError(
                "Each day must be an object."
            )


        day_name = day.get(
            "day"
        )


        meals = day.get(
            "meals"
        )


        if not day_name:

            raise ValueError(
                "One day is missing its name."
            )


        returned_days.add(
            day_name.strip().lower()
        )


        if not isinstance(
            meals,
            list
        ):

            raise ValueError(
                f"{day_name} meals must be a list."
            )


        if len(meals) != 3:

            raise ValueError(
                f"{day_name} must contain exactly 3 meals."
            )


        # -------------------------------------------------
        # VALIDATE MEALS
        # -------------------------------------------------

        expected_meals = {

            "breakfast",

            "lunch",

            "dinner",

        }


        returned_meals = set()


        for meal in meals:

            name = meal.get(
                "name"
            )


            foods = meal.get(
                "foods"
            )


            if not name:

                raise ValueError(
                    f"A meal in {day_name} is missing its name."
                )


            returned_meals.add(
                name.strip().lower()
            )


            if not isinstance(
                foods,
                list
            ):

                raise ValueError(
                    f"{day_name} {name} foods must be a list."
                )


            if len(foods) == 0:

                raise ValueError(
                    f"{day_name} {name} contains no food."
                )


            try:

                meal["calories"] = int(
                    meal.get(
                        "calories",
                        0
                    )
                )

                meal["protein_grams"] = int(
                    meal.get(
                        "protein_grams",
                        0
                    )
                )

            except (TypeError, ValueError):

                raise ValueError(
                    f"{day_name} {name} returned invalid macros."
                )


            if "reason" not in meal:

                meal["reason"] = ""


        if returned_meals != expected_meals:

            raise ValueError(
                f"{day_name} must contain Breakfast, Lunch and Dinner."
            )


    if returned_days != expected_days:

        raise ValueError(
            "Plan must contain Monday through Sunday."
        )


    # =====================================================
    # SUCCESS
    # =====================================================

    print("\n====================================")
    print("7-DAY NUTRITION PLAN READY")
    print("====================================")


    return plan