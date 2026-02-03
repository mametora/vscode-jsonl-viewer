import { useCallback, useMemo, useRef, useEffect } from "react";
import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { keymap } from "@codemirror/view";
import { Prec } from "@codemirror/state";
import { autocompletion } from "@codemirror/autocomplete";
import { vscodeExtensions } from "../utils/codemirrorTheme";
import { createSqlCompletions } from "../utils/sqlCompletions";

interface QueryEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => void;
  columns: string[];
  placeholder?: string;
}

export function QueryEditor({
  value,
  onChange,
  onExecute,
  columns,
  placeholder = "SELECT * FROM data WHERE column = 'value' ORDER BY id",
}: QueryEditorProps) {
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  const executeKeymap = useMemo(
    () =>
      Prec.highest(
        keymap.of([
          {
            key: "Mod-Enter",
            run: () => {
              onExecute();
              return true;
            },
          },
        ])
      ),
    [onExecute]
  );

  const sqlCompletion = useMemo(() => {
    const completionSource = createSqlCompletions(columns);
    return autocompletion({
      override: [completionSource],
      activateOnTyping: true,
      maxRenderedOptions: 20,
    });
  }, [columns]);

  const extensions = useMemo(
    () => [
      sql(),
      vscodeExtensions,
      executeKeymap,
      sqlCompletion,
    ],
    [executeKeymap, sqlCompletion]
  );

  const handleChange = useCallback(
    (val: string) => {
      onChange(val);
    },
    [onChange]
  );

  // Focus the editor when mounted
  useEffect(() => {
    if (editorRef.current?.view) {
      editorRef.current.view.focus();
    }
  }, []);

  return (
    <div className="query-editor">
      <CodeMirror
        ref={editorRef}
        value={value}
        onChange={handleChange}
        extensions={extensions}
        placeholder={placeholder}
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false, // We use our custom autocompletion
          history: true,
          searchKeymap: false,
        }}
        minHeight="38px"
        maxHeight="120px"
      />
    </div>
  );
}
