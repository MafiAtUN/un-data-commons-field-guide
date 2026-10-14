import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { Connect } from '../src/routes/Connect';
import { Home } from '../src/routes/Home';
import { Notebooks } from '../src/routes/Notebooks';

/**
 * The Python package and its connector, and the claim they replaced.
 *
 * The Notebooks page once said the official datacommons-client works against
 * this deployment. It does not: the client is created, then its first data
 * request is refused with 403 (checked live on 14 October 2026). These guard
 * against that claim coming back, and keep the routes to undata visible on the
 * pages a Python user or an agent builder lands on.
 */
function render(page: React.ReactNode, at = '/'): string {
  return renderToStaticMarkup(<MemoryRouter initialEntries={[at]}>{page}</MemoryRouter>);
}

const notebooksSource = readFileSync('src/routes/Notebooks.tsx', 'utf8');

describe('the official Python client', () => {
  it('is no longer described as working against this deployment', () => {
    expect(notebooksSource).not.toContain('which this deployment\n              answers — so no API key');
    expect(notebooksSource).toContain('it does not work against this deployment');
    expect(notebooksSource).toContain('403');
  });
});

describe('the undata package', () => {
  it('is offered on the Python page, with an install line and its links', () => {
    const html = render(<Notebooks />, '/notebooks');
    expect(html).toContain('id="undata"');
    expect(html).toContain('pip install undata');
    expect(html).toContain('https://pypi.org/project/undata/');
    expect(html).toContain('https://nerd-factory.github.io/undata/reference/');
  });

  it('is announced on the home page, as unofficial', () => {
    const html = render(<Home />);
    expect(html).toContain('pip install undata');
    expect(html).toContain('unofficial');
    expect(html).toContain('href="/notebooks#undata"');
  });

  it('has its connector set up on the Connect page beside the platform endpoint', () => {
    const html = render(<Connect />, '/connect');
    expect(html).toContain('id="undata"');
    expect(html).toContain('uvx --from &quot;undata[mcp]&quot; undata-mcp');
  });
});
