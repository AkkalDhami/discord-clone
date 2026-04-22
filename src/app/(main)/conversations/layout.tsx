import { DirectChatSidebar } from "@/components/layouts/direct-chat-sidebar";
import { ProfileSidebar } from "@/components/layouts/profile-sidebar";

import { MobileDirectChatSidebar } from "@/components/layouts/mobile-direct-chat-sidebar";

export default async function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-screen w-full">
      <aside className="border-edge bg-background fixed inset-y-0 z-20 hidden h-full w-80 flex-col border-x pt-4 sm:w-86 md:flex">
        <DirectChatSidebar />
      </aside>
      <div className="bg-background fixed top-6 left-2 z-20 md:hidden">
        <MobileDirectChatSidebar />
      </div>
      <div className="border-edge mr-1 flex-1 overflow-x-auto border-r md:pl-86 lg:pr-80">
        <div>{children}</div>
      </div>

      <aside className="border-edge bg-background fixed right-1 z-20 hidden h-full w-80 flex-col border-x pt-4 lg:flex">
        <ProfileSidebar
          type="group"
          members={[
            {
              _id: "asdfasdf",
              name: "akkal dhami",
              username: "akkal12",
              avatar: {
                url: "https://yinfzs62id.ufs.sh/f/BeQ0UK7dOo0sACgHFVU4PFhnIT6JN4VrW3mgQjKwXzbC2ARd"
              },
              memberSince: "22 Apr 2025"
            }
          ]}
        />
        {/* <ProfileSidebar
          type="direct"
          user={{
            _id: "asdfasdf",
            name: "akkal dhami",
            username: "akkal12",
            avatar: {
              url: "https://yinfzs62id.ufs.sh/f/BeQ0UK7dOo0sACgHFVU4PFhnIT6JN4VrW3mgQjKwXzbC2ARd"
            },
            memberSince: "22 Apr 2025"
          }}
          mutualServers={[
            {
              _id: "1",
              name: "servercn",
              logo: "https://yinfzs62id.ufs.sh/f/BeQ0UK7dOo0sACgHFVU4PFhnIT6JN4VrW3mgQjKwXzbC2ARd",
              inviteCode: "sadfasdf",
              members: [],
              profileId: "sa"
            },
            {
              _id: "145etrgd",
              name: "servercn",
              logo: "https://yinfzs62id.ufs.sh/f/BeQ0UK7dOo0sACgHFVU4PFhnIT6JN4VrW3mgQjKwXzbC2ARd",
              inviteCode: "sadfasdf",
              members: [],
              profileId: "sa"
            },
            {
              _id: "1sdfhgert",
              name: "servercn",
              logo: "https://yinfzs62id.ufs.sh/f/BeQ0UK7dOo0sACgHFVU4PFhnIT6JN4VrW3mgQjKwXzbC2ARd",
              inviteCode: "sadfasdf",
              members: [],
              profileId: "sa"
            },
            {
              _id: "erdg1",
              name: "servercn",
              logo: "https://yinfzs62id.ufs.sh/f/BeQ0UK7dOo0sACgHFVU4PFhnIT6JN4VrW3mgQjKwXzbC2ARd",
              inviteCode: "sadfasdf",
              members: [],
              profileId: "sa"
            },
            {
              _id: "1etrgv",
              name: "servercn",
              logo: "https://yinfzs62id.ufs.sh/f/BeQ0UK7dOo0sACgHFVU4PFhnIT6JN4VrW3mgQjKwXzbC2ARd",
              inviteCode: "sadfasdf",
              members: [],
              profileId: "sa"
            },
            {
              _id: "asdg1",
              name: "servercn",
              logo: "https://yinfzs62id.ufs.sh/f/BeQ0UK7dOo0sACgHFVU4PFhnIT6JN4VrW3mgQjKwXzbC2ARd",
              inviteCode: "sadfasdf",
              members: [],
              profileId: "sa"
            }
          ]}
          mutualFriends={[
            {
              _id: "asdfasdf",
              name: "akkal dhami",
              username: "akkal12",
              avatar: {
                url: "https://yinfzs62id.ufs.sh/f/BeQ0UK7dOo0sACgHFVU4PFhnIT6JN4VrW3mgQjKwXzbC2ARd"
              },
              memberSince: "22 Apr 2025"
            }
          ]}
        /> */}
      </aside>
    </section>
  );
}
