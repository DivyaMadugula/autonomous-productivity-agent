import { gapi } from "gapi-script";

const CLIENT_ID = "YOUR_CLIENT_ID";
const API_KEY = "YOUR_API_KEY";

const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";

const SCOPES = "https://www.googleapis.com/auth/calendar.events";

export const initGoogle = () => {
  gapi.load("client:auth2", () => {
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: [DISCOVERY_DOC],
      scope: SCOPES,
    });
  });
};

export const addEventToCalendar = async (task, slot, dateStr) => {
  const auth = gapi.auth2.getAuthInstance();

  if (!auth.isSignedIn.get()) {
    await auth.signIn();
  }

  const date = new Date(dateStr);

  let hour = 9;
  if (slot === "afternoon") hour = 14;
  if (slot === "evening") hour = 19;

  const start = new Date(date.setHours(hour, 0, 0));
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const event = {
    summary: task.title,
    description: "Scheduled via Aura AI",
    start: {
      dateTime: start.toISOString(),
      timeZone: "Asia/Kolkata",
    },
    end: {
      dateTime: end.toISOString(),
      timeZone: "Asia/Kolkata",
    },
  };

  await gapi.client.calendar.events.insert({
    calendarId: "primary",
    resource: event,
  });

  alert("✅ Added to Google Calendar!");
};