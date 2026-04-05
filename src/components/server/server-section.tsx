import ChannelType from "@/enums/channel.enum";
import MemberRole from "@/enums/role.enum";
import { Category } from "@/interface";
import { ServerWithMembersWithProfiles } from "@/types/server";

type ServerSectionProps = {
  label: string;
  role?: MemberRole;
  sectionType: "channels" | "members";
  categories?: Category[];
  channelType?: ChannelType;
  server?: ServerWithMembersWithProfiles;
};

export function ServerSection({
  server,
  role,
  sectionType,
  label,
  channelType
}: ServerSectionProps) {
  return <section></section>;
}
