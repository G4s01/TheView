export const WIDGET_SIZES: Record<string, string[]> = {
  qbittorrent: ["2x1", "1x2"],
  adguard: ["2x1", "1x2"],
  spacer: ["1x1", "1x2", "2x1", "2x2", "3x1", "3x2", "4x1", "4x2"],
  none: ["1x1", "2x1", "1x2"],
  default: ["1x1", "2x1", "1x2"],
};

export function calculateWidgetResize(
  initialDragSize: string,
  resizeDirection: string,
  dx: number,
  dy: number,
  service: { widgetType?: string }
): string {
  const THRESHOLD_X = 140;
  const THRESHOLD_Y = 140;

  const [wStr, hStr] = initialDragSize.split('x');
  let newW = parseInt(wStr) || 1;
  let newH = parseInt(hStr) || 1;

  if (resizeDirection === 'x' || resizeDirection === 'both') {
    newW += Math.round(dx / THRESHOLD_X);
  }

  if (resizeDirection === 'y' || resizeDirection === 'both') {
    newH += Math.round(dy / THRESHOLD_Y);
  }

  // Constraint: Spacer up to 4x2, Widgets 2x1/1x2, Normal up to 2x1/1x2
  const maxW = service.widgetType === 'spacer' ? 4 : 2;
  newW = Math.max(1, Math.min(newW, maxW));
  newH = Math.max(1, Math.min(newH, 2));

  let newSize = `${newW}x${newH}` as string;
  
  if (service.widgetType && service.widgetType !== 'spacer') {
    // Per i widget reali, forza sempre almeno 2x1 o 1x2, mai 1x1 o 2x2
    if (newSize === '1x1' || newSize === '2x2') {
      if (Math.abs(dx) > Math.abs(dy)) newSize = '2x1';
      else newSize = '1x2';
    }
  } else if (service.widgetType !== 'spacer') {
    // Per servizi normali e spacer, 2x2 non è ammesso
    if (newW > 1 && newH > 1) {
      if (Math.abs(dx) > Math.abs(dy)) newSize = '2x1';
      else newSize = '1x2';
    }
  }

  return newSize;
}
