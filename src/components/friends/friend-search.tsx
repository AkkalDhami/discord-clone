"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from "@/components/ui/input-group";
import { debounce, useQueryState } from "nuqs";
import { IconSearch, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export function FriendSearch() {
  const [search, setSearch] = useQueryState("q", {
    defaultValue: "",
    shallow: false
  });

  return (
    <InputGroup>
      <InputGroupInput
        placeholder="Search friends..."
        value={search}
        onChange={e =>
          setSearch(e.target.value, {
            limitUrlUpdates: e.target.value === "" ? undefined : debounce(500)
          })
        }
        onKeyUp={e => {
          if (e.key === "Enter") {
            setSearch(e.target.value);
          }
        }}
      />
      <InputGroupAddon>
        <IconSearch />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <IconX
          onClick={() => {
            setSearch(null);
          }}
          className={cn(
            "hover:text-accent-foreground cursor-pointer",
            !search.trim() && "pointer-events-none"
          )}
        />
      </InputGroupAddon>
    </InputGroup>
  );
}
