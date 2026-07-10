import {
  Button,
  NumberInput,
  Paper,
  Select,
  Stack,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";

type PublishStatus = "draft" | "published" | "archived";

export type LessonFormValue = {
  title: string;
  slug: string;
  description: string;
  position: number;
  videoUid: string;
  durationSeconds: number | null;
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
    mode: "uncontrolled",
    initialValues: initialValue ?? {
      title: "",
      slug: "",
      description: "",
      position: 0,
      videoUid: "",
      durationSeconds: null,
      status: "draft",
    },
    validate: {
      title: (value) => (value.trim() ? null : "Title is required"),
      slug: (value) => (value.trim() ? null : "Slug is required"),
      position: (value) => (Number.isInteger(value) && value >= 0 ? null : "Position is required"),
      durationSeconds: (value) =>
        value === null || (Number.isInteger(value) && value >= 0)
          ? null
          : "Duration must be 0 or greater",
    },
  });

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
          <NumberInput
            label="Position"
            min={0}
            allowDecimal={false}
            key={form.key("position")}
            {...form.getInputProps("position")}
            required
          />
          <TextInput
            label="Video UID"
            key={form.key("videoUid")}
            {...form.getInputProps("videoUid")}
          />
          <NumberInput
            label="Duration seconds"
            min={0}
            allowDecimal={false}
            key={form.key("durationSeconds")}
            {...form.getInputProps("durationSeconds")}
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
