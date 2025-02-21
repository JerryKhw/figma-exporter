import { CharacterCase, Format, Platform, PluginMessageType, UiMessageType } from "../enum";
import { UiMessage, Preview, ExportOption, ExportDefault, ExportScale3, ExportScale5, Size, GlobalSetting, initSize, initGlobalSetting } from "../interface"
import { deleteData, getData, GlobalDataKey, LocalDataKey, setData } from "./data"

const SVGSetting: ExportSettings = {
  format: "SVG",
}

const PDFSetting: ExportSettings = {
  format: "PDF",
}

const getExportSetting = (format: "PNG" | "JPG", scale: number = 1): ExportSettings => {
  return {
    format: format,
    constraint: {
      type: "SCALE",
      value: scale,
    },
  }
}

const sleep = (ms: number) => {
  return new Promise((r) => setTimeout(r, ms));
}

const exportAsync = async (node: SceneNode, setting: ExportSettings): Promise<Uint8Array> => {
  await sleep(1)
  return node.exportAsync(setting)
}

interface TmpExport {
  name: string,
  node: SceneNode
}

let globalSetting: GlobalSetting | undefined = undefined;

const getPreview = async (node: SceneNode): Promise<Preview> => {
  while (globalSetting == undefined) {
    await sleep(0.1)
  }

  let name = node.name

  switch (globalSetting.previewNameCharacterCase) {
    case CharacterCase.LOWER_CASE:
      name = name.toLowerCase();
      break;
    case CharacterCase.UPPER_CASE:
      name = name.toUpperCase();
      break;
  }

  globalSetting.previewNameReplaceDatas.forEach((data) => {
    name = name.replace(new RegExp(data.original, "g"), data.replacement);
  });

  return {
    id: node.id,
    name: name,
    buffer: await node.exportAsync()
  }
}

const isDev = figma.editorType === "dev"

if (isDev) {
  figma.showUI(__html__, { themeColors: false });

  getData(LocalDataKey.SETTING).then((setting) => {
    figma.ui.postMessage({
      type: PluginMessageType.SETTING,
      data: setting
    })
  })

  getData(GlobalDataKey.SETTING).then((setting) => {
    if (setting == undefined) {
      setData(GlobalDataKey.SETTING, initGlobalSetting);
    }
    globalSetting = setting ?? initGlobalSetting;
    figma.ui.postMessage({
      type: PluginMessageType.GLOBAL_SETTING,
      data: globalSetting,
    })
  })

  figma.on('selectionchange', () => {
    if (figma.currentPage.selection.length > 0) {
      Promise.all(figma.currentPage.selection.map((node) => getPreview(node))).then(
        (preview) => {
          figma.ui.postMessage({
            type: PluginMessageType.PREVIEW,
            data: preview,
          })
        }
      )
    }
  })
} else {
  if (figma.currentPage.selection.length <= 0) {
    figma.notify("Figma Exporter : Select Layer", {
      error: true
    })
  } else {
    figma.showUI(__html__, { themeColors: false, width: initSize.w, height: initSize.h });

    getData(GlobalDataKey.SIZE).then((size: Size | undefined) => {
      if (size != undefined) {
        figma.ui.resize(size.w, size.h)
      } else {
        setData(GlobalDataKey.SIZE, initSize);
      }
    })

    getData(LocalDataKey.SETTING).then((setting) => {
      figma.ui.postMessage({
        type: PluginMessageType.SETTING,
        data: setting
      })
    })

    getData(GlobalDataKey.SETTING).then((setting) => {
      if (setting == undefined) {
        setData(GlobalDataKey.SETTING, initGlobalSetting);
      }
      globalSetting = setting ?? initGlobalSetting;
      figma.ui.postMessage({
        type: PluginMessageType.GLOBAL_SETTING,
        data: globalSetting,
      })
    })

    Promise.all(figma.currentPage.selection.map((node) => getPreview(node))).then(
      (preview) => {
        figma.ui.postMessage({
          type: PluginMessageType.PREVIEW,
          data: preview,
        })
      }
    )
  }
}

