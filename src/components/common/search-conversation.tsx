"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";

export interface Item {
  value: string;
  label: string;
  shortcut?: string;
}

export interface Group {
  value: string;
  items: Item[];
}

export const suggestions: Item[] = [
  { label: "Linear", shortcut: "⌘L", value: "linear" },
  { label: "Figma", shortcut: "⌘F", value: "figma" },
  { label: "Slack", shortcut: "⌘S", value: "slack" },
  { label: "YouTube", shortcut: "⌘Y", value: "youtube" },
  { label: "Raycast", shortcut: "⌘R", value: "raycast" }
];

export const commands: Item[] = [
  { label: "Clipboard History", shortcut: "⌘⇧C", value: "clipboard-history" },
  { label: "Import Extension", shortcut: "⌘I", value: "import-extension" },
  { label: "Create Snippet", shortcut: "⌘N", value: "create-snippet" },
  { label: "System Preferences", shortcut: "⌘,", value: "system-preferences" },
  { label: "Window Management", shortcut: "⌘⇧W", value: "window-management" }
];

export const groupedItems: Group[] = [
  { items: suggestions, value: "Suggestions" },
  { items: commands, value: "Commands" }
];

export function SearchConversation() {
  const [open, setOpen] = useState(false);

  function handleItemClick(_item: Item) {
    setOpen(false);
    console.log(_item);
  }

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(open => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="flex w-full flex-col gap-4 px-2">
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="w-full">
        Find or start a conversation
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {groupedItems.map(group => (
              <CommandGroup key={group.value} heading={group.value}>
                {group.items.map(item => (
                  <CommandItem key={item.value} onClick={() => handleItemClick(item)}>
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}
