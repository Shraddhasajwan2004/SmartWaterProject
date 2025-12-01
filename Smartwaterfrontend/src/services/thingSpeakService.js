export const fetchThingSpeakData = async (settings) => {
  if (!settings.channelId) return null;

  const url = `https://api.thingspeak.com/channels/${settings.channelId}/feeds.json?api_key=${settings.readKey}&results=50`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`ThingSpeak API Error: ${response.status} ${response.statusText}`);
      throw new Error(`Error fetching ThingSpeak data: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch ThingSpeak data", error);
    return null;
  }
};