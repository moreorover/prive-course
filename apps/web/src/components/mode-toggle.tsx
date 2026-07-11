import { ActionIcon, Menu, Tooltip, useMantineColorScheme } from "@mantine/core";
import { Moon, Sun } from "lucide-react";

export function ModeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <Tooltip label="Toggle color scheme">
          <ActionIcon aria-label="Toggle color scheme" size="lg" variant="outline">
            {isDark ? <Moon size={18} /> : <Sun size={18} />}
          </ActionIcon>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item onClick={() => setColorScheme("light")}>Light</Menu.Item>
        <Menu.Item onClick={() => setColorScheme("dark")}>Dark</Menu.Item>
        <Menu.Item onClick={() => setColorScheme("auto")}>System</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
