import { Button, Paper, Select, Stack, TextInput, Textarea, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";

type PublishStatus = "draft" | "published" | "archived";

export type CourseFormValue = {
  title: string;
  slug: string;
  description: string;
  status: PublishStatus;
};

type CourseFormProps = {
  initialValue?: CourseFormValue;
  isSubmitting?: boolean;
  submitLabel: string;
  title: string;
  onSubmit: (value: CourseFormValue) => void;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CourseForm({
  initialValue,
  isSubmitting = false,
  submitLabel,
  title,
  onSubmit,
}: CourseFormProps) {
  const form = useForm<CourseFormValue>({
    mode: "uncontrolled",
    initialValues: initialValue ?? {
      title: "",
      slug: "",
      description: "",
      status: "draft",
    },
    validate: {
      title: (value) => (value.trim() ? null : "Title is required"),
      slug: (value) => (value.trim() ? null : "Slug is required"),
    },
  });

  useEffect(() => {
    if (initialValue) {
      form.setValues(initialValue);
      form.resetDirty(initialValue);
    }
  }, [initialValue]);

  return (
    <Paper withBorder p="md" radius="sm">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <Title order={1} size="h3">
            {title}
          </Title>
          <TextInput
            label="Title"
            key={form.key("title")}
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
            key={form.key("slug")}
            {...form.getInputProps("slug")}
            onChange={(event) => form.setFieldValue("slug", slugify(event.currentTarget.value))}
            required
          />
          <Textarea
            label="Description"
            minRows={4}
            key={form.key("description")}
            {...form.getInputProps("description")}
          />
          <Select
            label="Status"
            data={[
              { value: "draft", label: "Draft" },
              { value: "published", label: "Published" },
              { value: "archived", label: "Archived" },
            ]}
            key={form.key("status")}
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
    </Paper>
  );
}
