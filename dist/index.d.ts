import MarkdownIt from 'markdown-it';
interface TableOptions {
    attrSeparate: string;
    allowedAttributes: string[];
}
declare const _default: (md: MarkdownIt, options: TableOptions) => void;
export default _default;
