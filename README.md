# markdown-it-table-x

[![NPM version](https://img.shields.io/npm/v/markdown-it-table-x.svg?style=flat-square&color=green)](https://www.npmjs.org/package/markdown-it-table-x)

> :star: Caution: The plugin is usable but not perfect. There may be conflicts with other markdown plugin

## Install

```bash
yarn add markdown-it-table-x -D
```

## Example

```markdown
{| class="html_attrs_in_table_tag success" style="height:12rem;" align="right"
! class="html_attrs_in_th_tag" align="center" || Name
! Description
|-
|class="html_attrs_in_td_tag" || *row-1-col-1*
|*row-1-col-2*
|-
|row-2-col-1
|class="html_attrs_in_td_tag" align="right"
* Embedding markdown content.
* Embedding markdown content.
|-
|}
```

rendered as

```html
<table class="html_attrs_in_table_tag success" style="height:12rem;" align="right">
  <thead>
    <tr>
      <th class="html_attrs_in_th_tag" align="center">Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="html_attrs_in_td_tag"><em>row-1-col-1</em></td>
      <td><em>row-1-col-2</em></td>
    </tr>
    <tr>
      <td>row-2-col-1</td>
      <td class="html_attrs_in_td_tag" align="right">
        <ul>
          <li>Embedding markdown content.</li>
          <li>Embedding markdown content.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>
```

## Params

- **attrSeparate** - custom attribute separate (default: || )
