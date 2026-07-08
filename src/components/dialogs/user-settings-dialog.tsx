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
import { cn } from "@/lib/utils";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChangePasswordFormData,
  ChangePasswordSchema
} from "@/validators/auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useModal } from "@/hooks/use-modal-store";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/hooks/use-user-store";
import { useRouter } from "next/navigation";
import { IFile } from "@/interface";

type UserSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: {
    name?: string;
    username?: string;
    email?: string;
    avatar?: IFile;
    image?: string;
  };
};

const FONT_OPTIONS = [
  { value: "geist", label: "Geist" },
  { value: "inter", label: "Inter" },
  { value: "roboto", label: "Roboto" },
  { value: "manrope", label: "Manrope" },
  { value: "geist-mono", label: "Geist Mono" },
  { value: "fira-sans", label: "Fira Sans" },
  { value: "fira-code", label: "Fira Code" },
  { value: "fira-mono", label: "Fira Mono" },
  { value: "consolas", label: "Consolas" },
  { value: "menlo", label: "Menlo" },
  { value: "roboto-mono", label: "Roboto Mono" },
  { value: "courier", label: "Courier New" },
  { value: "source-code", label: "Source Code Pro" },
  { value: "jetbrains", label: "JetBrains Mono" }
];

const THEME_OPTIONS = [
  { value: "light", label: "Light", color: "#ffffff" },
  { value: "dark", label: "Dark", color: "#000000" }
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

  const router = useRouter();

  const [editingField, setEditingField] = useState<{
    username?: boolean;
    name?: boolean;
  } | null>({
    username: false,
    name: false
  });

  const [updatedField, setUpdatedField] = useState<{
    username: string;
    name: string;
  }>({
    username: "",
    name: ""
  });

  const { updateProfile, updateProfileLoading } = useAuth();

  const { user: storedUser, setUser } = useUser();
  const { open: openModal } = useModal();
  const profile =
    storedUser ||
    (user && {
      id: "",
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar || (user.image ? { url: user.image } : undefined)
    });

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

  const updateUserProfile = async () => {
    try {
      const res = await updateProfile({
        username: updatedField?.username,
        name: updatedField?.name
      });

      if (res.success) {
        toast.success(res.message || "Profile updated successfully");
        setEditingField(null);
        setUpdatedField({
          username: "",
          name: ""
        });
        setUser({
          id: res.data.user.id,
          name: res.data.user.name,
          username: res.data.user.username,
          email: res.data.user.email,
          avatar: res.data.user.avatar
        });
        router.refresh();
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-full max-h-[90vh] w-full min-w-5xl gap-0 border p-0">
        <div className="flex h-full w-full">
          {/* Left Sidebar Navigation */}
          <div className="border-border/50 bg-muted/20 flex w-80 flex-col border-r">
            {/* Profile Section */}
            <div className="border-border/50 border-b p-6">
              <div className="mb-4 flex items-center gap-3">
                <UserAvatar
                  src={profile?.avatar?.url || user?.image}
                  name={profile?.name || user?.name}
                  rounded="lg"
                  className="size-12"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-medium">
                    {profile?.name || user?.name || "User"}
                  </h3>
                  <p className="text-muted-foreground truncate text-xs">
                    {profile?.email || user?.email || "user@example.com"}
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => openModal("edit-profile-picture")}>
                Edit Profile Picture
              </Button>
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
          <div className="flex flex-1 flex-col">
            <div className="flex-1 py-2">
              {activeTab === "account" && (
                <>
                  <h2 className="mb-3 px-8 text-lg font-normal">Account</h2>
                  <Separator />
                  <ScrollArea className="h-[calc(90vh-100px)] w-full">
                    <div className="mt-4 space-y-4 px-8">
                      <h3 className="text-xl font-medium sm:text-2xl">
                        Account Info
                      </h3>

                      <div className="flex items-center justify-between">
                        <Label className="text-muted-primary mb-2 block text-base font-medium">
                          Display Name
                        </Label>
                        {editingField?.name ? (
                          <div className="flex items-center gap-4">
                            <Input
                              placeholder="Enter your name"
                              value={updatedField.name}
                              onChange={e =>
                                setUpdatedField(prev => ({
                                  ...prev,
                                  name: e.target.value
                                }))
                              }
                            />

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                className=""
                                disabled={updateProfileLoading}
                                onClick={() => setEditingField(null)}>
                                Cancel
                              </Button>
                              <Button
                                variant="success"
                                disabled={updateProfileLoading}
                                onClick={() => updateUserProfile()}>
                                {updateProfileLoading ? (
                                  <>
                                    <Spinner />
                                    Saving...
                                  </>
                                ) : (
                                  "Save"
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 px-3 py-2">
                            <p>{profile?.name || "Not set"}</p>
                            <Button
                              variant="outline"
                              className=""
                              onClick={() => {
                                setEditingField({ name: true });
                                setUpdatedField(prev => ({
                                  ...prev,
                                  name: profile?.name || ""
                                }));
                              }}>
                              Edit
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-muted-primary mb-2 block text-base font-medium">
                          Username
                        </Label>
                        {editingField?.username ? (
                          <div className="flex items-center gap-4">
                            <Input
                              placeholder="Enter your username"
                              value={updatedField.username}
                              onChange={e =>
                                setUpdatedField(prev => ({
                                  ...prev,
                                  username: e.target.value
                                }))
                              }
                            />

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                className=""
                                disabled={updateProfileLoading}
                                onClick={() => setEditingField(null)}>
                                Cancel
                              </Button>
                              <Button
                                variant="success"
                                disabled={updateProfileLoading}
                                onClick={() => updateUserProfile()}>
                                {updateProfileLoading ? (
                                  <>
                                    <Spinner />
                                    Saving...
                                  </>
                                ) : (
                                  "Save"
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 px-3 py-2">
                            <p>@{profile?.username || "Not set"}</p>
                            <Button
                              variant="outline"
                              className=""
                              onClick={() => {
                                setEditingField({ username: true });
                                setUpdatedField(prev => ({
                                  ...prev,
                                  username: profile?.username || ""
                                }));
                              }}>
                              Edit
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-muted-primary mb-2 block text-base font-medium">
                          Email
                        </Label>
                        <div className="flex items-center gap-3 px-3 py-2">
                          <p> {profile?.email || "Not set"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-4 border-t px-8 pt-6">
                      <h3 className="text-xl font-medium sm:text-2xl">
                        Password & Security
                      </h3>

                      <ChangePasswordForm />
                    </div>
                  </ScrollArea>
                </>
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
                <div className="max-w-xl space-y-8">
                  <div>
                    <h2 className="mb-2 text-2xl font-bold">Appearance</h2>
                    <p className="text-muted-foreground text-sm">
                      Customize how the application looks
                    </p>
                  </div>

                  <Separator />

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
                          className={cn(
                            "relative h-16 w-16 rounded-lg border-2 transition-all",
                            theme === option.value
                              ? "border-primary"
                              : "border-border hover:border-muted-foreground"
                          )}
                          style={{ backgroundColor: option.color }}
                          title={option.label}>
                          {theme === option.value && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-primary flex h-5 w-5 items-center justify-center rounded-full border-2 border-white">
                                <span className="text-xs text-white dark:text-black">
                                  ✓
                                </span>
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

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

function ChangePasswordForm() {
  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: ""
    }
  });

  const { changePassword, changePasswordLoading } = useAuth();

  async function onSubmit(data: ChangePasswordFormData) {
    try {
      const res = await changePassword(data);

      console.log({ res });

      if (res.success) {
        toast.success(res.message || "Password changed successfully");
        form.reset();
      } else {
        toast.error(res.message || "Failed to change password");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to change password");
    }
  }

  return (
    <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="currentPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-currentPassword">
                Current Password
              </FieldLabel>
              <Input
                {...field}
                id="form-currentPassword"
                type="password"
                aria-invalid={fieldState.invalid}
                placeholder="Enter your current password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="newPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-demo-newPassword">
                New Password
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-demo-newPassword"
                type="password"
                aria-invalid={fieldState.invalid}
                placeholder="Enter your new password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="confirmNewPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-demo-confirmNewPassword">
                Confirm New Password
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-demo-confirmNewPassword"
                type="password"
                aria-invalid={fieldState.invalid}
                placeholder="Confirm your new password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button type="submit" disabled={changePasswordLoading}>
          {changePasswordLoading ? (
            <>
              <Spinner />
              Changing...
            </>
          ) : (
            "Change Password"
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
