import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def explain_change(reason: str):
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "user",
                "content": f"""
Explain the following productivity decision in simple language:
{reason}
"""
            }
        ]
    )
    return response.choices[0].message.content
