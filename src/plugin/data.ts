const fileKey: string = figma.fileKey != undefined ? `${figma.fileKey}_` : ""

export enum DataKey {
    SETTING = "SETTING"
}

export const getData = (key: DataKey): Promise<any | undefined> => {
    return figma.clientStorage.getAsync(fileKey + key)
}

export const setData = (key: DataKey, data: any): Promise<void> => {
    return figma.clientStorage.setAsync(fileKey + key, data)
}

export const deleteData = (key: DataKey): Promise<void> => {
    return figma.clientStorage.deleteAsync(fileKey + key)
}

export const getKeys = (): Promise<string[]> => {
    return figma.clientStorage.keysAsync()
}