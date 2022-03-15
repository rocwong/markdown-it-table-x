"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (md, options) => {
    const handleAttrs = (attrStr) => {
        var _a;
        const attrs = [];
        (_a = attrStr.match(/\w+="[^"]*"/gi)) === null || _a === void 0 ? void 0 : _a.forEach((el) => {
            var _a;
            const attr = el.split('=');
            attrs.push([attr[0], (_a = attr[1]) === null || _a === void 0 ? void 0 : _a.replace(/"/gi, '')]);
        });
        return attrs;
    };
    options = options || {};
    const markup_start = '{|', markup_end = '|}', sep_attr = options.attrSeparate || '||';
    const tableX = (state, startLine, endLine, silent) => {
        let nextLine, params, token, charCode, auto_closed = false, start = state.bMarks[startLine] + state.tShift[startLine], max = state.eMarks[startLine];
        // Should have at least two lines
        if (startLine + 2 > endLine) {
            return false;
        }
        // Check out the first character quickly,
        // this should filter out most of non-containers
        if (markup_start.charCodeAt(0) !== state.src.charCodeAt(start)) {
            return false;
        }
        if (markup_start.charCodeAt(1) !== state.src.charCodeAt(start + 1)) {
            return false;
        }
        // Table attributes
        params = state.src.slice(start + 2, max).trim();
        if (silent) {
            return true;
        }
        let tag, tableToken, trToken, tdToken, trStart = startLine, trBegin = true, embedStart = 0;
        tableToken = new state.Token('table_x_open', 'table', 1);
        tableToken.meta = { tr: [] };
        tableToken.attrs = handleAttrs(params);
        const handleNewRow = (rowStart) => {
            if (trBegin) {
                // Add new tr
                trToken = new state.Token('tr_open', 'tr', 1);
                trToken.meta = { td: [], type: 'tbody' };
                tableToken.meta.tr.push(trToken);
                trStart = rowStart;
                trBegin = false;
            }
        };
        const handleColumn = (isHerder, nextLine) => {
            handleNewRow(nextLine);
            if (isHerder) {
                trToken.meta.type = 'thead';
            }
            handleEmbed(nextLine);
            // Content of td/th
            tag = isHerder ? 'th' : 'td';
            tdToken = new state.Token(`${tag}_open`, tag, 1);
            tdToken.map = [1, max];
            // td content bounds
            tdToken.meta = {
                bounds: [state.bMarks[nextLine] + state.tShift[nextLine] + 1, state.eMarks[nextLine]],
            };
            trToken.meta.td.push(tdToken);
        };
        // Embedding markdown content into td
        const handleEmbed = (nextLine) => {
            handleNewRow(embedStart - 1);
            if (embedStart > 0) {
                tdToken = new state.Token(`td_open`, 'td', 1);
                // td content bounds
                tdToken.meta = {
                    embed: true,
                    bounds: [embedStart, nextLine],
                };
                trToken.meta.td.push(tdToken);
                embedStart = 0;
            }
        };
        // Search for the end of the block
        nextLine = startLine;
        for (;;) {
            nextLine++;
            if (nextLine >= endLine) {
                // Unclosed block should be autoclosed by end of document.
                // Also block seems to be autoclosed by end of parent
                break;
            }
            start = state.bMarks[nextLine] + state.tShift[nextLine];
            max = state.eMarks[nextLine];
            charCode = state.src.charCodeAt(start);
            if (charCode !== 0x21 /* ! */ && charCode !== 0x7c /* | */) {
                if (embedStart === 0) {
                    embedStart = nextLine;
                }
                continue;
            }
            if (charCode === 0x21 /* ! */) {
                handleColumn(true, nextLine);
                continue;
            }
            else if (markup_end.charCodeAt(1) !== state.src.charCodeAt(start + 1) /* } */) {
                // Check the next line
                // If not start of '|', will embedding content into td
                charCode = state.src.charCodeAt(state.bMarks[nextLine + 1] + state.tShift[nextLine + 1]);
                if (charCode !== 0x7c /* | */) {
                    continue;
                }
                if (state.src.charCodeAt(start + 1) === 0x2d /* - */) {
                    handleEmbed(nextLine);
                    // End of tr
                    trToken.map = [trStart, nextLine];
                    trBegin = true;
                    continue;
                }
                handleColumn(false, nextLine);
                continue;
            }
            // End of table
            auto_closed = true;
            break;
        }
        tableToken.map = [startLine, nextLine];
        tableToken.block = true;
        tableToken.level = state.level++;
        state.tokens.push(tableToken);
        let r, c, text, range, tbodyBegin = true;
        for (r = 0; r < tableToken.meta.tr.length; r++) {
            // Push in thead/tbody and tr open tokens
            trToken = tableToken.meta.tr[r];
            tag = trToken.meta.type;
            if (tbodyBegin) {
                tbodyBegin = false;
                token = state.push(`${tag}_open`, tag, 1);
                // token.map = trToken.map;
            }
            trToken.block = true;
            trToken.level = state.level++;
            state.tokens.push(trToken);
            state.lineMax = 1;
            // Push in th/td tokens
            for (c = 0; c < trToken.meta.td.length; c++) {
                tdToken = trToken.meta.td[c];
                range = [tdToken.meta.bounds[0], tdToken.meta.bounds[1]];
                text = state.src.slice.apply(state.src, range);
                tag = trToken.meta.type === 'thead' ? 'th' : 'td';
                token = state.push(`${tag}_open`, tag, 1);
                token.map = [nextLine, nextLine + 1];
                params = text.trim().split(sep_attr);
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
            if (trToken.meta.type === 'thead' || r + 1 === tableToken.meta.tr.length) {
                tag = trToken.meta.type;
                if (!tbodyBegin) {
                    tbodyBegin = true;
                    state.push(`${tag}_close`, tag, -1);
                }
            }
        }
        token = state.push('table_x_close', 'table', -1);
        state.line = nextLine + (auto_closed ? 1 : 0);
        return true;
    };
    md.block.ruler.at('table', tableX, { alt: ['paragraph', 'reference'] });
};
//# sourceMappingURL=index.js.map