from copy import deepcopy
from datetime import datetime


MAX_TASKS_PER_SLOT = 3


def adapt_schedule(schedule: dict, stats: dict):

    if not stats or "slot_success_rate" not in stats:
        return schedule, "No performance data yet."

    slot_rates = stats["slot_success_rate"]

    # Ensure all slots exist
    for slot in ["morning", "afternoon", "evening"]:
        if slot not in slot_rates:
            slot_rates[slot] = 0

    # Rank slots by performance
    ranked_slots = sorted(slot_rates, key=slot_rates.get, reverse=True)

    best_slot = ranked_slots[0]
    explanation = []

    explanation.append(
        f"You perform best in the {best_slot} ({round(slot_rates[best_slot]*100)}% success rate)."
    )

    new_schedule = {
        "morning": [],
        "afternoon": [],
        "evening": []
    }

    # Collect all tasks
    all_tasks = []
    for slot in schedule:
        for task in schedule[slot]:
            all_tasks.append(task)

    # Sort tasks by priority (1 highest)
    all_tasks.sort(key=lambda x: x["priority"])

    # Distribute tasks intelligently
    for task in all_tasks:
        placed = False

        for slot in ranked_slots:
            if len(new_schedule[slot]) < MAX_TASKS_PER_SLOT:
                new_schedule[slot].append(task)
                placed = True
                break

        if not placed:
            # If all full, put in lowest slot
            new_schedule[ranked_slots[-1]].append(task)

    explanation.append("Tasks were redistributed based on your performance.")

    return new_schedule, " ".join(explanation)