import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ShieldCheck, User } from "lucide-react";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Current password is required";
      }
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters";
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const payload = { email: formData.email };
    if (formData.newPassword) {
      payload.currentPassword = formData.currentPassword;
      payload.newPassword = formData.newPassword;
    }

    const result = await updateProfile(payload);
    if (result.success) {
      toast.success("Profile updated successfully");
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } else {
      toast.error(result.message || "Failed to update profile");
    }
    setLoading(false);
  };

  return (
    <MainLayout>
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-3xl font-bold text-foreground">
          My Account
        </h1>
        <p className="mt-2 text-muted-foreground">
          Update your email address and password
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 animate-slide-up">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-xl">Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={user?.name || ""}
                  disabled
                  className="mt-1 bg-muted"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={errors.email ? "border-destructive mt-1" : "mt-1"}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="border-t border-border pt-5">
                <h3 className="text-sm font-medium mb-3">Change Password</h3>
                <div className="space-y-4">
                  <div className="relative">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, currentPassword: e.target.value })
                      }
                      className={errors.currentPassword ? "border-destructive mt-1 pr-10" : "mt-1 pr-10"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[30px] text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    {errors.currentPassword && (
                      <p className="mt-1 text-sm text-destructive">{errors.currentPassword}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, newPassword: e.target.value })
                      }
                      className={errors.newPassword ? "border-destructive mt-1" : "mt-1"}
                    />
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-destructive">{errors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                      }
                      className={errors.confirmPassword ? "border-destructive mt-1" : "mt-1"}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Role Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                {user?.role === "superadmin" ? (
                  <ShieldCheck className="h-5 w-5" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Role</p>
                <p className="font-medium capitalize">
                  {user?.role === "superadmin" ? "Super Administrator" : "Administrator"}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {user?.role === "superadmin"
                ? "Super Administrators have unrestricted access to all modules and can manage other administrators."
                : "Your access is controlled by module permissions assigned by the Super Administrator."}
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Profile;
