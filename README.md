# markdown-it-table-x

[![NPM version](https://img.shields.io/npm/v/markdown-it-table-x.svg?style=flat-square&color=green)](https://www.npmjs.org/package/markdown-it-table-x)

> :star: Caution: The plugin is usable but not perfect. There may be conflicts with other markdown plugin. I don't have enough testing in my project

## Install

```bash
yarn add markdown-it-table-x
```

## Example

> markup must start on the first character of the line

```markdown
{| class="html_attrs_in_table_tag success" style="height:12rem;" align="right"
! class="html_attrs_in_th_tag" align="center" || Name
! Description
|-
!class="html_attrs_in_th_tag" || *row-1-col-1*
|*here is td tag*
|-
!here is th tag
|class="html_attrs_in_td_tag" align="right"
* Embedding markdown content.
* Embedding markdown content.
 ![space_on_first_character]()
|}
```

rendered as

```html
<table class="html_attrs_in_table_tag success" style="height:12rem;" align="right">
    <tbody>
        <tr>
            <th class="html_attrs_in_th_tag" align="center">Name</th>
            <th>Description</th>
        </tr>
        <tr>
            <th class="html_attrs_in_th_tag"><em>row-1-col-1</em></th>
            <td><em>here is td tag</em></td>
        </tr>
        <tr>
            <th>here is th tag</th>
            <td class="html_attrs_in_td_tag" align="right">
                <ul>
                    <li>Embedding markdown content.</li>
                    <li>Embedding markdown content.</li>
                </ul>
                <p><img src="" alt="space_on_first_character"></p>
            </td>
        </tr>
    </tbody>
</table>
```

## Params

- **attrSeparate** - custom attribute separate (default: `||` )
- **allowedAttrs** - custom alloowed attributes (default:` ['id', 'class', 'style', 'width', 'height', 'align', 'rowspan', 'colspan']`, set `[]` for allow all)
