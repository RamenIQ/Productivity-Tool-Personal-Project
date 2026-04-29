# Momentum

A personal productivity web app with five themed tabs — Tasks, Diet, Workout, Reminders, and Goals — each with progress tracking, animations, and a distinct visual identity.

## Features

### ✅ Tasks
- Add tasks with priority (Low / Medium / High) and optional due date
- Overdue detection with red badge
- Mood emoji that reacts to your weekly completion rate
- Progress bar in the hero with shimmer animation

### 🥗 Diet
- **Editable daily goals** — set your own water and calorie targets
- Interactive water glasses that fill as you log them (goal-aware)
- Calorie progress bar against your custom target
- Meal logging by type (Breakfast, Lunch, Dinner, Snack) with calorie counts
- **Custom diet goals** — personal checkable goals (e.g. "Eat 5 vegetables") that reset daily

### 💪 Workout
- Log exercises with sets × reps and type (Strength, Cardio, Flexibility, Other)
- Check off exercises as complete; progress bar tracks the session
- Daily auto-reset so each day starts fresh

### 🔔 Reminders
- Add reminders with date, time, repeat cadence (Once / Daily / Weekly), and category
- Auto-sorted into **Overdue**, **Today**, and **Upcoming** sections
- Repeating reminders auto-advance their date when marked done
- Progress stat highlights overdue urgency

### 🎯 Goals
- **Short-term** goals — simple checkbox completion with due dates
- **Long-term** goals — editable progress percentage with an animated progress bar; turns green at 100%
- Segmented toggle with live counts per type
- Rotating inspirational quotes displayed in the hero
- Overall progress bar averaged across all goals

## Design

- **Per-tab visual themes** — each tab has a unique gradient hero, background tint, and decorative art layer:
  - Tasks: deep indigo with dot-grid overlay and floating checkmarks
  - Diet: forest green with floating food emojis (🥑 🍎 🥦 🫐 🥕)
  - Workout: dark orange with diagonal stripe texture and flame/lightning icons
  - Reminders: sky blue with dot pattern and bell/clock icons
  - Goals: dark cosmos gradient with a CSS star field, mountain silhouette, and inspirational quote
- Page background tint shifts smoothly to match the active tab
- Sliding tab indicator animates between tabs
- Micro-animations on item entry, emoji bounce, progress bar shimmer, and hover lifts
- Inter font, responsive layout, custom scrollbar

## Tech Stack

Vanilla HTML, CSS, and JavaScript — no frameworks or build tools. All data persists in `localStorage` and resets daily where appropriate (Diet, Workout).

## Getting Started

Open `index.html` directly in any modern browser. No install or server required.
