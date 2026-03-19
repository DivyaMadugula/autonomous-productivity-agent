import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def analyze_goal(goal: str):
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are a productivity assistant."},
            {
                "role": "user",
                "content": f"""
Extract:
1. Goal
2. Priority
3. Time horizon

Goal: {goal}
"""
            }
        ]
    )
    return response.choices[0].message.content
print("ENV KEY =", os.getenv("GROQ_API_KEY"))
