import { useMemo } from 'react';
import qrcode from 'qrcode-generator';
export function ShareQr({ link }: { link: string }) {
  const matrix = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(link, 'Byte');
    qr.make();
    const size = qr.getModuleCount();
    let path = '';
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++)
        if (qr.isDark(y, x)) path += `M${x + 4},${y + 4}h1v1h-1z`;
    return { size: size + 8, path };
  }, [link]);
  return (
    <svg
      className="share-qr"
      role="img"
      aria-label="QR code for full verified share link"
      viewBox={`0 0 ${matrix.size} ${matrix.size}`}
      shapeRendering="crispEdges"
    >
      <rect width="100%" height="100%" fill="white" />
      <path d={matrix.path} fill="black" />
    </svg>
  );
}
