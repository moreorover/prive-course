import { Button, Checkbox, Select, Stack, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";

import { FormSection } from "@/components/ui";

type PublishStatus = "draft" | "published" | "archived";

export type LessonFormValue = {
  title: string;
  slug: string;
  description: string;
  isFree: boolean;
  status: PublishStatus;
};

type LessonFormProps = {
  initialValue?: LessonFormValue;
  isSubmitting?: boolean;
  submitLabel: string;
  title: string;
  onSubmit: (value: LessonFormValue) => void;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function LessonForm({
  initialValue,
  isSubmitting = false,
  submitLabel,
  title,
  onSubmit,
}: LessonFormProps) {
  const form = useForm<LessonFormValue>({
    initialValues: initialValue ?? {
      title: "",
      slug: "",
      description: "",
      isFree: false,
      status: "draft",
    },
    validate: {
      title: (value) => (value.trim() ? null : "Title is required"),
      slug: (value) => (value.trim() ? null : "Slug is required"),
    },
  });

  return (
    <FormSection
      title={title}
      description="Define the lesson shell, preview state, and publication status before managing video."
    >
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Title"
            {...form.getInputProps("title")}
            onChange={(event) => {
              const nextTitle = event.currentTarget.value;
              form.setFieldValue("title", nextTitle);
              if (!form.getValues().slug) {
                form.setFieldValue("slug", slugify(nextTitle));
              }
            }}
            required
          />
          <TextInput
            label="Slug"
            {...form.getInputProps("slug")}
            onChange={(event) => form.setFieldValue("slug", slugify(event.currentTarget.value))}
            required
          />
          <Textarea label="Description" minRows={4} {...form.getInputProps("description")} />
          <Checkbox
            label="Free preview lesson"
            description="Guests can watch this lesson without course access."
            {...form.getInputProps("isFree", { type: "checkbox" })}
          />
          <Select
            label="Status"
            data={[
              { value: "draft", label: "Draft" },
              { value: "published", label: "Published" },
              { value: "archived", label: "Archived" },
            ]}
            {...form.getInputProps("status")}
            onChange={(value) =>
              form.setFieldValue("status", (value as PublishStatus | null) ?? "draft")
            }
          />
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!form.getValues().title || !form.getValues().slug}
          >
            {submitLabel}
          </Button>
        </Stack>
      </form>
    </FormSection>
  );
}
