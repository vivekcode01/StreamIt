import { useForm } from "react-hook-form";
import type { UserSettings } from "@superstreamer/api/client";
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUserSettings } from "@/hooks/useUserSettings";

export function SettingsPage() {
  const { mutation, userSettings } = useUserSettings();

  const form = useForm<UserSettings>({
    values: userSettings,
  });

  const onChange = form.handleSubmit((values: UserSettings) => {
    mutation.mutate(values);
  });

  return (
    <div className="p-8">
      <div className="max-w-lg w-full mx-auto">
        <Form {...form}>
          <form onChange={onChange} className="space-y-4">
            <FormField
              control={form.control}
              name="autoRefresh"
              render={({ field }) => (
                <FormItem>
                  <Label className="flex items-center">
                    Auto refresh
                    <Switch
                      className="ml-auto"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </Label>
                  <FormDescription>
                    Auto refresh certain pages in the background.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  );
}
