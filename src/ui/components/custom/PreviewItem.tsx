import React, { useCallback } from "react";
import { PreviewUi } from "../../../interface";
import { Input } from "@/components/ui/input"

interface PreviewProps {
    preview: PreviewUi
    onChange: (event: React.ChangeEvent<HTMLInputElement>, id: string) => void,
    onDelete: (id: string) => void
}

export const PreviewItem = ({
    preview,
    onChange,
    onDelete,
}: PreviewProps) => {
    const _onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event, preview.id)
    }, [preview, onChange])

    const _onDelete = useCallback(() => {
        onDelete(preview.id)
    }, [preview, onDelete])

    return (
        <div className="relative">
            <img className="w-full aspect-square border border-b-0 object-contain bg-preview pointer-events-none" src={`data:image/png;base64,${preview.base64}`} alt="" />
            <Input className="h-6 border text-sm rounded-none p-0" placeholder="name" value={preview.name} onChange={_onChange} />
            <div className="absolute top-1 right-1" onClick={_onDelete} >
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="14" height="14" viewBox="0 0 50 50">
                    <path d="M 9.15625 6.3125 L 6.3125 9.15625 L 22.15625 25 L 6.21875 40.96875 L 9.03125 43.78125 L 25 27.84375 L 40.9375 43.78125 L 43.78125 40.9375 L 27.84375 25 L 43.6875 9.15625 L 40.84375 6.3125 L 25 22.15625 Z"></path>
                </svg>
            </div>
        </div>
    )
}