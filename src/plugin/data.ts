const dataPrefix: string = `${figma.editorType === "dev" ? "DEV_" : ""}${figma.fileKey != undefined ? `${figma.fileKey}_` : ""}`;

export enum ProjectKey {
    DATA = "DATA",
    SETTING = "SETTING",
}

export enum GlobalKey {
    SIZE = "SIZE",
    SETTING = "SETTING",
}

export const getData = (
    key: ProjectKey | GlobalKey
): Promise<any | undefined> => {
    return figma.clientStorage.getAsync(
        (key in ProjectKey ? dataPrefix : "") + key
    );
};

export const setData = (
    key: ProjectKey | GlobalKey,
    data: any
): Promise<void> => {
    return figma.clientStorage.setAsync(
        (key in ProjectKey ? dataPrefix : "") + key,
        data
    );
};

export const deleteData = (key: ProjectKey | GlobalKey): Promise<void> => {
    return figma.clientStorage.deleteAsync(
        (key in ProjectKey ? dataPrefix : "") + key
    );
};

export const getKeys = (): Promise<string[]> => {
    return figma.clientStorage.keysAsync();
};

export const deleteAll = async (): Promise<void> => {
    const keys = await getKeys();

    await Promise.all(keys.map((key) => figma.clientStorage.deleteAsync(key)));
};
