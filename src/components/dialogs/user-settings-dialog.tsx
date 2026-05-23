"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/common/user-avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { IconUser, IconSettings, IconPalette } from "@tabler/icons-react";
import { useAppearance } from "@/hooks/use-appearance";
import toast from "react-hot-toast";

type UserSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: {
    name?: string;
    username?: string;
    email?: string;
    image?: string;
  };
};

const FONT_OPTIONS = [
  { value: "geist", label: "Geist" },
  { value: "geist-mono", label: "Geist Mono" },
  { value: "inter", label: "Inter" },
  { value: "fira-sans", label: "Fira Sans" },
  { value: "fira-code", label: "Fira Code" },
  { value: "fira-mono", label: "Fira Mono" },
  { value: "consolas", label: "Consolas" },
  { value: "menlo", label: "Menlo" },
  { value: "roboto", label: "Roboto" },
  { value: "roboto-mono", label: "Roboto Mono" },
  { value: "courier", label: "Courier New" },
  { value: "source-code", label: "Source Code Pro" },
  { value: "jetbrains", label: "JetBrains Mono" }
];

const THEME_OPTIONS = [
  { value: "light", label: "Light", color: "#ffffff" },
  { value: "dark", label: "Dark", color: "#1a1a1a" },
  { value: "onyx", label: "Onyx", color: "#0f0f0f" },
  { value: "pure-dark", label: "Pure Dark", color: "#000000" },
  { value: "ash", label: "Ash", color: "#2a2a2a" }
];

type TabType = "account" | "settings" | "appearance";

export function UserSettingsDialog({
  open,
  onOpenChange,
  user
}: UserSettingsDialogProps) {
  const { theme, fontFamily, setTheme, setFontFamily } = useAppearance();
  const [activeTab, setActiveTab] = useState<TabType>("account");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    const themeLabel = THEME_OPTIONS.find(t => t.value === newTheme)?.label;
    toast.success(`Theme saved: ${themeLabel}`);
  };

  const handleFontChange = (newFont: string | null) => {
    if (!newFont) return;
    setFontFamily(newFont);
    const fontLabel = FONT_OPTIONS.find(f => f.value === newFont)?.label;
    toast.success(`Font saved: ${fontLabel}`);
  };

  const navItems = [
    { id: "account", label: "Account", icon: IconUser },
    { id: "settings", label: "Settings", icon: IconSettings },
    { id: "appearance", label: "Appearance", icon: IconPalette }
  ] as const;

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full min-w-7xl gap-0 p-0">
        <div className="flex h-full w-full">
          {/* Left Sidebar Navigation */}
          <div className="border-border/50 bg-muted/20 flex w-80 flex-col overflow-y-auto border-r">
            {/* Profile Section */}
            <div className="border-border/50 border-b p-6">
              <div className="mb-4 flex items-center gap-3">
                <UserAvatar
                  src={user?.image}
                  name={user?.name}
                  rounded="lg"
                  className="size-12"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold">
                    {user?.name || "User"}
                  </h3>
                  <p className="text-muted-foreground truncate text-xs">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                disabled>
                Edit Profiles ✏️
              </Button>
            </div>

            {/* Search Bar */}
            <div className="border-border/50 border-b p-4">
              <Input
                placeholder="Search settings..."
                className="h-8 text-xs"
                disabled
              />
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 py-4">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as TabType)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                    activeTab === id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}>
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Content Area */}
          <div className="flex flex-1 flex-col overflow-y-auto">
            <div className="flex-1 p-8">
              {/* Account Tab */}
              {activeTab === "account" && (
                <div className="max-w-2xl space-y-8">
                  <div>
                    <h2 className="mb-2 text-2xl font-bold">Account</h2>
                    <p className="text-muted-foreground text-sm">
                      Manage your account information
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-6">
                    <div>
                      <Label className="mb-2 block text-sm font-semibold">
                        Username
                      </Label>
                      <div className="bg-muted/50 text-foreground rounded-md px-3 py-2 text-sm">
                        {user?.username || "Not set"}
                      </div>
                    </div>

                    <div>
                      <Label className="mb-2 block text-sm font-semibold">
                        Email
                      </Label>
                      <div className="bg-muted/50 text-foreground rounded-md px-3 py-2 text-sm">
                        {user?.email || "Not set"}
                      </div>
                    </div>

                    <div>
                      <Label className="mb-2 block text-sm font-semibold">
                        Display Name
                      </Label>
                      <div className="bg-muted/50 text-foreground rounded-md px-3 py-2 text-sm">
                        {user?.name || "Not set"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="max-w-2xl space-y-8">
                  <div>
                    <h2 className="mb-2 text-2xl font-bold">Settings</h2>
                    <p className="text-muted-foreground text-sm">
                      Manage your preferences
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-8">
                    <div>
                      <h3 className="mb-4 text-lg font-semibold">
                        Notifications
                      </h3>
                      <p className="text-muted-foreground mb-4 text-sm">
                        Configure how you receive notifications
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled
                        className="opacity-50">
                        Configure (Coming Soon)
                      </Button>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-4 text-lg font-semibold">Privacy</h3>
                      <p className="text-muted-foreground mb-4 text-sm">
                        Control who can see your information
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled
                        className="opacity-50">
                        Manage Privacy (Coming Soon)
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === "appearance" && (
                <div className="max-w-3xl space-y-8">
                  <div>
                    <h2 className="mb-2 text-2xl font-bold">Appearance</h2>
                    <p className="text-muted-foreground text-sm">
                      Customize how the application looks
                    </p>
                  </div>

                  <Separator />

                  {/* Theme Selection */}
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">Theme</h3>
                    <p className="text-muted-foreground mb-6 text-sm">
                      Choose your preferred color theme
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {THEME_OPTIONS.map(option => (
                        <button
                          key={option.value}
                          onClick={() => handleThemeChange(option.value)}
                          className={`relative h-16 w-16 rounded-lg border-2 transition-all ${
                            theme === option.value
                              ? "border-primary"
                              : "border-border hover:border-muted-foreground"
                          }`}
                          style={{ backgroundColor: option.color }}
                          title={option.label}>
                          {theme === option.value && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-primary flex h-5 w-5 items-center justify-center rounded-full border-2 border-white">
                                <span className="text-xs text-white">✓</span>
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Font Selection */}
                  <div>
                    <Label
                      htmlFor="font-select"
                      className="mb-4 block text-lg font-semibold">
                      Font Family
                    </Label>
                    <p className="text-muted-foreground mb-4 text-sm">
                      Choose your preferred font for the interface
                    </p>
                    <Select value={fontFamily} onValueChange={handleFontChange}>
                      <SelectTrigger id="font-select" className="w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <span style={{ fontFamily: option.value }}>
                              {option.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
