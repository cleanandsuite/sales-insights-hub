---
# XP System - Visual Experience Tracker

## Core Logic
- Track XP earned from: calls, deals, activities
- Store in localStorage (sync with session later)
- Calculate level based on total XP
- Show progress bar to next level

## XP Levels
| Level | XP Required |
|-------|-------------|-----------|
| 1 | 0 |
| 5 | 100 |
| 10 | 500 |
| 15 | 1,500 |
| 20 | 5,000 |
| 25 | 25,000 |

## XP Sources
- Calls: +10 XP per call
- Deals: +50 XP per closed deal
- Activities: +25 XP per activity

## Progress Tracking
- Current level
- Total XP earned
- XP to next level
- Progress percentage (currentXP / requiredXP)
