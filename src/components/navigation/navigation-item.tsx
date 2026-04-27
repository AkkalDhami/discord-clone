"use client";
import { useParams, useRouter } from "next/navigation";
/* eslint-disable @next/next/no-img-element */
import { ActionTooltip } from "@/components/common/action-tooltip";
import { cn } from "@/lib/utils";
import { removeLeadingEmoji } from "@/utils/remove-leading-emoji";

interface NavigationItemProps {
  id: string;
  logo: string;
  name: string;
}

export function NavigationItem({ id, logo, name }: NavigationItemProps) {
  const params = useParams();
  const router = useRouter();
  return (
    <div className="mt-4">
      <ActionTooltip label={name} side="right" align="center">
        <div
          className="group relative cursor-pointer"
          onClick={() => {
            router.push(`/servers/${id}`);
          }}>
          <div
            className={cn(
              "bg-primary absolute top-1/2 left-0 w-1 -translate-y-1/2 rounded-r-full transition-all",
              params?.serverId !== id && "group-hover:h-5",
              params?.serverId === id ? "h-9" : "h-2"
            )}
          />

          <div className="group relative mx-3 flex size-10 overflow-hidden">
            {logo ? (
              <img
                className="size-10 rounded-xl object-cover object-center"
                src={logo}
                alt={name}
              />
            ) : (
              <div
                className={cn(
                  "bg-secondary flex size-10 items-center justify-center rounded-xl text-lg font-medium transition-all hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-500",
                  params?.serverId === id && "bg-indigo-500 text-white"
                )}>
                {removeLeadingEmoji(name)?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </ActionTooltip>
    </div>
  );
}
