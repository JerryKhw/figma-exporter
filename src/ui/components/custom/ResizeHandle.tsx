import React, { useCallback, useRef } from "react";

import { UiMessageType } from "@common/enum";

export const ResizeHandle = () => {
    const resizeRef = useRef<HTMLDivElement | null>(null);

    const resizeWindow = useCallback((event: PointerEvent) => {
        const size = {
            w: Math.max(560, Math.floor(event.clientX + 5)),
            h: Math.max(320, Math.floor(event.clientY + 5)),
        };

        parent.postMessage(
            {
                pluginMessage: {
                    type: UiMessageType.RESIZE,
                    data: size,
                },
            },
            "*"
        );
    }, []);

    const onResizePointerDown = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            const corner = resizeRef.current;
            if (corner) {
                corner.onpointermove = resizeWindow;
                corner.setPointerCapture(event.pointerId);
            }
        },
        [resizeRef]
    );

    const onResizePointerUp = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            const corner = resizeRef.current;
            if (corner) {
                corner.onpointermove = null;
                corner.releasePointerCapture(event.pointerId);
            }
        },
        [resizeRef]
    );

    return (
        <div
            ref={resizeRef}
            onPointerDown={onResizePointerDown}
            onPointerUp={onResizePointerUp}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
            style={{
                clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
                backgroundImage: `
        repeating-linear-gradient(
          -45deg,
          transparent,
          transparent 1px,
          rgba(107, 114, 128, 0.4) 1px,
          rgba(107, 114, 128, 0.4) 2px,
          transparent 2px,
          transparent 3px
        )
      `,
            }}
        ></div>
    );
};
