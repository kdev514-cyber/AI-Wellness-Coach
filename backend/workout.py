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
        "Check backend/.env"
    )


# =========================================================
# CREATE GROQ CLIENT
# =========================================================

client = Groq(
    api_key=groq_api_key
)


# =========================================================
# BUILD WORKOUT PLAN
# =========================================================

def build_workout_plan(profile: dict):

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


    # -----------------------------------------------------
    # FALLBACK VALUES
    # -----------------------------------------------------

    if not workout_days:
        workout_days = 3

    if not workout_duration:
        workout_duration = 45


    # =====================================================
    # SYSTEM PROMPT
    # =====================================================

    system_prompt = """
You are a general wellness and fitness planning assistant.

Create practical exercise plans for generally healthy adults.

Return ONLY valid JSON.

Do not return markdown.

Do not explain your reasoning outside the JSON.

Do not diagnose medical conditions.

Do not prescribe medical treatment.

Do not recommend dangerous exercises.

The workout plan should be practical and sustainable.
"""


    # =====================================================
    # USER PROMPT
    # =====================================================

    user_prompt = f"""
Create a personalized weekly workout plan.

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

Available Workout Days Per Week:
{workout_days}

Preferred Workout Duration:
{workout_duration} minutes


RULES

1. Create exactly {workout_days} workout days.

2. Add rest/recovery days where appropriate.

3. Every workout day must include:
   - workout focus
   - warm-up
   - exercises
   - cool-down

4. Every exercise must include:
   - name
   - sets
   - reps
   - rest_seconds

5. Keep the workout close to approximately
   {workout_duration} minutes.

6. Match the workout plan to the user's goal.

7. For fat loss:
   combine resistance training and suitable cardio.

8. For muscle gain:
   prioritize progressive resistance training.

9. For general fitness:
   use a balanced combination of strength,
   cardio and mobility.

10. Do not prescribe medical rehabilitation.

11. Avoid extreme or unsafe training volume.

12. Provide general wellness guidance only.

13. Return ONLY valid JSON.


RETURN THIS EXACT GENERAL STRUCTURE:

{{
  "workout_days": {workout_days},

  "days": [

    {{
      "day": "Monday",

      "type": "workout",

      "focus": "Upper Body",

      "duration_minutes": 60,

      "warmup": [
        "5 minute treadmill walk",
        "Arm circles"
      ],

      "exercises": [

        {{
          "name": "Bench Press",
          "sets": 3,
          "reps": "8-10",
          "rest_seconds": 90
        }},

        {{
          "name": "Lat Pulldown",
          "sets": 3,
          "reps": "10-12",
          "rest_seconds": 60
        }}

      ],

      "cardio": {{
        "activity": "Incline walking",
        "duration_minutes": 15
      }},

      "cooldown": [
        "Chest stretch",
        "Shoulder stretch"
      ]
    }},

    {{
      "day": "Tuesday",

      "type": "rest",

      "focus": "Recovery",

      "duration_minutes": 20,

      "warmup": [],

      "exercises": [],

      "cardio": {{
        "activity": "Light walking",
        "duration_minutes": 20
      }},

      "cooldown": [
        "Gentle mobility"
      ]
    }}

  ]
}}
"""


    # =====================================================
    # CALL QWEN
    # =====================================================

    print("\n====================================")
    print("GENERATING WORKOUT PLAN")
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

        max_completion_tokens=4500,
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
            "AI returned an empty workout response."
        )


    print("\n====================================")
    print("RAW WORKOUT RESPONSE")
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
            "AI returned invalid workout JSON."
        ) from error


    # =====================================================
    # VALIDATE MAIN FIELDS
    # =====================================================

    if "workout_days" not in plan:

        raise ValueError(
            "Workout plan is missing workout_days."
        )


    if "days" not in plan:

        raise ValueError(
            "Workout plan is missing days."
        )


    days = plan["days"]


    if not isinstance(
        days,
        list
    ):

        raise ValueError(
            "Workout days must be returned as a list."
        )


    # =====================================================
    # VALIDATE WEEK
    # =====================================================

    if len(days) != 7:

        raise ValueError(
            "Workout plan must contain all 7 days."
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


    workout_day_count = 0


    # =====================================================
    # VALIDATE EACH DAY
    # =====================================================

    for day in days:

        if not isinstance(
            day,
            dict
        ):

            raise ValueError(
                "Each workout day must be an object."
            )


        day_name = day.get(
            "day"
        )


        day_type = day.get(
            "type"
        )


        if not day_name:

            raise ValueError(
                "One workout day is missing its name."
            )


        returned_days.add(
            day_name.strip().lower()
        )


        if day_type not in [
            "workout",
            "rest"
        ]:

            raise ValueError(
                f"{day_name} must be workout or rest."
            )


        # -------------------------------------------------
        # WORKOUT DAY
        # -------------------------------------------------

        if day_type == "workout":

            workout_day_count += 1


            exercises = day.get(
                "exercises"
            )


            if not isinstance(
                exercises,
                list
            ):

                raise ValueError(
                    f"{day_name} exercises must be a list."
                )


            if len(exercises) == 0:

                raise ValueError(
                    f"{day_name} has no exercises."
                )


            for exercise in exercises:

                required_fields = [
                    "name",
                    "sets",
                    "reps",
                    "rest_seconds",
                ]


                for field in required_fields:

                    if field not in exercise:

                        raise ValueError(
                            f"{day_name} exercise is missing {field}."
                        )


        # -------------------------------------------------
        # OPTIONAL DEFAULT VALUES
        # -------------------------------------------------

        if "focus" not in day:

            day["focus"] = (
                "Recovery"
                if day_type == "rest"
                else "Training"
            )


        if "warmup" not in day:

            day["warmup"] = []


        if "cooldown" not in day:

            day["cooldown"] = []


        if "exercises" not in day:

            day["exercises"] = []


        if "cardio" not in day:

            day["cardio"] = None


    # =====================================================
    # VALIDATE DAYS
    # =====================================================

    if returned_days != expected_days:

        raise ValueError(
            "Workout plan must contain Monday through Sunday."
        )


    # =====================================================
    # VALIDATE WORKOUT DAY COUNT
    # =====================================================

    if workout_day_count != int(
        workout_days
    ):

        raise ValueError(
            f"AI returned {workout_day_count} workout days "
            f"instead of {workout_days}."
        )


    print("\n====================================")
    print("WORKOUT PLAN READY")
    print("====================================")


    return plan