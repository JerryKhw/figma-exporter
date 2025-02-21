const fileKey: string = figma.fileKey != undefined ? `${figma.fileKey}_` : ""

export enum LocalDataKey {
    SETTING = "SETTING",
}

export enum GlobalDataKey {
    SIZE = "GLOBAL_SIZE",
    SETTING = "GLOBAL_SETTING",
}

export const getData = (key: LocalDataKey | GlobalDataKey): Promise<any | undefined> => {
    return figma.clientStorage.getAsync((key in LocalDataKey ? fileKey : "") + key);
}

export const setData = (key: LocalDataKey | GlobalDataKey, data: any): Promise<void> => {
    return figma.clientStorage.setAsync((key in LocalDataKey ? fileKey : "") + key, data)
}

export const deleteData = (key: LocalDataKey | GlobalDataKey): Promise<void> => {
    return figma.clientStorage.deleteAsync((key in LocalDataKey ? fileKey : "") + key)
}

export const getKeys = (): Promise<string[]> => {
    return figma.clientStorage.keysAsync()
}