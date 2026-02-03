import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

const vscodeTheme = EditorView.theme(
  {
    "&": {
      color: "var(--vscode-editor-foreground)",
      backgroundColor: "var(--vscode-input-background)",
      fontSize: "var(--vscode-editor-font-size)",
      fontFamily: "var(--vscode-editor-font-family)",
    },
    ".cm-content": {
      caretColor: "var(--vscode-editorCursor-foreground)",
      padding: "4px 0",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "var(--vscode-editorCursor-foreground)",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      {
        backgroundColor: "var(--vscode-editor-selectionBackground)",
      },
    ".cm-panels": {
      backgroundColor: "var(--vscode-editor-background)",
      color: "var(--vscode-editor-foreground)",
    },
    ".cm-gutters": {
      backgroundColor: "var(--vscode-editorGutter-background)",
      color: "var(--vscode-editorLineNumber-foreground)",
      border: "none",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "var(--vscode-editor-lineHighlightBackground)",
    },
    ".cm-activeLine": {
      backgroundColor: "var(--vscode-editor-lineHighlightBackground)",
    },
    ".cm-foldPlaceholder": {
      backgroundColor: "var(--vscode-editor-foldBackground)",
      border: "none",
      color: "var(--vscode-editor-foreground)",
    },
    ".cm-tooltip": {
      backgroundColor: "var(--vscode-editorWidget-background)",
      border: "1px solid var(--vscode-editorWidget-border)",
      color: "var(--vscode-editorWidget-foreground)",
    },
    ".cm-tooltip .cm-tooltip-arrow:before": {
      borderTopColor: "var(--vscode-editorWidget-border)",
      borderBottomColor: "var(--vscode-editorWidget-border)",
    },
    ".cm-tooltip .cm-tooltip-arrow:after": {
      borderTopColor: "var(--vscode-editorWidget-background)",
      borderBottomColor: "var(--vscode-editorWidget-background)",
    },
    ".cm-tooltip-autocomplete": {
      "& > ul > li[aria-selected]": {
        backgroundColor: "var(--vscode-list-activeSelectionBackground)",
        color: "var(--vscode-list-activeSelectionForeground)",
      },
      "& > ul > li": {
        padding: "2px 8px",
      },
    },
    ".cm-completionIcon": {
      width: "16px",
      marginRight: "4px",
    },
    ".cm-completionLabel": {
      fontFamily: "var(--vscode-editor-font-family)",
    },
    ".cm-completionDetail": {
      fontFamily: "var(--vscode-editor-font-family)",
      color: "var(--vscode-descriptionForeground)",
      marginLeft: "8px",
    },
    ".cm-scroller": {
      fontFamily: "var(--vscode-editor-font-family)",
      overflow: "auto",
    },
    "&.cm-focused": {
      outline: "1px solid var(--vscode-focusBorder)",
    },
  },
  { dark: true }
);

const vscodeHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "var(--vscode-debugTokenExpression-name)" },
  {
    tag: [tags.name, tags.deleted, tags.character, tags.macroName],
    color: "var(--vscode-editor-foreground)",
  },
  {
    tag: [tags.function(tags.variableName), tags.labelName],
    color: "var(--vscode-symbolIcon-functionForeground)",
  },
  {
    tag: [tags.propertyName],
    color: "var(--vscode-symbolIcon-propertyForeground)",
  },
  {
    tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)],
    color: "var(--vscode-debugTokenExpression-name)",
  },
  {
    tag: [tags.definition(tags.name), tags.separator],
    color: "var(--vscode-editor-foreground)",
  },
  {
    tag: [
      tags.typeName,
      tags.className,
      tags.number,
      tags.changed,
      tags.annotation,
      tags.modifier,
      tags.self,
      tags.namespace,
    ],
    color: "var(--vscode-debugTokenExpression-number)",
  },
  {
    tag: [
      tags.operator,
      tags.operatorKeyword,
      tags.url,
      tags.escape,
      tags.regexp,
      tags.link,
      tags.special(tags.string),
    ],
    color: "var(--vscode-debugTokenExpression-name)",
  },
  { tag: [tags.meta, tags.comment], color: "var(--vscode-descriptionForeground)" },
  {
    tag: tags.strong,
    fontWeight: "bold",
  },
  {
    tag: tags.emphasis,
    fontStyle: "italic",
  },
  {
    tag: tags.strikethrough,
    textDecoration: "line-through",
  },
  {
    tag: tags.link,
    color: "var(--vscode-textLink-foreground)",
    textDecoration: "underline",
  },
  {
    tag: tags.heading,
    fontWeight: "bold",
    color: "var(--vscode-editor-foreground)",
  },
  {
    tag: [tags.atom, tags.bool, tags.special(tags.variableName)],
    color: "var(--vscode-debugTokenExpression-boolean)",
  },
  {
    tag: [tags.processingInstruction, tags.string, tags.inserted],
    color: "var(--vscode-debugTokenExpression-string)",
  },
  {
    tag: tags.invalid,
    color: "var(--vscode-errorForeground)",
  },
]);

export const vscodeExtensions: Extension = [
  vscodeTheme,
  syntaxHighlighting(vscodeHighlightStyle),
];
