import { ActionTooltip } from "@/components/common/action-tooltip";
import {
  IconPhoneCall,
  IconPin,
  IconUsersPlus,
  IconVideo
} from "@tabler/icons-react";
import { ChatHeaderType } from "@/components/layouts/chat-header";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import { ProfileSidebar } from "@/components/layouts/profile-sidebar";

export function ChatHeaderAction({ type }: { type: ChatHeaderType }) {
  return (
    <div className="flex items-center gap-3">
      {type === "friend" && (
        <>
          <ActionTooltip label="Start Voice Call" side="bottom">
            <IconPhoneCall className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1" />
          </ActionTooltip>
          <ActionTooltip label="Start Video Call" side="bottom">
            <IconVideo className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1" />
          </ActionTooltip>
          <ActionTooltip label="Add Friends to DM" side="bottom">
            <IconUsersPlus className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1" />
          </ActionTooltip>
        </>
      )}
      <ActionTooltip label="Pin Messages" side="bottom">
        <IconPin className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1" />
      </ActionTooltip>

      {/* {type === "friend" && (
        <Sheet>
          <SheetTrigger>
            <ActionTooltip label="Show User Profile" side="left">
              <IconUserCircle className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1" />
            </ActionTooltip>
          </SheetTrigger>
          <SheetContent>
            <ProfileSidebar
              user={{
                id: "asdfasdf",
                name: "akkal dhami",
                username: "akkal12",
                memberSince: "22 Apr 2025"
              }}
              mutualServers={[
                {
                  id: "1",
                  name: "servercn",
                  logo: "https://yinfzs62id.ufs.sh/f/BeQ0UK7dOo0sACgHFVU4PFhnIT6JN4VrW3mgQjKwXzbC2ARd"
                },
                { id: "2", name: "Web development" },
                { id: "3", name: "The Horde" },
                {
                  id: "1asdf",
                  name: "servercn",
                  logo: "https://yinfzs62id.ufs.sh/f/BeQ0UK7dOo0sACgHFVU4PFhnIT6JN4VrW3mgQjKwXzbC2ARd"
                },
                { id: "2asdf", name: "Web development" },
                { id: "3asdf", name: "The Horde" }
              ]}
              mutualFriends={[
                {
                  id: "1",
                  name: "Akkal",
                  username: "akkal",
                  avatar:
                    "https://yinfzs62id.ufs.sh/f/BeQ0UK7dOo0sACgHFVU4PFhnIT6JN4VrW3mgQjKwXzbC2ARd",
                  memberSince: "2025"
                },
                {
                  id: "18pyo",
                  name: "Akkal",
                  username: "akkal",
                  avatar:
                    "https://yinfzs62id.ufs.sh/f/BeQ0UK7dOo0sACgHFVU4PFhnIT6JN4VrW3mgQjKwXzbC2ARd",
                  memberSince: "2025"
                },
                {
                  id: "1sadf",
                  name: "Akkal",
                  username: "akkal",
                  avatar:
                    "https://yinfzs62id.ufs.sh/f/BeQ0UK7dOo0sACgHFVU4PFhnIT6JN4VrW3mgQjKwXzbC2ARd",
                  memberSince: "2025"
                },
                {
                  id: "dsfg4",
                  name: "Akkal",
                  username: "akkal",
                  avatar:
                    "https://yinfzs62id.ufs.sh/f/BeQ0UK7dOo0sACgHFVU4PFhnIT6JN4VrW3mgQjKwXzbC2ARd",
                  memberSince: "2025"
                }
              ]}
            />
          </SheetContent>
        </Sheet>
      )} */}
    </div>
  );
}
