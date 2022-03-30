"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (md, options) => {
    options = options || {};
    const markupStart = '{|', markupEnd = '|}', sepAttr = options.attrSeparate || '||', allowedAttrs = options.allowedAttrs || ['id', 'class', 'style', 'width', 'height', 'align'];
    const table_x_plugin = (state, startLine, endLine, silent) => {
        let nextLine, params, token, charCode, auto_closed = false, start = state.bMarks[startLine] + state.tShift[startLine], max = state.eMarks[startLine];
        // Should have at least two lines
        if (startLine + 2 > endLine) {
            return false;
        }
        // Check out the first character quickly,
        // this should filter out most of non-containers
        if (markupStart.charCodeAt(0) !== state.src.charCodeAt(start)) {
            return false;
        }
        if (markupStart.charCodeAt(1) !== state.src.charCodeAt(start + 1)) {
            return false;
        }
        // Table attributes
        params = state.src.slice(start + 2, max).trim();
        if (silent) {
            return true;
        }
        let tag, tableToken, trToken, tdToken, trStart = startLine, trBegin = true, embedStart = 0;
        const handleAttrs = (attrStr) => {
            var _a;
            const attrs = [];
            (_a = attrStr.match(/\w+="[^"]*"/gi)) === null || _a === void 0 ? void 0 : _a.forEach((el) => {
                var _a, _b;
                const attr = el.split('=');
                if (allowedAttrs.length > 0) {
                    if (allowedAttrs.includes(attr[0])) {
                        attrs.push([attr[0], (_a = attr[1]) === null || _a === void 0 ? void 0 : _a.replace(/"/gi, '')]);
                    }
                }
                else {
                    attrs.push([attr[0], (_b = attr[1]) === null || _b === void 0 ? void 0 : _b.replace(/"/gi, '')]);
                }
            });
            return attrs;
        };
        const handleNewRow = (rowStart) => {
            if (trBegin) {
                // Add new tr
                trToken = new state.Token('tr_open', 'tr', 1);
                trToken.meta = { td: [] };
                tableToken.meta.tr.push(trToken);
                trStart = rowStart;
                trBegin = false;
            }
        };
        const handleColumn = (th, nextLine) => {
            handleNewRow(nextLine);
            handleEmbed(nextLine);
            tag = th ? 'th' : 'td';
            tdToken = new state.Token(`${tag}_open`, tag, 1);
            tdToken.map = [1, max];
            // th/td content bounds
            tdToken.meta = {
                bounds: [state.bMarks[nextLine] + state.tShift[nextLine] + 1, state.eMarks[nextLine]],
                markup: tag,
            };
            trToken.meta.td.push(tdToken);
        };
        // Embedding markdown content into th/td
        const handleEmbed = (nextLine) => {
            handleNewRow(embedStart - 1);
            if (embedStart > 0) {
                const th = state.src.charCodeAt(state.bMarks[embedStart - 1]) === 0x21; /* ! */
                tag = th ? 'th' : 'td';
                tdToken = new state.Token(`${tag}_open`, tag, 1);
                // tdToken.map = [1, max];
                // th/td content bounds
                tdToken.meta = {
                    embed: true,
                    bounds: [embedStart, nextLine],
                    markup: tag,
                };
                trToken.meta.td.push(tdToken);
                embedStart = 0;
            }
        };
        tableToken = new state.Token('table_x_open', 'table', 1);
        tableToken.meta = { tr: [] };
        tableToken.attrs = handleAttrs(params);
        // Search for the end of the block
        nextLine = startLine;
        for (;;) {
            nextLine++;
            if (nextLine >= endLine) {
                // Unclosed block should be autoclosed by end of document.
                // Also block seems to be autoclosed by end of parent
                break;
            }
            // start = state.bMarks[nextLine] + state.tShift[nextLine];
            start = state.bMarks[nextLine];
            max = state.eMarks[nextLine];
            charCode = state.src.charCodeAt(start);
            if (charCode !== 0x21 /* ! */ && charCode !== 0x7c /* | */) {
                if (embedStart === 0) {
                    embedStart = nextLine;
                }
                continue;
            }
            if (charCode !== 0x7c /* | */ || markupEnd.charCodeAt(1) !== state.src.charCodeAt(start + 1) /* } */) {
                if (state.src.charCodeAt(start + 1) === 0x2d /* - */) {
                    handleEmbed(nextLine);
                    // End of tr
                    trToken.map = [trStart, nextLine];
                    trBegin = true;
                    continue;
                }
                // Check the next line
                // If not start of '|' or '!', will embedding content into th/td
                charCode = state.src.charCodeAt(state.bMarks[nextLine + 1]);
                if (charCode !== 0x7c /* | */ && charCode !== 0x21 /* ! */) {
                    handleEmbed(nextLine);
                    continue;
                }
                charCode = state.src.charCodeAt(start);
                handleColumn(charCode === 0x21 /* ! */, nextLine);
                continue;
            }
            handleEmbed(nextLine);
            // End of table
            auto_closed = true;
            break;
        }
        tableToken.map = [startLine, nextLine];
        tableToken.block = true;
        tableToken.level = state.level++;
        state.tokens.push(tableToken);
        state.push(`tbody_open`, 'tbody', 1);
        let r, c, text, range;
        for (r = 0; r < tableToken.meta.tr.length; r++) {
            // Push in tbody and tr open tokens
            trToken = tableToken.meta.tr[r];
            trToken.block = true;
            trToken.level = state.level++;
            state.tokens.push(trToken);
            state.lineMax = 1;
            // Push in th/td tokens
            for (c = 0; c < trToken.meta.td.length; c++) {
                tdToken = trToken.meta.td[c];
                range = [tdToken.meta.bounds[0], tdToken.meta.bounds[1]];
                text = state.src.slice.apply(state.src, range);
                tag = tdToken.meta.markup;
                token = state.push(`${tag}_open`, tag, 1);
                token.map = [nextLine, nextLine + 1];
                params = text.trim().split(sepAttr);
                if (params.length > 1) {
                    text = params[1];
                    token.attrs = handleAttrs(params[0]);
                }
                else {
                    text = params[0];
                }
                if (tdToken.meta.embed) {
                    embedStart = tdToken.meta.bounds[0] - 1;
                    params = state.src.substring(state.bMarks[embedStart] + state.tShift[embedStart] + 1, state.eMarks[embedStart]);
                    if (params.trim() !== '') {
                        token.attrs = handleAttrs(params.trim());
                    }
                    state.md.block.tokenize(state, tdToken.meta.bounds[0], tdToken.meta.bounds[1]);
                }
                else {
                    token = state.push('inline', '', 0);
                    token.content = text.trim();
                    token.level = trToken.level + 1;
                    token.children = [];
                }
                state.push(`${tag}_close`, tag, -1);
            }
            state.push('tr_close', 'tr', -1);
        }
        state.push('tbody_close', 'tbody', -1);
        state.push('table_x_close', 'table', -1);
        state.line = nextLine + (auto_closed ? 1 : 0);
        return true;
    };
    md.block.ruler.at('table', table_x_plugin, { alt: ['paragraph', 'reference'] });
};
//# sourceMappingURL=index.js.map