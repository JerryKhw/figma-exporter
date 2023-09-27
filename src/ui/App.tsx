import React, { useEffect, useCallback, useState, useMemo } from "react";
import { ExportScale3, ExportScale5, ExportDefault, Preview, PreviewUi, Setting } from "../interface"
import { Format, PageType, Platform, PluginMessageType, UiMessageType } from "../enum"
import { toBase64 } from "../base64"
import { Loading, PreviewItem } from "./component";
import JSZip from "jszip"
import { saveAs } from "file-saver"
import "./App.css";
import { arrayBufferToWebP } from "webp-converter-browser";

const formatList = [
  {
    name: "PNG",
    value: Format.PNG
  },
  {
    name: "JPG",
    value: Format.JPG
  },
  {
    name: "WEBP",
    value: Format.WEBP
  },
  {
    name: "SVG",
    value: Format.SVG
  },
  {
    name: "PDF",
    value: Format.PDF
  },
]

const platformList = [
  {
    name: "Web",
    value: Platform.WEB
  },
  {
    name: "Android",
    value: Platform.ANDROID
  },
  {
    name: "Flutter",
    value: Platform.FLUTTER
  },
  {
    name: "iOS",
    value: Platform.iOS
  },
  {
    name: "React Native",
    value: Platform.RN
  },
]

