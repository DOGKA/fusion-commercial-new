declare module "react-quill-new" {
  import { ComponentType } from "react";

  export interface QuillOptions {
    debug?: string | boolean;
    modules?: Record<string, unknown>;
    placeholder?: string;
    readOnly?: boolean;
    theme?: string;
    formats?: string[];
    bounds?: string | HTMLElement;
    scrollingContainer?: string | HTMLElement;
  }

  export interface ReactQuillProps {
    id?: string;
    className?: string;
    theme?: string;
    style?: React.CSSProperties;
    readOnly?: boolean;
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    tabIndex?: number;
    bounds?: string | HTMLElement;
    scrollingContainer?: string | HTMLElement;
    onChange?: (
      content: string,
      delta: unknown,
      source: string,
      editor: unknown
    ) => void;
    onChangeSelection?: (
      range: unknown,
      source: string,
      editor: unknown
    ) => void;
    onFocus?: (range: unknown, source: string, editor: unknown) => void;
    onBlur?: (previousRange: unknown, source: string, editor: unknown) => void;
    onKeyPress?: React.EventHandler<unknown>;
    onKeyDown?: React.EventHandler<unknown>;
    onKeyUp?: React.EventHandler<unknown>;
    formats?: string[];
    modules?: Record<string, unknown>;
    children?: React.ReactNode;
    preserveWhitespace?: boolean;
  }

  const ReactQuill: ComponentType<ReactQuillProps>;
  export default ReactQuill;
}

declare module "react-quill-new/dist/quill.snow.css";
