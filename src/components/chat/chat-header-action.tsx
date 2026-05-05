"use client";

import { ActionTooltip } from "@/components/common/action-tooltip";

import {
  IconPhoneCall,
  IconPin,
  IconUserCircle,
  IconUsers,
  IconUsersPlus,
  IconVideo,
  IconHammer,
  IconTrash,
  IconMenu2,
  IconPencil,
  IconLogout
} from "@tabler/icons-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger
} from "@/components/ui/sheet";

import { ChatHeaderType } from "@/components/layouts/chat-header";
import { SidebarProfileData, useModal } from "@/hooks/use-modal-store";
import { PartialProfile } from "@/types/friend";
import { useUser } from "@/hooks/use-user-store";
import { Button } from "@/components/ui/button";

export function ChatHeaderAction({
  type,
  sidebarProfile,
  conversation
}: {
  type: ChatHeaderType;
  sidebarProfile?: SidebarProfileData;
  conversation?: {
    _id: string;
    participants: PartialProfile[];
    admin: string;
  };
}) {
  const { open, isOpen, close, type: modalType } = useModal();
  const isSidebarOpen = isOpen && modalType === "profile-sidebar";

  const { user } = useUser();
  const isGroupAdmin = user?.id && conversation?.admin === user.id;

  return (
    <div className="flex items-center gap-3">
      {(type === "friend" || type === "group") && (
        <>
          <ActionTooltip label="Start Voice Call" side="bottom">
            <IconPhoneCall className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1" />
          </ActionTooltip>
          <ActionTooltip label="Start Video Call" side="bottom">
            <IconVideo className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1" />
          </ActionTooltip>
          <ActionTooltip label="Pinned Messages" side="bottom">
            <IconPin className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1" />
          </ActionTooltip>
          {type === "friend" && (
            <ActionTooltip label="Delete Conversation" side="bottom">
              <IconTrash
                onClick={() => {
                  open("delete-conversation", {
                    conversation
                  });
                }}
                className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1"
              />
            </ActionTooltip>
          )}
          {(type === "friend" || type === "group") && (
            <ActionTooltip
              label={
                isSidebarOpen
                  ? type === "friend"
                    ? "Hide User Profile"
                    : "Hide Member List"
                  : type === "friend"
                    ? "Show User Profile"
                    : "Show Member List"
              }
              side="bottom">
              {type === "friend" ? (
                <IconUserCircle
                  onClick={() => {
                    if (!isSidebarOpen) {
                      open("profile-sidebar", {
                        sidebarProfile: sidebarProfile,
                        conversation
                      });
                    } else {
                      close();
                    }
                  }}
                  className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1"
                />
              ) : (
                <IconUsers
                  onClick={() => {
                    if (!isSidebarOpen) {
                      open("profile-sidebar", {
                        sidebarProfile: sidebarProfile,
                        conversation
                      });
                    } else {
                      close();
                    }
                  }}
                  className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1"
                />
              )}
            </ActionTooltip>
          )}
        </>
      )}

      {type == "channel" && (
        <ActionTooltip label="Pinned Messages" side="bottom">
          <IconPin className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1" />
        </ActionTooltip>
      )}

      <div className="hidden items-center gap-3 lg:flex">
        {(type === "friend" || type === "group") && (
          <>
            {type === "group" && conversation?._id && (
              <>
                <ActionTooltip label={"Invite Friends"} side="bottom">
                  <IconUsersPlus
                    onClick={() => open("add-group-members", { conversation })}
                    className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1"
                  />
                </ActionTooltip>
                <ActionTooltip label="Leave Group" side="bottom">
                  <IconLogout
                    onClick={() => open("leave-group", { conversation })}
                    className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1"
                  />
                </ActionTooltip>
                {isGroupAdmin && (
                  <>
                    <ActionTooltip label="Edit group" side="bottom">
                      <IconPencil
                        onClick={() =>
                          open("edit-group", {
                            conversation
                          })
                        }
                        className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1"
                      />
                    </ActionTooltip>
                    <ActionTooltip label="Kick Members" side="bottom">
                      <IconHammer
                        onClick={() =>
                          open("kick-group-members", { conversation })
                        }
                        className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1"
                      />
                    </ActionTooltip>
                    <ActionTooltip label="Delete Conversation" side="bottom">
                      <IconTrash
                        onClick={() =>
                          open("delete-conversation", { conversation })
                        }
                        className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1"
                      />
                    </ActionTooltip>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>

      <Sheet>
        <SheetTrigger
          nativeButton={false}
          render={
            <IconMenu2 className="text-muted-foreground hover:text-accent-foreground size-8 cursor-pointer rounded-lg p-1 lg:hidden" />
          }></SheetTrigger>
        <SheetContent className={"border-transparent"}>
          <SheetHeader>
            <div className={"mt-8 flex flex-col gap-4 px-1 lg:hidden"}>
              {(type === "friend" || type === "group") && (
                <>
                  <Button
                    variant={"ghost"}
                    className="group flex h-10 justify-start gap-4 py-2">
                    <IconPhoneCall className="text-muted-foreground group-hover:text-accent-foreground size-7 cursor-pointer p-1" />
                    <span className="text-muted-foreground group-hover:text-accent-foreground text-lg font-medium">
                      Start Voice Call
                    </span>
                  </Button>

                  <Button
                    variant={"ghost"}
                    className="group flex h-10 justify-start gap-4 py-2">
                    <IconVideo className="text-muted-foreground group-hover:text-accent-foreground size-7 cursor-pointer p-1" />
                    <span className="text-muted-foreground group-hover:text-accent-foreground text-lg font-medium">
                      Start Video Call
                    </span>
                  </Button>

                  <Button
                    variant={"ghost"}
                    className="group flex h-10 justify-start gap-4 py-2">
                    <IconPin className="text-muted-foreground group-hover:text-accent-foreground size-7 cursor-pointer p-1" />
                    <span className="text-muted-foreground group-hover:text-accent-foreground text-lg font-medium">
                      Pinned Messages
                    </span>
                  </Button>
                  {type === "group" && conversation?._id && (
                    <>
                      <Button
                        variant={"ghost"}
                        onClick={() =>
                          open("add-group-members", { conversation })
                        }
                        className="group flex h-10 justify-start gap-4 py-2">
                        <IconUsersPlus className="text-muted-foreground group-hover:text-accent-foreground size-7 cursor-pointer p-1" />
                        <span className="text-muted-foreground group-hover:text-accent-foreground text-lg font-medium">
                          Invite Friends
                        </span>
                      </Button>
                      {isGroupAdmin && (
                        <>
                          <Button
                            variant={"ghost"}
                            onClick={() =>
                              open("edit-group", {
                                conversation
                              })
                            }
                            className="group flex h-10 justify-start gap-4 py-2">
                            <IconPencil className="text-muted-foreground group-hover:text-accent-foreground size-7 cursor-pointer p-1" />
                            <span className="text-muted-foreground group-hover:text-accent-foreground text-lg font-medium">
                              Edit Group
                            </span>
                          </Button>
                          <Button
                            variant={"ghost"}
                            onClick={() =>
                              open("delete-conversation", { conversation })
                            }
                            className="group flex h-10 justify-start gap-4 py-2">
                            <IconTrash className="text-muted-foreground group-hover:text-accent-foreground size-7 cursor-pointer p-1" />
                            <span className="text-muted-foreground group-hover:text-accent-foreground text-lg font-medium">
                              Delete Conversation
                            </span>
                          </Button>
                          <Button
                            variant={"ghost"}
                            onClick={() =>
                              open("kick-group-members", { conversation })
                            }
                            className="group flex h-10 justify-start gap-4 py-2">
                            <IconHammer className="text-muted-foreground group-hover:text-accent-foreground size-7 cursor-pointer p-1" />
                            <span className="text-muted-foreground group-hover:text-accent-foreground text-lg font-medium">
                              Kick Members
                            </span>
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </>
              )}

              <Button
                variant={"ghost"}
                onClick={() => open("leave-group", { conversation })}
                className="group flex h-10 justify-start gap-4 py-2">
                <IconLogout className="text-muted-foreground group-hover:text-accent-foreground size-7 cursor-pointer p-1" />
                <span className="text-muted-foreground group-hover:text-accent-foreground text-lg font-medium">
                  Leave Group
                </span>
              </Button>
            </div>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}
