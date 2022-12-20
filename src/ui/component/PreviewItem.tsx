import React, { useCallback } from "react";
import { PreviewUi } from "../../interface";

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
        <div className="preview-wrap">
            <img src={`data:image/png;base64,${preview.base64}`} alt="" />
            <input type="text" onChange={_onChange} value={preview.name} placeholder="name" />
            <div className="delete" onClick={_onDelete} />
        </div>
    )
}