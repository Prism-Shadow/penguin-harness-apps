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
    hint: "Choose a folder, text files or a public GitHub repository.",
    types:
      "Source files, Markdown and plain text. Hidden files, dependencies and credential files are skipped.",
    empty: "No supported, non-empty files found.",
    loading: "Reading material…",
    failed: "Could not open the material.",
    network: "Could not read this public repository. Try a local folder.",
    scope: (n, total) => n + " of " + total + " files included",
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
      "Send " +
      lines +
      " selected source lines from " +
      files +
      " files to this Agent’s configured model. Each concept must cite a line from the material.",
    working: "Generating explanations…",
    invalidMap:
      "The response did not match the cited source. Your previous diagram is still available.",
    error:
      "Could not generate the diagram. Check the Agent’s chat model and try again.",
    unsupported: "Update PenguinHarness to use a read-only Agent session.",
    storeFail:
      "This browser could not save the study. Export HTML to keep a copy.",
    close: "Close",
    examples: "Open example",
    limited:
      "Only the included files are mapped. Choose a smaller folder to study another part.",
    cap: "The source outline indexes up to 24 headings or declarations per file.",
    exportInfo:
      "This HTML includes the selected study’s source text. It opens offline.",
    save: "Download HTML",
    show: "View",
    repoHelp:
      "Paste a public github.com/owner/repository URL. Files are read from a single commit.",
    storage: "Saved in this browser",
    remove: "Remove study",
    confirmRemove: "Remove this study from this browser?",
    sampleLabel: "Example",
    files: "files",
    nodes: "nodes",
    done: "Diagram ready.",
    sourceFormat: "Unsupported or empty files were skipped.",
    privacy: "Only choose materials you intend to study.",
    local: "Local outline",
    openTab: "Open in PenguinHarness to use your Agent.",
    stalled: "The response is still running. Reopen this study to check again.",
    limitedTree: "GitHub returned a partial file list.",
    describe: (kind, path, start, end, count) =>
      kind === "file"
        ? "Read " +
          path +
          " and use the connected nodes to explore the imported modules and definitions found in this snapshot."
        : kind === "symbol"
          ? "This declaration begins on line " +
            start +
            " of " +
            path +
            ". Use the highlighted lines to inspect its definition."
          : "This passage appears on lines " +
            start +
            "–" +
            end +
            " of " +
            path +
            ". Compare the diagram with the original wording below.",
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
    hint: "选择本地文件夹、文本文件，或导入公开 GitHub 仓库。",
    types:
      "支持源码、Markdown 和纯文本。自动跳过隐藏文件、依赖目录和常见凭据文件。",
    empty: "没有找到支持的非空文本文件。",
    loading: "正在读取材料…",
    failed: "无法打开这份学习材料。",
    network: "无法读取这个公开仓库，可以改为导入本地文件夹。",
    scope: (n, total) => "已纳入 " + n + " / " + total + " 个文件",
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
      "将 " +
      files +
      " 个文件中的 " +
      lines +
      " 行选段发送给此 Agent 配置的模型。每个概念都需要引用材料中的原文。",
    working: "正在生成讲解…",
    invalidMap: "模型引用与原文不符，仍可使用上一份框图。",
    error: "未能生成讲解，请检查 Agent 的对话模型后重试。",
    unsupported: "请升级 PenguinHarness，以支持禁止工具调用的学习会话。",
    storeFail: "浏览器未能保存本次学习记录，可导出 HTML 保留副本。",
    close: "关闭",
    examples: "打开示例",
    limited: "框图只包含已纳入的文件。可以选择较小的子目录，继续学习其他部分。",
    cap: "原文大纲每个文件最多收录 24 个标题或声明。",
    exportInfo: "HTML 包含本份学习材料的原文，下载后可离线查看。",
    save: "下载 HTML",
    show: "查看",
    repoHelp:
      "输入公开的 github.com/作者/仓库 地址，工作台会从同一次提交中读取文件。",
    storage: "已保存在此浏览器",
    remove: "移除记录",
    confirmRemove: "从此浏览器移除这份学习记录？",
    sampleLabel: "示例",
    files: "个文件",
    nodes: "个节点",
    done: "框图已生成。",
    sourceFormat: "已跳过不支持的文件和空文件。",
    privacy: "请选择你想要阅读的材料。",
    local: "本地大纲",
    openTab: "请在 PenguinHarness 中打开此工作台以使用 Agent。",
    stalled: "模型仍在运行。稍后重新打开此学习记录可查看结果。",
    limitedTree: "GitHub 仅返回了部分文件列表。",
    describe: (kind, path, start, end, count) =>
      kind === "file"
        ? "打开 " + path + "，沿连线查看这份材料收录的章节、定义或引用。"
        : kind === "symbol"
          ? "这个声明位于 " +
            path +
            " 第 " +
            start +
            " 行。可以在左侧高亮的原文中核对定义。"
          : "这段内容位于 " +
            path +
            " 的第 " +
            start +
            " 至 " +
            end +
            " 行。可对照下方原文理解这部分内容。",
  },
};
