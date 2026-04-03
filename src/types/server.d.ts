import { Channel, Member, Profile } from "@/interface";

export type ServerWithMembersWithProfiles = IServer & {
  members: (Member & { profile: Profile })[];
  channels: Channel[];
};
