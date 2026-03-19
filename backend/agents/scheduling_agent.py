def create_schedule(tasks):
    schedule = {
        "morning": [],
        "afternoon": [],
        "evening": []
    }

    for task in tasks:
        if task["priority"] == 1:
            schedule["morning"].append(task)
        elif task["priority"] == 2:
            schedule["afternoon"].append(task)
        else:
            schedule["evening"].append(task)

    return schedule
