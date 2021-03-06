import * as md from 'markdown-it';
import * as beautify from 'js-beautify';
import outdent from 'outdent';
import mdTable from '../src/index';

it('should return table', () => {
  const expected: string = outdent`
    <h1>markup must start on the first character of the line</h1>
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
    <h2>h2</h2>
    <table>
        <tbody>
            <tr>
                <th>
                    <p>Embedding tag p</p>
                    <ul>
                        <li>Embedding tag li 1</li>
                        <li>Embedding tag li 2</li>
                        <li>Embedding tag li 3</li>
                    </ul>
                </th>
                <th>
                    <p>Embedding tag p</p>
                    <ul>
                        <li>Embedding tag li 1</li>
                        <li>Embedding tag li 2</li>
                        <li>Embedding tag li 3</li>
                    </ul>
                </th>
            </tr>
        </tbody>
    </table>
    `;

  const result: string = md().use(mdTable).render(outdent`
    # markup must start on the first character of the line
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
    ## h2
    {|
    !
    Embedding tag p

    * Embedding tag li 1
    * Embedding tag li 2
    * Embedding tag li 3
    !
    Embedding tag p

    * Embedding tag li 1
    * Embedding tag li 2
    * Embedding tag li 3
    |}
    `);

  expect(beautify.html(result)).toBe(beautify.html(expected));
});

it('custom attribute separate', () => {
  const expected: string = outdent`
    <table>
        <tbody>
            <tr>
                <th class="custom">custom</th>
            </tr>
            <tr>
                <td>
                    <p>Embedding tag p</p>
                </td>
            </tr>
        </tbody>
    </table>
    `;

  const result: string = md().use(mdTable, { attrSeparate: '%' }).render(outdent`
    {|
    ! class="custom" % custom
    |-
    |
    Embedding tag p
    |}
    `);
  expect(beautify.html(result)).toBe(beautify.html(expected));
});

it('custom allowed attribute', () => {
  const expected: string = outdent`
    <table>
        <tbody>
            <tr>
                <th rowspan="2">custom</th>
            </tr>
            <tr>
                <th>
                    <p>Embedding tag p</p>
                </th>
            </tr>
        </tbody>
    </table>
    `;

  const result: string = md().use(mdTable, { allowedAttrs: ['rowspan'] }).render(outdent`
    {|
    ! class="custom" rowspan="2" || custom
    |-
    !
    Embedding tag p
    |}
    `);

  expect(beautify.html(result)).toBe(beautify.html(expected));
});
