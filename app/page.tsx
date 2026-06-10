import HomePage from "../components/HomePage";
import { getExperiencedDoctors } from "../lib/actions/doctors";
import { getPublishedUpdates } from "../lib/actions/updates";

export default async function Home() {
  const [experiencedDoctors, latestUpdates] = await Promise.all([
    getExperiencedDoctors(4),
    getPublishedUpdates(2),
  ]);

  return (
    <HomePage
      experiencedDoctors={experiencedDoctors}
      latestUpdates={latestUpdates}
    />
  );
}
