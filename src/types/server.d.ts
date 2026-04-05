import { Category, Channel, Member, Profile, Server } from "@/interface";

export type ServerWithMembersWithProfiles = Server & {
  members: (Member & { profile: Profile })[];
  channels: Channel[];
  categories: Category[];
};