const App = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [pageType, setPageType] = useState<PageType>(PageType.LOADING)
  const [setting, setSetting] = useState<Setting | undefined>(undefined)
  const [preview, setPreview] = useState<PreviewUi[]>([])
  const [format, setFormat] = useState<string>(Format.PNG)
  const [platform, setPlatform] = useState<string>(Platform.WEB)
  const [prefix, setPrefix] = useState<string>("")
  const [suffix, setSuffix] = useState<string>("")

  const formatDisabled = useMemo(() => {
    return format == Format.SVG || format == Format.PDF
  }, [format])

  const previewNames = useMemo(() => {
    return preview.map((pre) => pre.name)
  }, [preview])

  const formatOnChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setFormat(event.target.value)
  }, [])

  const platformOnChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setPlatform(event.target.value)
  }, [])

  const prefixOnChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPrefix(event.target.value)
  }, [])

  const suffixOnChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSuffix(event.target.value)
  }, [])

  const onExport = useCallback(() => {
    if (preview.length == 0) {
      parent.postMessage({
        pluginMessage: {
          type: UiMessageType.ERROR,
          data: "Select Layer"
        }
      }, "*");

      return false
    }

    if (preview.filter((pre) => pre.name == "").length > 0) {
      parent.postMessage({
        pluginMessage: {
          type: UiMessageType.ERROR,
          data: "Enter image file name"
        }
      }, "*");

      return false
    }

    if (previewNames.length != new Set(previewNames).size) {
      parent.postMessage({
        pluginMessage: {
          type: UiMessageType.ERROR,
          data: "Duplicate image file name"
        }
      }, "*");

      return false
    }

    setLoading(true)

    parent.postMessage({
      pluginMessage: {
        type: UiMessageType.EXPORT,
        data: {
          preview: preview,
          format: format,
          platform: platform,
          prefix: prefix,
          suffix: suffix,
        }
      }
    }, "*");
  }, [previewNames, preview, format, platform, prefix, suffix])

  const previewOnChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const tmp = preview.map((pre: PreviewUi) => {
      if (pre.id == id) {
        return {
          ...pre,
          name: event.target.value.replace(/ /gi, ""),
        }
      }
      return {
        ...pre
      }
    })

    setPreview(tmp)
  }, [preview])

  const previewOnDelete = useCallback((id: string) => {
    const tmp = preview.filter((pre: PreviewUi) => pre.id != id)

    setPreview(tmp)
  }, [preview])

  const saveZip = useCallback((zip: JSZip, exports: ExportDefault[] | ExportScale3[] | ExportScale5[]) => {
    zip.generateAsync({ type: "blob" })
      .then((content: Blob) => {
        const size = exports.length
        const firstName = exports[0].name
        if (size > 1) {
          saveAs(content, `${firstName}_and_${size - 1}_others.zip`)
        } else {
          saveAs(content, `${firstName}.zip`)
        }
        parent.postMessage({
          pluginMessage: {
            type: UiMessageType.SETTING,
            data: {
              format: format,
              platform: platform,
              prefix: prefix,
              suffix: suffix,
            }
          }
        }, "*");
        setLoading(false)
      })
  }, [format, platform, prefix, suffix])

  useEffect(() => {
    if (setting != undefined) {
      setFormat(setting.format)
      if (setting.platform != null) {
        setPlatform(setting.platform)
      }
      setPrefix(setting.prefix ?? "")
      setSuffix(setting.suffix ?? "")
    }
  }, [setting])

  useEffect(() => {
    window.onmessage = async (event) => {
      if (event.data.pluginMessage) {
        const { type, data } = event.data.pluginMessage;

        switch (type) {
          case PluginMessageType.SETTING: {
            setSetting(data)
            setPageType(PageType.EXPORT)
            break
          }
          case PluginMessageType.PREVIEW: {
            const tmpPreview: PreviewUi[] = data.map((preview: Preview) => {
              return {
                ...preview,
                base64: toBase64(preview.buffer)
              }
            })
            setPreview(tmpPreview)
            break
          }
          case PluginMessageType.EXPORT_SVG:
          case PluginMessageType.EXPORT_PDF:
          case PluginMessageType.EXPORT_WEB: {
            const zip = new JSZip()
            const exports: ExportDefault[] = data

            if (exports.length > 1) {
              await Promise.all(
                exports.map(async (exportData) => {
                  let blob = new Blob([exportData.buffer]);

                  if (exportData.format == "webp") {
                    blob = await arrayBufferToWebP(exportData.buffer, { quality: 100 });
                  }

                  const exportName = exportData.name.replace(/ /gi, "_").replace(/-/gi, "_").replace(/=/gi, "_").replace(/,/gi, "_").replace(/\//gi, "_");

                  zip.file(`${exportName}.${exportData.format}`, blob)
                })
              )

              saveZip(zip, exports)
            } else if (exports.length == 1) {
              const exportData = exports[0]

              let blob = new Blob([exportData.buffer]);

              if (exportData.format == "webp") {
                blob = await arrayBufferToWebP(exportData.buffer, { quality: 100 })
              }

              const exportName = exportData.name.replace(/ /gi, "_").replace(/-/gi, "_").replace(/=/gi, "_").replace(/,/gi, "_").replace(/\//gi, "_");

              saveAs(blob, `${exportName}.${exportData.format}`)

              parent.postMessage({
                pluginMessage: {
                  type: UiMessageType.SETTING,
                  data: {
                    format: format,
                    platform: platform,
                  }
                }
              }, "*");

              setLoading(false)
            }

            break
          }
          case PluginMessageType.EXPORT_ANDROID:
          case PluginMessageType.EXPORT_FLUTTER: {
            const zip = new JSZip()
            const exports: ExportScale5[] = data

            await Promise.all(
              exports.map(async (exportData) => {
                let scale1 = new Blob([exportData.scale1]);
                let scale1_5 = new Blob([exportData.scale1_5]);
                let scale2 = new Blob([exportData.scale2]);
                let scale3 = new Blob([exportData.scale3]);
                let scale4 = new Blob([exportData.scale4]);

                if (exportData.format == "webp") {
                  scale1 = await arrayBufferToWebP(exportData.scale1, { quality: 100 });
                  scale1_5 = await arrayBufferToWebP(exportData.scale1_5, { quality: 100 });
                  scale2 = await arrayBufferToWebP(exportData.scale2, { quality: 100 });
                  scale3 = await arrayBufferToWebP(exportData.scale3, { quality: 100 });
                  scale4 = await arrayBufferToWebP(exportData.scale4, { quality: 100 });
                }

                switch (type) {
                  case PluginMessageType.EXPORT_ANDROID: {
                    const exportName = exportData.name.replace(/ /gi, "_").replace(/-/gi, "_").replace(/=/gi, "_").replace(/,/gi, "_").replace(/\//gi, "_");

                    zip.file(`drawable-mdpi/${exportName}.${exportData.format}`, scale1);
                    zip.file(`drawable-hdpi/${exportName}.${exportData.format}`, scale1_5);
                    zip.file(`drawable-xhdpi/${exportName}.${exportData.format}`, scale2);
                    zip.file(`drawable-xxhdpi/${exportName}.${exportData.format}`, scale3);
                    zip.file(`drawable-xxxhdpi/${exportName}.${exportData.format}`, scale4);

                    break
                  }
                  case PluginMessageType.EXPORT_FLUTTER: {
                    zip.file(`${exportData.name}.${exportData.format}`, scale1);
                    zip.file(`1.5x/${exportData.name}.${exportData.format}`, scale1_5);
                    zip.file(`2.0x/${exportData.name}.${exportData.format}`, scale2);
                    zip.file(`3.0x/${exportData.name}.${exportData.format}`, scale3);
                    zip.file(`4.0x/${exportData.name}.${exportData.format}`, scale4);
                  }
                }
              })
            );

            saveZip(zip, exports)

            break
          }
          case PluginMessageType.EXPORT_iOS:
          case PluginMessageType.EXPORT_RN: {
            const zip = new JSZip()
            const exports: ExportScale3[] = data

            await Promise.all(
              exports.map(async (exportData) => {
                const exportName = exportData.name.replace(/ /gi, "_").replace(/-/gi, "_").replace(/=/gi, "_").replace(/,/gi, "_").replace(/\//gi, "_");

                let scale1 = new Blob([exportData.scale1]);
                let scale2 = new Blob([exportData.scale2]);
                let scale3 = new Blob([exportData.scale3]);

                if (exportData.format == "webp") {
                  scale1 = await arrayBufferToWebP(exportData.scale1, { quality: 100 });
                  scale2 = await arrayBufferToWebP(exportData.scale2, { quality: 100 });
                  scale3 = await arrayBufferToWebP(exportData.scale3, { quality: 100 });
                }

                zip.file(`${exportName}.${exportData.format}`, scale1);
                zip.file(`${exportName}@2x.${exportData.format}`, scale2);
                zip.file(`${exportName}@3x.${exportData.format}`, scale3);
              })
            );

            saveZip(zip, exports)
            break
          }
        }
      }
    };
  }, [saveZip]);

  return (
    <>
      {pageType == PageType.LOADING ?
        (
          <center>
            <Loading />
          </center>
        )
        : (
          <>
            <section>
              {preview.map((pre) => <PreviewItem preview={pre} onChange={previewOnChange} onDelete={previewOnDelete} />)}
            </section>
            <footer>

              <select value={format} onChange={formatOnChange}>
                <option value="" disabled={true}>Format</option>
                {formatList.map((item) => <option value={item.value}>{item.name}</option>)}
              </select>

              <select value={platform} onChange={platformOnChange} disabled={formatDisabled}>
                <option value="" disabled={true}>Platform</option>
                {platformList.map((item) => <option value={item.value}>{item.name}</option>)}
              </select>

              <input placeholder="prefix" value={prefix} onChange={prefixOnChange} />
              <input placeholder="suffix" value={suffix} onChange={suffixOnChange} />

              <div className="spacer" />

              <button onClick={onExport}>Export</button>
            </footer>

            {
              loading && (
                <div className="modal">
                  <center>
                    <Loading color="#ffffff" />
                  </center>
                </div>
              )
            }
          </>
        )}
    </>
  );
}

export default App;
