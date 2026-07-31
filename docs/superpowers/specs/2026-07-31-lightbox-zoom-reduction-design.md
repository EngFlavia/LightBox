# LightBox zoom reduction — design

## Objectives

Allow the image viewer to reduce an open image below its initial, fitted size, in addition to enlarging it.

Allow the user to save a new image that preserves the current on-screen composition.

## Behavior

- A pinch-in gesture reduces the visual scale to a minimum of 10% of the original fitted scale.
- Pinch-out keeps enlarging the image within the existing maximum scale.
- At reduced scales, the empty viewer area around the image remains visible and one-finger drag can reposition the image.
- The lock continues to prevent both zoom directions and drag.
- Reset restores the exact initial view: scale 100% and the original centered position.

## Save composed image

- The interface provides a `Save image` action whenever an image is loaded.
- Saving creates and downloads a **new PNG file**. It never overwrites or otherwise modifies the selected source image.
- The exported PNG has the current viewer aspect ratio and transparent pixels in every empty margin around the image.
- Its pixel content contains the source image at its current zoom and position, with the active grayscale, sepia, and contrast settings rendered into the new file.
- When that PNG is later opened in the app on the same phone in the same orientation, it fits as one composed image and preserves the visual placement of the source and its empty margins. This makes a drawing over the screen align without manual repositioning.
- The saved composition is intentionally flattened: its filters and placement are baked into the new PNG, while the original selected file remains unchanged.

## Data integrity

Zoom uses a non-destructive CSS transform. It never changes the selected image file; reducing to 10% and resetting to 100% causes no image-quality loss. Saving produces a separate composited PNG, leaving the selected source file unchanged.

## Error handling and limits

- Gesture-derived scale values are clamped to the inclusive 10%-to-existing-maximum range.
- Invalid gesture values are ignored, leaving the last valid transform intact.
- If image export fails, the app keeps the current image and composition in place and shows a localized failure message.

## Acceptance criteria

1. A loaded image can be reduced with a pinch-in gesture to 10% of its initial fitted scale.
2. The user can drag the reduced image to reposition it.
3. Lock blocks reduction, enlargement, and drag.
4. Reset returns a reduced image to its original 100% scale and centered position.
5. Reducing and restoring zoom does not modify or degrade the selected source image.
6. Save produces a new PNG containing the current zoom, position, active filters, and transparent margins.
7. Saving does not alter the original selected image.
8. Reopening the PNG on the same phone in the same orientation restores the composed placement without manual adjustment.
