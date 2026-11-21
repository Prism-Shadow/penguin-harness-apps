// Prose reads as wrapped text; the same test as the outline's documents.
export function prose(path) {
  return /(?:\.(?:md|mdx|markdown|txt|rst|adoc)|(?:^|\/)(?:README|LICENSE))$/i.test(
    path,
  );
}
export function language() {
  let locale = navigator.language;
  try {
    if (parent !== window && parent.document.documentElement.lang)
      locale = parent.document.documentElement.lang;
  } catch {}
  return /^zh/i.test(locale) ? "zh" : "en";
}
export const words = {
  en: {
    title: "Study Map",
    overview: "Overview",
    focusView: "Inspect node",
    connections: "Connections",
    noConnections:
      "No direct links were found. Select a node to inspect its source.",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    overviewCounts: (n, e) => n + " nodes · " + e + " connections",
    import: "Import",
    folder: "Code folder",
    docs: "Documents or source files",
    repo: "Public GitHub repository",
    github: "GitHub repository URL",
    fetch: "Import repository",
    library: "Studies",
    sample: "Example · Reading a request",
    newTitle: "Import study material",
    hint: "Choose files from this computer, paste text, or enter a public GitHub repository.",
    paste: "Paste text",
    pastePlaceholder:
      "Paste an article, notes or code here. A Markdown # heading becomes a section.",
    pasteGo: "Map this text",
    pasteName: "Pasted text",
    types:
      "Source files, Markdown and plain text. Hidden files, dependencies and credential files are skipped.",
    empty:
      "There was no text to read in what you chose. Choose source files, Markdown or plain text.",
    tooLong:
      "This text is too long for one study. Paste a shorter part, up to about 190 KB.",
    loading: "Reading material…",
    failed: "Could not open the material.",
    network:
      "Could not read this repository. Check that the address is a public github.com repository, or download it and choose it as a code folder.",
    scope: (n, total) =>
      n >= total
        ? n + (n === 1 ? " file" : " files")
        : n + " of " + total + " files included",
    commit: (sha) => "Commit " + sha,
    exampleHint:
      "This is an example. Click Import to map your own notes, code or a GitHub repository.",
    source: "Source",
    importLine: "Import statement",
    map: "Diagram",
    jump: "Jump to a node",
    line: "Line",
    earlier: "Show earlier lines",
    later: "Show later lines",
    noNode: "No linked node",
    file: "File",
    heading: "Section",
    symbol: "Declaration",
    passage: "Passage",
    concept: "AI concept",
    contains: "Contains",
    containsIn: "Part of",
    imports: "Imports",
    importsIn: "Imported by",
    previous: "Previous",
    next: "Next",
    noRelations: "No linked nodes in this view.",
    explore: "Explore this node →",
    viewSource: "Show the original lines",
    original: "Open on GitHub",
    export: "Export HTML",
    assistant: "Explain with AI",
    outline: "Source outline",
    ai: "AI explanation",
    run: "Generate diagram",
    cancel: "Cancel",
    aiTitle: "Explain with your Agent",
    aiInfo: (files, lines) =>
      "Your Agent’s model reads " +
      lines +
      (lines === 1 ? " line" : " lines") +
      " from " +
      files +
      (files === 1 ? " file" : " files") +
      " and draws the main ideas. Each idea links to the line it comes from, so you can check it.",
    working: "Generating explanations…",
    invalidMap:
      "The AI’s answer did not point to real lines in your material, so it was not used. Click Explain with AI to try again.",
    error:
      "Could not draw the diagram. Check that this Agent has a model on the Models page, then click Explain with AI again.",
    unsupported:
      "This version of PenguinHarness is too old for Explain with AI. Update it, then try again.",
    storeFail:
      "This browser could not save the study. Export HTML to keep a copy.",
    close: "Close",
    examples: "Open example",
    limited:
      "Some files did not fit and were left out. To read another part, import that folder on its own.",
    cap: "The source outline indexes up to 24 headings or declarations per file.",
    exportInfo:
      "This HTML includes the selected study’s source text. It opens offline.",
    save: "Download HTML",
    show: "View",
    repoHelp:
      "Paste a public github.com/owner/repository URL. Files are read from a single commit.",
    storage: "Saved in this browser",
    remove: "Remove study",
    removeShort: "Remove",
    confirmRemove: "Remove this study from this browser?",
    sampleLabel: "Example",
    files: "files",
    nodes: "nodes",
    done: "Diagram ready.",
    sourceFormat: "Unsupported or empty files were skipped.",
    privacy: "Only choose materials you intend to study.",
    local: "Local outline",
    openTab: "Open in PenguinHarness to use your Agent.",
    stalled:
      "The AI is still working. Open this study again in a moment to see the diagram.",
    limitedTree: "GitHub returned a partial file list.",
    describe: (kind, path, start, end, count) =>
      kind === "file" && prose(path)
        ? "Select a section in the diagram to see its lines in " + path + "."
        : kind === "file"
          ? "Select a part in the diagram to see its lines in " +
            path +
            ". Arrows show the files it imports."
          : kind === "symbol"
            ? "Starts on line " +
              start +
              " of " +
              path +
              ". Its lines are highlighted in the source."
            : "Lines " +
              start +
              "–" +
              end +
              " of " +
              path +
              ", highlighted in the source.",
  },
  zh: {
    title: "学习框图",
    overview: "全局框图",
    focusView: "查看节点",
    connections: "连接关系",
    noConnections: "未发现直接连接。点击节点可以查看原文。",
    zoomIn: "放大",
    zoomOut: "缩小",
    overviewCounts: (n, e) => n + " 个节点 · " + e + " 条连接",
    import: "导入",
    folder: "代码文件夹",
    docs: "文档或源码文件",
    repo: "公开 GitHub 仓库",
    github: "GitHub 仓库地址",
    fetch: "导入仓库",
    library: "学习记录",
    sample: "示例 · 一次请求的旅程",
    newTitle: "导入学习材料",
    hint: "选择电脑上的文件、粘贴文字，或输入公开的 GitHub 仓库地址。",
    paste: "粘贴文字",
    pastePlaceholder:
      "在这里粘贴文章、笔记或代码。Markdown 的 # 标题会成为一个章节。",
    pasteGo: "生成框图",
    pasteName: "粘贴的文字",
    types:
      "支持源码、Markdown 和纯文本。自动跳过隐藏文件、依赖目录和常见凭据文件。",
    empty: "所选内容里没有可读的文字，请选择源码、Markdown 或纯文本文件。",
    tooLong:
      "这段文字太长，一份学习记录放不下。请粘贴较短的一部分（约 190 KB 以内）。",
    loading: "正在读取材料…",
    failed: "无法打开这份学习材料。",
    network:
      "无法读取这个仓库。请确认它是 github.com 上的公开仓库，或者先下载到电脑，再作为代码文件夹导入。",
    scope: (n, total) =>
      n >= total ? n + " 个文件" : "已纳入 " + n + " / " + total + " 个文件",
    commit: (sha) => "提交 " + sha,
    exampleHint:
      "这是一份示例。点击「导入」，为你自己的笔记、代码或 GitHub 仓库生成框图。",
    source: "原文",
    importLine: "引用位置",
    map: "框图",
    jump: "跳转到节点",
    line: "行",
    earlier: "查看前面的行",
    later: "查看后面的行",
    noNode: "此行没有关联节点",
    file: "文件",
    heading: "章节",
    symbol: "声明",
    passage: "段落",
    concept: "AI 概念",
    contains: "包含",
    containsIn: "所属",
    imports: "引入",
    importsIn: "由其引入",
    previous: "上一组",
    next: "下一组",
    noRelations: "此视图中没有相连的节点。",
    explore: "展开此节点 →",
    viewSource: "定位到原文",
    original: "在 GitHub 查看",
    export: "导出 HTML",
    assistant: "用 AI 讲解",
    outline: "原文大纲",
    ai: "AI 讲解",
    run: "生成框图",
    cancel: "取消",
    aiTitle: "让 Agent 讲解材料",
    aiInfo: (files, lines) =>
      "Agent 的模型会读取 " +
      files +
      " 个文件中的 " +
      lines +
      " 行，把主要概念画成框图。每个概念都链接到它所在的原文行，方便你核对。",
    working: "正在生成讲解…",
    invalidMap:
      "AI 的回答没有对上材料里的原文，所以没有采用。可以点击「用 AI 讲解」再试一次。",
    error:
      "未能生成框图。请在「模型库」页确认此 Agent 已设置模型，再点击「用 AI 讲解」。",
    unsupported:
      "当前 PenguinHarness 版本太旧，不支持「用 AI 讲解」。请升级后再试。",
    storeFail: "浏览器未能保存本次学习记录，可导出 HTML 保留副本。",
    close: "关闭",
    examples: "打开示例",
    limited: "有些文件放不下，没有纳入。想读其他部分，可以单独导入那个文件夹。",
    cap: "原文大纲每个文件最多收录 24 个标题或声明。",
    exportInfo: "HTML 包含本份学习材料的原文，下载后可离线查看。",
    save: "下载 HTML",
    show: "查看",
    repoHelp:
      "输入公开的 github.com/作者/仓库 地址，工作台会从同一次提交中读取文件。",
    storage: "已保存在此浏览器",
    remove: "移除记录",
    removeShort: "移除",
    confirmRemove: "从此浏览器移除这份学习记录？",
    sampleLabel: "示例",
    files: "个文件",
    nodes: "个节点",
    done: "框图已生成。",
    sourceFormat: "已跳过不支持的文件和空文件。",
    privacy: "请选择你想要阅读的材料。",
    local: "本地大纲",
    openTab: "请在 PenguinHarness 中打开此工作台以使用 Agent。",
    stalled: "AI 还在生成。稍后重新打开这份学习记录，就能看到框图。",
    limitedTree: "GitHub 仅返回了部分文件列表。",
    describe: (kind, path, start, end, count) =>
      kind === "file" && prose(path)
        ? "在框图中选择一个章节，即可查看它在 " + path + " 中的原文。"
        : kind === "file"
          ? "在框图中选择一个部分，即可查看它在 " +
            path +
            " 中的原文。箭头表示它引入的文件。"
          : kind === "symbol"
            ? "从 " + path + " 第 " + start + " 行开始，对应的原文已高亮。"
            : "位于 " +
              path +
              " 第 " +
              start +
              "–" +
              end +
              " 行，对应的原文已高亮。",
  },
};
