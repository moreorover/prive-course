import { ActionIcon, Menu, Tooltip, useMantineColorScheme } from "@mantine/core";
import { Check, Monitor, Moon, Sun } from "lucide-react";

export function ModeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <Tooltip label="Color mode">
          <ActionIcon aria-label="Toggle color scheme" size="lg" variant="outline">
            {isDark ? <Moon size={18} /> : <Sun size={18} />}
          </ActionIcon>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Color mode</Menu.Label>
        <Menu.Item
          leftSection={<Sun size={16} />}
          rightSection={colorScheme === "light" ? <Check size={14} /> : null}
          onClick={() => setColorScheme("light")}
        >
          Light
        </Menu.Item>
        <Menu.Item
          leftSection={<Moon size={16} />}
          rightSection={colorScheme === "dark" ? <Check size={14} /> : null}
          onClick={() => setColorScheme("dark")}
        >
          Dark
        </Menu.Item>
        <Menu.Item
          leftSection={<Monitor size={16} />}
          rightSection={colorScheme === "auto" ? <Check size={14} /> : null}
          onClick={() => setColorScheme("auto")}
        >
          System
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