figma.ui.onmessage = async (msg: UiMessage) => {
  const { type, data } = msg
  switch (type) {
    case UiMessageType.RESIZE: {
      const { w, h }: Size = data
      setData(GlobalDataKey.SIZE, data)
      figma.ui.resize(w, h);
      break
    }
    case UiMessageType.ERROR: {
      figma.notify("Figma Exporter : " + data, {
        error: true
      })
      break
    }
    case UiMessageType.SETTING: {
      setData(LocalDataKey.SETTING, data)

      if (figma.editorType !== "dev") {
        figma.closePlugin("Figma Exporter : Success Export")
      } else {
        figma.notify("Figma Exporter : Success Export")
      }
      break
    }
    case UiMessageType.GLOBAL_SETTING: {
      setData(GlobalDataKey.SETTING, data)
      break
    }
    case UiMessageType.EXPORT: {
      const { preview, format, platform, prefix, suffix }: ExportOption = data

      const tmps: TmpExport[] = []

      preview.map((pre) => {
        const node = figma.currentPage.findOne((node) => node.id == pre.id)
        if (node != null) {
          const tmpNames = pre.name.split("/");
          tmpNames[tmpNames.length - 1] = prefix + tmpNames[tmpNames.length - 1] + suffix

          const tmpName = tmpNames.join("/");

          tmps.push({
            name: tmpName,
            node: node
          })
        }
      })

      switch (format) {
        case Format.SVG:
        case Format.PDF: {
          const isSVG = format == Format.SVG
          const exports: ExportDefault[] = []
          for (const tmp of tmps) {
            const exportData = {
              name: tmp.name,
              format: format,
              buffer: await exportAsync(tmp.node, isSVG ? SVGSetting : PDFSetting),
            }
            exports.push(exportData)
          }
          figma.ui.postMessage({
            type: isSVG ? PluginMessageType.EXPORT_SVG : PluginMessageType.EXPORT_PDF,
            data: exports,
          })
          break
        }
        default: {
          const isJPG = format == Format.JPG
          const _format = isJPG ? 'JPG' : 'PNG'

          switch (platform) {
            case Platform.WEB: {
              const exports: ExportDefault[] = []
              for (const tmp of tmps) {
                const exportData = {
                  name: tmp.name,
                  format: format,
                  buffer: await exportAsync(tmp.node, getExportSetting(_format)),
                }
                exports.push(exportData)
              }
              figma.ui.postMessage({
                type: PluginMessageType.EXPORT_WEB,
                data: exports,
              })
              break
            }
            case Platform.ANDROID:
            case Platform.FLUTTER: {
              const exports: ExportScale5[] = []
              for (const tmp of tmps) {
                const exportData = {
                  name: tmp.name,
                  format: format,
                  scale1: await exportAsync(tmp.node, getExportSetting(_format)),
                  scale1_5: await exportAsync(tmp.node, getExportSetting(_format, 1.5)),
                  scale2: await exportAsync(tmp.node, getExportSetting(_format, 2)),
                  scale3: await exportAsync(tmp.node, getExportSetting(_format, 3)),
                  scale4: await exportAsync(tmp.node, getExportSetting(_format, 4)),
                }
                exports.push(exportData)
              }

              switch (platform) {
                case Platform.ANDROID: {
                  figma.ui.postMessage({
                    type: PluginMessageType.EXPORT_ANDROID,
                    data: exports,
                  })
                  break
                }
                case Platform.FLUTTER: {
                  figma.ui.postMessage({
                    type: PluginMessageType.EXPORT_FLUTTER,
                    data: exports,
                  })
                  break
                }
              }
              break
            }
            case Platform.iOS:
            case Platform.RN: {
              const exports: ExportScale3[] = []
              for (const tmp of tmps) {
                const exportData = {
                  name: tmp.name,
                  format: format,
                  scale1: await exportAsync(tmp.node, getExportSetting(_format)),
                  scale2: await exportAsync(tmp.node, getExportSetting(_format, 2)),
                  scale3: await exportAsync(tmp.node, getExportSetting(_format, 3))
                }
                exports.push(exportData)
              }

              switch (platform) {
                case Platform.iOS: {
                  figma.ui.postMessage({
                    type: PluginMessageType.EXPORT_iOS,
                    data: exports,
                  })
                  break
                }
                case Platform.RN: {
                  figma.ui.postMessage({
                    type: PluginMessageType.EXPORT_RN,
                    data: exports,
                  })
                  break
                }
              }
            }
          }
        }
      }
    }
  }
}