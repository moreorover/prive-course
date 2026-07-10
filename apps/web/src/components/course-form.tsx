import { Button, Paper, Select, Stack, TextInput, Textarea, Title } from "@mantine/core";
import { useEffect, useState } from "react";

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
  const [form, setForm] = useState<CourseFormValue>(
    initialValue ?? {
      title: "",
      slug: "",
      description: "",
      status: "draft",
    },
  );

  useEffect(() => {
    if (initialValue) {
      setForm(initialValue);
    }
  }, [initialValue]);

  return (
    <Paper withBorder p="md" radius="sm">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(form);
        }}
      >
        <Stack gap="md">
          <Title order={1} size="h3">
            {title}
          </Title>
          <TextInput
            label="Title"
            value={form.title}
            onChange={(event) => {
              const nextTitle = event.currentTarget.value;
              setForm((current) => ({
                ...current,
                title: nextTitle,
                slug: current.slug ? current.slug : slugify(nextTitle),
              }));
            }}
            required
          />
          <TextInput
            label="Slug"
            value={form.slug}
            onChange={(event) =>
              setForm((current) => ({ ...current, slug: slugify(event.currentTarget.value) }))
            }
            required
          />
          <Textarea
            label="Description"
            value={form.description}
            minRows={4}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.currentTarget.value }))
            }
          />
          <Select
            label="Status"
            data={[
              { value: "draft", label: "Draft" },
              { value: "published", label: "Published" },
              { value: "archived", label: "Archived" },
            ]}
            value={form.status}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                status: (value as PublishStatus | null) ?? "draft",
              }))
            }
          />
          <Button type="submit" loading={isSubmitting} disabled={!form.title || !form.slug}>
            {submitLabel}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
