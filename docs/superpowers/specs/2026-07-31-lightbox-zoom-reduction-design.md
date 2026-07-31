# LightBox zoom reduction — design

## Objective

Allow the image viewer to reduce an open image below its initial, fitted size, in addition to enlarging it.

## Behavior

- A pinch-in gesture reduces the visual scale to a minimum of 10% of the original fitted scale.
- Pinch-out keeps enlarging the image within the existing maximum scale.
- At reduced scales, the empty viewer area around the image remains visible and one-finger drag can reposition the image.
- The lock continues to prevent both zoom directions and drag.
- Reset restores the exact initial view: scale 100% and the original centered position.

## Data integrity

Zoom uses a non-destructive CSS transform. It never changes the selected image file; reducing to 10% and resetting to 100% causes no image-quality loss.

## Error handling and limits

- Gesture-derived scale values are clamped to the inclusive 10%-to-existing-maximum range.
- Invalid gesture values are ignored, leaving the last valid transform intact.

## Acceptance criteria

1. A loaded image can be reduced with a pinch-in gesture to 10% of its initial fitted scale.
2. The user can drag the reduced image to reposition it.
3. Lock blocks reduction, enlargement, and drag.
4. Reset returns a reduced image to its original 100% scale and centered position.
5. Reducing and restoring zoom does not modify or degrade the selected source image.
