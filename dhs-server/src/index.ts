import { argv } from 'yargs';
import * as http from 'http';
import * as os from 'os';
import * as url from 'url';

import { IncomingMessage, ServerResponse } from 'http';

import * as SymbolModule from 'dhs-symbol';

import { createCanvas, loadImage, registerFont } from 'canvas';

registerFont('./dhs-symbol/fonts/WorkSans/WorkSans-Regular.ttf', { family: 'Work Sans' });
registerFont('./dhs-symbol/fonts/WorkSans/WorkSans-Bold.ttf', { family: 'Work Sans', weight: 'bold' });

const hostname = os.hostname();
const bindAddress = process.env.BIND_ADDRESS || '0.0.0.0';

let port = 2526;
if (typeof argv.port === 'string') {
  port = parseInt(argv.port);
} else if (typeof argv.port === 'number') {
  port = argv.port;
} else {
  console.log('No port specified, defaulting to %d', port);
}

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  const req_url = req.url ? req.url : '';
  if (req_url.includes('favicon')) {
    //TODO: return favicon
    // Ignore favicon for now
    res.statusCode = 204;
    return;
  }

  const url_parts = url.parse(req_url, true);
  const url_pathname = url_parts ? url_parts.pathname : '';
  const url_path_parts = url_pathname ? url_pathname.split('/') : [''];
  const index: number = url_path_parts.length - 1;
  const url_filename = url_path_parts ? url_path_parts[index] : '';
  const url_filenametype = url_filename.split('.');
  const extension = url_filenametype[1];

  if (extension && extension.toUpperCase() == 'SVG') {
    let style: undefined | SymbolModule.KVMap = SymbolModule.validateOptions(
      url_parts.query,
      SymbolModule.styleValidation
    );
    if (Object.keys(style).length == 0) {
      style = undefined;
    }
    let badge: undefined | SymbolModule.KVMap = SymbolModule.validateOptions(
      url_parts.query,
      SymbolModule.badgeValidation
    );
    if (Object.keys(badge).length == 0) {
      badge = undefined;
    }
    const decorator: undefined | Partial<SymbolModule.Decorator>[] = SymbolModule.validateDecorators(url_parts.query);
    const symbol = new SymbolModule.Symbol(url_filenametype[0], style, badge, decorator).asSVG();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.end(symbol);
    return;
  } else if (url_filenametype[1].toUpperCase() == 'PNG') {
    let style: undefined | SymbolModule.KVMap = SymbolModule.validateOptions(
      url_parts.query,
      SymbolModule.styleValidation
    );
    if (Object.keys(style).length == 0) {
      style = undefined;
    }
    let badge: undefined | SymbolModule.KVMap = SymbolModule.validateOptions(
      url_parts.query,
      SymbolModule.badgeValidation
    );
    if (Object.keys(badge).length == 0) {
      badge = undefined;
    }
    const decorator: undefined | Partial<SymbolModule.Decorator>[] = SymbolModule.validateDecorators(url_parts.query);
    const symbol = new SymbolModule.Symbol(url_filenametype[0], style, badge, decorator);
    const svgBuffer = Buffer.from(symbol.asSVG());

    const MAX_SIZE = 2000; // Maximum width/hight for the canvas to avoid out of memory
    const canvas = createCanvas(Math.min(symbol.width, MAX_SIZE), Math.min(symbol.height, MAX_SIZE));
    const ctx = canvas.getContext('2d');

    loadImage(svgBuffer)
      .then((image: any) => {
        ctx.drawImage(image, 0, 0);
        const pngBuffer = canvas.toBuffer('image/png');

        res.statusCode = 200;
        res.setHeader('Content-Type', 'image/png');
        res.end(pngBuffer);
        return;
      })
      .catch((err) => {
        res.statusCode = 400;
        res.end('400 Invalid Request');
        console.log('Invalid request: ' + req.url + ' - ' + err);
        return;
      });
  } else {
    res.statusCode = 404;
    res.end('404 Not found');
    console.log('Invalid request: ' + req.url);
    return;
  }
});

server.listen(port, bindAddress, () => {
  console.log(
    `Try out the symbol server: http://${hostname}:${port}/FAA.svg?frameColor=purple&outline=true&outlineColor=red`
  );
});
