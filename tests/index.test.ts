import * as md from 'markdown-it';
import * as beautify from 'js-beautify';
import outdent from 'outdent';
import mdTable from '../src/index';

it('should return table', () => {
  const expected: string = outdent`
  <h1>h1</h1>
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
  <h2>h2</h2>
  <table>
      <tbody>
          <tr>
              <td>
                  <p>Embedding tag p</p>
                  <ul>
                      <li>Embedding tag li 1</li>
                      <li>Embedding tag li 2</li>
                      <li>Embedding tag li 3</li>
                  </ul>
              </td>
          </tr>
      </tbody>
  </table>
  `;

  const result: string = md().use(mdTable).render(outdent`
  # h1
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
  ## h2  
  {|
  | 
  Embedding tag p

  * Embedding tag li 1
  * Embedding tag li 2
  * Embedding tag li 3
  |-
  |}
  `);
  expect(beautify.html(result)).toBe(beautify.html(expected));
});

it('custom attribute separate', () => {
  const expected: string = outdent`
  <table>
      <thead>
          <tr>
            <th class="custom">custom</th>
          </tr>
      </thead>
      <tbody>
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
  |-
  |}
  `);
  expect(beautify.html(result)).toBe(beautify.html(expected));
});
