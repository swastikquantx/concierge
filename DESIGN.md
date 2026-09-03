# Vectra SuperStudio Design System

## Brand Goals
- **Identity**: Premium, cinematic AI operating system under Swastik AI Labs.
- **Tone**: Professional, powerful, clean, and forward-looking.
- **Visuals**: Dark mode default (cinematic but clean), with subtle gradients, strong typography, and a red accent used sparingly.

## Typography Scale
- **Display**: 48px / 1.1 line-height, -0.02em tracking
- **H1**: 36px / 1.2 line-height, -0.02em tracking
- **H2**: 24px / 1.3 line-height, -0.01em tracking
- **H3**: 20px / 1.4 line-height
- **Body Large**: 18px / 1.6 line-height
- **Body**: 16px / 1.6 line-height
- **Body Small**: 14px / 1.5 line-height
- **Caption**: 12px / 1.4 line-height

## Spacing
- **Base Unit**: 4px
- **Scale**: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128
- **Container Padding**: 24px minimum on desktop, 16px on mobile.

## Radius
- **Controls (Buttons, Inputs)**: 6px or 8px (rounded-md / rounded-lg)
- **Cards**: 12px or 16px (rounded-xl / rounded-2xl)
- **Modals/Dialogs**: 24px (rounded-3xl)
- **Pills/Badges**: Full radius

## Component Hierarchy
1. **Primary Actions**: Solid red background (`bg-red-600`), white text. High emphasis.
2. **Secondary Actions**: Outline or subtle fill (`bg-zinc-800`), white text.
3. **Tertiary Actions**: Ghost buttons, hover effect only.

## Light/Dark Tokens (Tailwind)
- **Background**: `bg-zinc-950` (Dark)
- **Surface/Card**: `bg-zinc-900`
- **Surface Hover**: `bg-zinc-800`
- **Border**: `border-zinc-800`
- **Text Primary**: `text-zinc-50`
- **Text Secondary**: `text-zinc-400`
- **Text Muted**: `text-zinc-500`
- **Accent**: `text-red-500`, `bg-red-600`

## Accessible Color Roles
- **Success**: `text-emerald-400` / `bg-emerald-500/10`
- **Warning**: `text-amber-400` / `bg-amber-500/10`
- **Error**: `text-red-400` / `bg-red-500/10`
- **Info**: `text-blue-400` / `bg-blue-500/10`

## Dashboard Layout Rules
- **Sidebar**: Fixed width (240px - 280px), collapsible. Contains main navigation.
- **Header**: Minimal, breadcrumbs, user profile, engine status.
- **Content Area**: Max-width constrained (e.g., `max-w-7xl`) for readability, except in editor views.

## Media-Card Rules
- 16:9 or 9:16 aspect ratios enforced via containers.
- Provider badges always visible on the top-right or bottom-left (e.g., "Google Veo", "Runway").
- Play buttons centered on hover.

## Timeline-Editor Rules
- Horizontal scrolling tracks.
- Color-coded clips (Video=Blue, Audio=Green, Text=Purple).
- Inspector panel on the right.
