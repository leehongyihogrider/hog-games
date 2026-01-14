# Tutorial Video Implementation Guide

## ✅ ALL GAMES COMPLETE - Tutorial System Fully Implemented

All single-player games now have complete tutorial implementations with language-specific video support.

## Language-Specific Video System

The tutorial system automatically loads videos based on the user's language selection:
- **English users** see: `/tutorials/[game-name]-en.mp4`
- **Chinese users** see: `/tutorials/[game-name]-zh.mp4`

The language is determined from the initial language selection screen and automatically applied throughout the app.

## Required Video Files:

You need to create **TWO versions** of each tutorial video (English and Chinese):

### Single Player Games (7 games × 2 languages = 14 videos):

| Game | English Video | Chinese Video | Content Guidelines |
|------|---------------|---------------|-------------------|
| Memory Game | `/tutorials/memory-game-en.mp4` | `/tutorials/memory-game-zh.mp4` | Show card flipping, matching pairs, timer |
| Whack-A-Mole | `/tutorials/whack-a-mole-en.mp4` | `/tutorials/whack-a-mole-zh.mp4` | Show tapping moles, scoring, difficulty differences |
| Colour Sequence | `/tutorials/colour-sequence-en.mp4` | `/tutorials/colour-sequence-zh.mp4` | Show watching pattern, repeating it back |
| Math Game | `/tutorials/math-game-en.mp4` | `/tutorials/math-game-zh.mp4` | Show solving problems, typing answers, timer |
| Word Search | `/tutorials/word-search-en.mp4` | `/tutorials/word-search-zh.mp4` | Show finding words, selecting letters, submission |
| Number Sorting | `/tutorials/number-sorting-en.mp4` | `/tutorials/number-sorting-zh.mp4` | Show tapping in order, ascending/descending modes |
| Sudoku | `/tutorials/sudoku-en.mp4` | `/tutorials/sudoku-zh.mp4` | Show filling grid, conflict detection, undo/clear |

## Video Recording Tips:

### For Raspberry Pi 4 Compatibility:
- **Resolution**: 720p (1280x720) recommended
  - 1080p also works but 720p ensures smoothest playback
- **Frame Rate**: 30 fps
- **Codec**: H.264 (hardware accelerated on RPi 4)
- **File Size**: Keep under 50MB per video for fast loading
- **Duration**: 30-60 seconds per tutorial (short and sweet for elderly users)

### Content Guidelines:
1. **Show actual gameplay** - record the game being played
2. **Add text overlays** in the appropriate language (English or Chinese)
3. **Keep it simple** - focus on the most important actions
4. **Use large, readable text** - remember this is for elderly users
5. **Highlight key interactions** - use circles, arrows, or highlights to draw attention

### Language-Specific Overlays:
- **English version** (`-en.mp4`): Add English text overlays with instructions
- **Chinese version** (`-zh.mp4`): Add Chinese text overlays (Simplified Chinese recommended)

### Example Text Overlay Ideas:
- **Memory Game**: "Tap cards to flip" → "点击翻牌"
- **Whack-A-Mole**: "Tap moles quickly!" → "快速点击地鼠！"
- **Sudoku**: "Fill empty cells" → "填写空格"

## File Structure:

Place all videos in the `public/tutorials/` directory:

```
public/
  tutorials/
    memory-game-en.mp4
    memory-game-zh.mp4
    whack-a-mole-en.mp4
    whack-a-mole-zh.mp4
    colour-sequence-en.mp4
    colour-sequence-zh.mp4
    math-game-en.mp4
    math-game-zh.mp4
    word-search-en.mp4
    word-search-zh.mp4
    number-sorting-en.mp4
    number-sorting-zh.mp4
    sudoku-en.mp4
    sudoku-zh.mp4
```

## How It Works:

1. User selects language (English/中文) on the home screen
2. Language is stored in app state and passed to all game components
3. When "How to Play" button is clicked, the video modal loads
4. Video source automatically uses: `/tutorials/[game-name]-${language}.mp4`
   - If language is "en", loads `-en.mp4`
   - If language is "zh", loads `-zh.mp4`
5. All text in the modal (title, tips, button) uses the appropriate translation

## Testing:

To test without creating videos yet:
1. Create placeholder videos with simple text slides
2. Or temporarily use the same video for both languages during development
3. The modal will show "Your browser does not support the video tag" if video is missing

## Translation Keys Already Implemented:
```javascript
howToPlay: 'How to Play' / '如何玩'
quickTips: 'Quick Tips' / '快速提示'
gotIt: 'Got it!' / '明白了！'
browserNotSupported: 'Your browser does not support the video tag.' / '您的浏览器不支持视频标签。'
```
