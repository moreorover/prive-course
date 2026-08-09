# Product Atelier Wiremocks

## Current Board

- `product-atelier-dreams-style-redesign.excalidraw`

This is the current approved direction. It follows the Dreams of Code-style structure: teacher-led home page, simple courses page, individual course page, and lesson page.

## Earlier Board

- `product-atelier-structural-redesign.excalidraw`

This board explored a broader SaaS-style structural overwrite. Keep it as history, but do not use it as the primary implementation guide.

## Design Read

The redesign should stop mapping each route to the same pattern of header, list, side card, and player. The next implementation pass should use the simpler creator-led course-site model:

- Home: teacher intro, course preview, what students learn, and subscribe form.
- Courses: three course entries with the Basic + Pro relationship made clear.
- Course detail: what the course teaches, who it is for, and lesson outline.
- Lesson: video, description, and simple lesson navigation.

## Review Notes

These wiremocks are intentionally low fidelity. They define structure, hierarchy, and page jobs before visual styling. After the Dreams-style direction is approved, the Mantine implementation should be rebuilt against that board instead of restyling the existing page shapes.
