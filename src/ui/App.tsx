import "./App.css";
import React, { useEffect, useCallback, useState, useMemo, useRef } from "react";
import { ExportScale3, ExportScale5, ExportDefault, Preview, PreviewUi, Setting, ReplaceData, GlobalSetting, initGlobalSetting } from "../interface"
import { CharacterCase, Format, PageType, Platform, PluginMessageType, UiMessageType } from "../enum"
import { toBase64 } from "../base64"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import { arrayBufferToWebP } from "webp-converter-browser";
import { Loading, PreviewItem } from "@/components/custom";
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowRight, Plus, Trash2 } from "lucide-react";

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

  const formatOnChange = useCallback((value: string) => {
    setFormat(value)
  }, [])

  const platformOnChange = useCallback((value: string) => {
    setPlatform(value)
  }, [])

  const prefixOnChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPrefix(event.target.value)
  }, [])

  const suffixOnChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSuffix(event.target.value)
  }, [])

  const [globalSetting, setGlobalSetting] = useState<GlobalSetting | undefined>(undefined)

  const [previewNameCharacterCase, setPreviewNameCharacterCase] = useState<string>(CharacterCase.LOWER_CASE)

  const previewNameCharacterCaseOnChange = useCallback((value: string) => {
    setPreviewNameCharacterCase(value)
  }, [])

  const [previewNameReplaceDatas, setPreviewNameReplaceDatas] = useState<ReplaceData[]>([])
  const [exportNameReplaceDatas, setExportNameReplaceDatas] = useState<ReplaceData[]>([])

  const handlePreviewInputChange = useCallback((id: number, field: keyof ReplaceData, value: string) => {
    setPreviewNameReplaceDatas((prevPairs) => prevPairs.map((pair) => (pair.id === id ? { ...pair, [field]: value } : pair)))
  }, []);

  const addPreviewNewRow = useCallback(() => {
    const newId = previewNameReplaceDatas.length > 0 ? Math.max(...previewNameReplaceDatas.map((p) => p.id)) + 1 : 1
    setPreviewNameReplaceDatas((prevPairs) => [...prevPairs, { id: newId, original: "", replacement: "" }])
  }, [previewNameReplaceDatas]);

  const deletePreviewRow = useCallback((id: number) => {
    setPreviewNameReplaceDatas((prevPairs) => prevPairs.filter((pair) => pair.id !== id))
  }, []);

  const handleExportInputChange = useCallback((id: number, field: keyof ReplaceData, value: string) => {
    setExportNameReplaceDatas((prevPairs) => prevPairs.map((pair) => (pair.id === id ? { ...pair, [field]: value } : pair)))
  }, []);

  const addExportNewRow = useCallback(() => {
    const newId = exportNameReplaceDatas.length > 0 ? Math.max(...exportNameReplaceDatas.map((p) => p.id)) + 1 : 1
    setExportNameReplaceDatas((prevPairs) => [...prevPairs, { id: newId, original: "", replacement: "" }])
  }, [exportNameReplaceDatas]);

  const deleteExportRow = useCallback((id: number) => {
    setExportNameReplaceDatas((prevPairs) => prevPairs.filter((pair) => pair.id !== id))
  }, []);

  const [open, setOpen] = useState(false)

  const globalSettingDialogOnChange = useCallback((open: boolean) => {
    setOpen(open)
    if (!open) {
      const setting = globalSetting == undefined ? initGlobalSetting : globalSetting;

      setPreviewNameCharacterCase(setting.previewNameCharacterCase)
      setPreviewNameReplaceDatas(setting.previewNameReplaceDatas)
      setExportNameReplaceDatas(setting.exportNameReplaceDatas)
    }
  }, [globalSetting]);

  const onSave = useCallback(() => {
    const setting = {
      previewNameCharacterCase: previewNameCharacterCase,
      previewNameReplaceDatas: previewNameReplaceDatas,
      exportNameReplaceDatas: exportNameReplaceDatas,
    }

    parent.postMessage({
      pluginMessage: {
        type: UiMessageType.GLOBAL_SETTING,
        data: setting,
      }
    }, "*");

    setGlobalSetting(setting)
    setOpen(false)
  }, [previewNameCharacterCase, previewNameReplaceDatas, exportNameReplaceDatas]);

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
          name: event.target.value,
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
    if (globalSetting != undefined) {
      setPreviewNameCharacterCase(globalSetting.previewNameCharacterCase)
      setPreviewNameReplaceDatas(globalSetting.previewNameReplaceDatas)
      setExportNameReplaceDatas(globalSetting.exportNameReplaceDatas)
    }
  }, [globalSetting])

  const createExportName = useCallback((name: string): string => {
    const setting = globalSetting == undefined ? initGlobalSetting : globalSetting;

    let tmp = name

    setting.exportNameReplaceDatas.forEach((data) => {
      tmp = tmp.replace(new RegExp(data.original, "g"), data.replacement);
    });

    return tmp
  }, [globalSetting]);

  const toArrayBuffer = (uint8Array: Uint8Array): ArrayBuffer => {
    const buffer = uint8Array.buffer;

    if (buffer instanceof ArrayBuffer) {
      return buffer.slice(uint8Array.byteOffset, uint8Array.byteOffset + uint8Array.byteLength);
    }

    throw new Error("Unsupported buffer type");
  }

  const cornerRef = useRef<SVGSVGElement | null>(null);

  const resizeWindow = useCallback((event: PointerEvent) => {
    const size = {
      w: Math.max(560, Math.floor(event.clientX + 5)),
      h: Math.max(320, Math.floor(event.clientY + 5))
    };

    parent.postMessage({
      pluginMessage: {
        type: UiMessageType.RESIZE,
        data: size,
      }
    }, "*");
  }, []);

  const handlePointerDown = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
    const corner = cornerRef.current;
    if (corner) {
      corner.onpointermove = resizeWindow;
      corner.setPointerCapture(event.pointerId);
    }
  }, [cornerRef]);

  const handlePointerUp = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
    const corner = cornerRef.current;
    if (corner) {
      corner.onpointermove = null;
      corner.releasePointerCapture(event.pointerId);
    }
  }, [cornerRef]);

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
          case PluginMessageType.GLOBAL_SETTING: {
            setGlobalSetting(data)
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
                  const exportName = createExportName(exportData.name);

                  let blob;

                  if (exportData.format == "webp") {
                    blob = await arrayBufferToWebP(toArrayBuffer(exportData.buffer), { quality: 100 });
                  } else {
                    blob = new Blob([exportData.buffer]);
                  }

                  zip.file(`${exportName}.${exportData.format}`, blob)
                })
              )

              saveZip(zip, exports)
            } else if (exports.length == 1) {
              const exportData = exports[0]
              const exportName = createExportName(exportData.name);

              let blob;

              if (exportData.format == "webp") {
                blob = await arrayBufferToWebP(toArrayBuffer(exportData.buffer), { quality: 100 })
              } else {
                blob = new Blob([exportData.buffer]);
              }

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
                const exportName = createExportName(exportData.name);

                let scale1, scale1_5, scale2, scale3, scale4;

                if (exportData.format == "webp") {
                  scale1 = await arrayBufferToWebP(toArrayBuffer(exportData.scale1), { quality: 100 });
                  scale1_5 = await arrayBufferToWebP(toArrayBuffer(exportData.scale1_5), { quality: 100 });
                  scale2 = await arrayBufferToWebP(toArrayBuffer(exportData.scale2), { quality: 100 });
                  scale3 = await arrayBufferToWebP(toArrayBuffer(exportData.scale3), { quality: 100 });
                  scale4 = await arrayBufferToWebP(toArrayBuffer(exportData.scale4), { quality: 100 });
                } else {
                  scale1 = new Blob([exportData.scale1]);
                  scale1_5 = new Blob([exportData.scale1_5]);
                  scale2 = new Blob([exportData.scale2]);
                  scale3 = new Blob([exportData.scale3]);
                  scale4 = new Blob([exportData.scale4]);
                }

                switch (type) {
                  case PluginMessageType.EXPORT_ANDROID: {
                    zip.file(`drawable-mdpi/${exportName}.${exportData.format}`, scale1);
                    zip.file(`drawable-hdpi/${exportName}.${exportData.format}`, scale1_5);
                    zip.file(`drawable-xhdpi/${exportName}.${exportData.format}`, scale2);
                    zip.file(`drawable-xxhdpi/${exportName}.${exportData.format}`, scale3);
                    zip.file(`drawable-xxxhdpi/${exportName}.${exportData.format}`, scale4);
                    break
                  }
                  case PluginMessageType.EXPORT_FLUTTER: {
                    zip.file(`${exportName}.${exportData.format}`, scale1);
                    zip.file(`1.5x/${exportName}.${exportData.format}`, scale1_5);
                    zip.file(`2.0x/${exportName}.${exportData.format}`, scale2);
                    zip.file(`3.0x/${exportName}.${exportData.format}`, scale3);
                    zip.file(`4.0x/${exportName}.${exportData.format}`, scale4);
                    break
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
                const exportName = createExportName(exportData.name);

                let scale1, scale2, scale3;

                if (exportData.format == "webp") {
                  scale1 = await arrayBufferToWebP(toArrayBuffer(exportData.scale1), { quality: 100 });
                  scale2 = await arrayBufferToWebP(toArrayBuffer(exportData.scale2), { quality: 100 });
                  scale3 = await arrayBufferToWebP(toArrayBuffer(exportData.scale3), { quality: 100 });
                } else {
                  scale1 = new Blob([exportData.scale1]);
                  scale2 = new Blob([exportData.scale2]);
                  scale3 = new Blob([exportData.scale3]);
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
          <div className="size-full flex">
            <Loading />
          </div>
        )
        : (
          <div className="size-full flex flex-col select-none">
            <div className="flex-1 grid grid-cols-5 gap-2 p-2 overflow-auto">
              {preview.map((pre) => <PreviewItem preview={pre} onChange={previewOnChange} onDelete={previewOnDelete} />)}
            </div>

            <div className="flex border-t gap-2">
              <div className="flex flex-1 gap-2 p-2 overflow-x-scroll">
                <Select onValueChange={formatOnChange} defaultValue={format}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Format</SelectLabel>
                      {formatList.map((item) => <SelectItem value={item.value}>{item.name}</SelectItem>)}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select onValueChange={platformOnChange} defaultValue={platform} disabled={formatDisabled}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Platform</SelectLabel>
                      {platformList.map((item) => <SelectItem value={item.value}>{item.name}</SelectItem>)}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Input className="w-[100px]" placeholder="Prefix" value={prefix} onChange={prefixOnChange} />

                <Input className="w-[100px]" placeholder="Suffix" value={suffix} onChange={suffixOnChange} />
              </div>

              <div className="flex gap-2 py-2 pr-2">
                <Dialog open={open} onOpenChange={globalSettingDialogOnChange}>
                  <DialogTrigger>
                    <Button onClick={() => setOpen(true)}>
                      <svg fill="#ffffff" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50">
                        <path d="M47.16,21.221l-5.91-0.966c-0.346-1.186-0.819-2.326-1.411-3.405l3.45-4.917c0.279-0.397,0.231-0.938-0.112-1.282 l-3.889-3.887c-0.347-0.346-0.893-0.391-1.291-0.104l-4.843,3.481c-1.089-0.602-2.239-1.08-3.432-1.427l-1.031-5.886 C28.607,2.35,28.192,2,27.706,2h-5.5c-0.49,0-0.908,0.355-0.987,0.839l-0.956,5.854c-1.2,0.345-2.352,0.818-3.437,1.412l-4.83-3.45 c-0.399-0.285-0.942-0.239-1.289,0.106L6.82,10.648c-0.343,0.343-0.391,0.883-0.112,1.28l3.399,4.863 c-0.605,1.095-1.087,2.254-1.438,3.46l-5.831,0.971c-0.482,0.08-0.836,0.498-0.836,0.986v5.5c0,0.485,0.348,0.9,0.825,0.985 l5.831,1.034c0.349,1.203,0.831,2.362,1.438,3.46l-3.441,4.813c-0.284,0.397-0.239,0.942,0.106,1.289l3.888,3.891 c0.343,0.343,0.884,0.391,1.281,0.112l4.87-3.411c1.093,0.601,2.248,1.078,3.445,1.424l0.976,5.861C21.3,47.647,21.717,48,22.206,48 h5.5c0.485,0,0.9-0.348,0.984-0.825l1.045-5.89c1.199-0.353,2.348-0.833,3.43-1.435l4.905,3.441 c0.398,0.281,0.938,0.232,1.282-0.111l3.888-3.891c0.346-0.347,0.391-0.894,0.104-1.292l-3.498-4.857 c0.593-1.08,1.064-2.222,1.407-3.408l5.918-1.039c0.479-0.084,0.827-0.5,0.827-0.985v-5.5C47.999,21.718,47.644,21.3,47.16,21.221z M25,32c-3.866,0-7-3.134-7-7c0-3.866,3.134-7,7-7s7,3.134,7,7C32,28.866,28.866,32,25,32z"></path>
                      </svg>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-scroll">
                    <DialogHeader>
                      <DialogTitle>Global Setting</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label className="flex items-center h-8">
                          PreviewName Character Case
                        </Label>
                        <RadioGroup defaultValue={previewNameCharacterCase} onValueChange={previewNameCharacterCaseOnChange} className="flex">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="default" id="default" />
                            <Label htmlFor="default">Default</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="lowerCase" id="lowerCase" />
                            <Label htmlFor="lowerCase">LowerCase</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="upperCase" id="upperCase" />
                            <Label htmlFor="upperCase">UpperCase</Label>
                          </div>
                        </RadioGroup>
                        <div className="flex items-center justify-between">
                          <Label>PreviewName Replace Inputs</Label>
                          <Button onClick={addPreviewNewRow} size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Row
                          </Button>
                        </div>
                        {previewNameReplaceDatas.map((pair) => (
                          <div key={pair.id} className="flex items-center space-x-2">
                            <Input
                              value={pair.original}
                              onChange={(e) => handlePreviewInputChange(pair.id, "original", e.target.value)}
                              placeholder="Original text"
                              className="w-full"
                            />
                            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <Input
                              value={pair.replacement}
                              onChange={(e) => handlePreviewInputChange(pair.id, "replacement", e.target.value)}
                              placeholder="Replacement text"
                              className="w-full"
                            />
                            <Button onClick={() => deletePreviewRow(pair.id)} size="icon" variant="ghost" className="flex-shrink-0">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete row</span>
                            </Button>
                          </div>
                        ))}
                        <div className="flex items-center justify-between">
                          <Label>ExportName Replace Inputs</Label>
                          <Button onClick={addExportNewRow} size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Row
                          </Button>
                        </div>
                        {exportNameReplaceDatas.map((pair) => (
                          <div key={pair.id} className="flex items-center space-x-2">
                            <Input
                              value={pair.original}
                              onChange={(e) => handleExportInputChange(pair.id, "original", e.target.value)}
                              placeholder="Original text"
                              className="w-full"
                            />
                            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <Input
                              value={pair.replacement}
                              onChange={(e) => handleExportInputChange(pair.id, "replacement", e.target.value)}
                              placeholder="Replacement text"
                              className="w-full"
                            />
                            <Button onClick={() => deleteExportRow(pair.id)} size="icon" variant="ghost" className="flex-shrink-0">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete row</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={onSave}>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button onClick={onExport}>Export</Button>
              </div>
            </div>
            {
              loading && (
                <div className="modal">
                  <div className="size-full flex">
                    <Loading color="#ffffff" />
                  </div>
                </div>
              )
            }
            <svg
              ref={cornerRef}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                cursor: "nwse-resize",
              }} width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0V16H0L16 0Z" fill="white" />
              <path d="M6.22577 16H3L16 3V6.22576L6.22577 16Z" fill="#000000" />
              <path d="M11.8602 16H8.63441L16 8.63441V11.8602L11.8602 16Z" fill="#000000" />
            </svg>
          </div>
        )}
    </>
  );
}

export default App;
