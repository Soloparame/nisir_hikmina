"use client";

import type { UpdateWithMeta } from "../lib/types/update";
import UpdateFeedList from "./UpdateFeedList";

type Props = {
  updates: UpdateWithMeta[];
};

export default function WhatsNewFeed({ updates }: Props) {
  return <UpdateFeedList updates={updates} loginRedirect="/whats-new" />;
}
