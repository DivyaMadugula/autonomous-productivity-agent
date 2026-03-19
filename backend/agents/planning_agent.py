import os
import json
import uuid
from datetime import datetime
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_tasks(goal):

    prompt = f"""
You are an AI productivity planner.

Return ONLY valid JSON.
No explanation.
No markdown.
No extra text.

Output EXACTLY this format:

[
  {{
    "title": "Task 1",
    "priority": 1,
    "estimated_duration": 60,
    "difficulty": 3
  }},
  {{
    "title": "Task 2",
    "priority": 2,
    "estimated_duration": 45,
    "difficulty": 2
  }},
  {{
    "title": "Task 3",
    "priority": 3,
    "estimated_duration": 30,
    "difficulty": 1
  }},
  {{
    "title": "Task 4",
    "priority": 2,
    "estimated_duration": 50,
    "difficulty": 4
  }},
  {{
    "title": "Task 5",
    "priority": 1,
    "estimated_duration": 90,
    "difficulty": 5
  }}
]

Rules:
- Exactly 5 tasks
- Priority must be 1, 2, or 3
- Estimated duration in minutes (30–120)
- Difficulty from 1 to 5

Goal:
{goal}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )

        content = response.choices[0].message.content.strip()

        if content.startswith("```"):
            content = content.replace("```json", "").replace("```", "").strip()

        start = content.find("[")
        end = content.rfind("]") + 1

        json_content = content[start:end]

        tasks = json.loads(json_content)

        # Add system fields
        enriched_tasks = []
        for task in tasks:
            enriched_tasks.append({
                "id": str(uuid.uuid4()),
                "title": task["title"],
                "priority": task["priority"],
                "estimated_duration": task["estimated_duration"],
                "difficulty": task["difficulty"],
                "created_at": datetime.now().isoformat()
            })

        return enriched_tasks

    except Exception as e:
        print("LLM failed, using fallback:", e)

        return [{
            "id": str(uuid.uuid4()),
            "title": "Define clear objectives",
            "priority": 1,
            "estimated_duration": 60,
            "difficulty": 3,
            "created_at": datetime.now().isoformat()
        }]