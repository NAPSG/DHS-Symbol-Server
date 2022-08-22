/**
 * Copyright (c) Dignitas Technologies, LLC
 *
 * This file and its contents are governed by one or more distribution and
 * copyright statements as described in the LICENSE.txt file distributed with
 * this work.
 */
let fs = require('fs');
const { emitKeypressEvents } = require('readline');
const ser = new (require('xmldom')).XMLSerializer;
const DOMImpl = new (require('xmldom')).DOMImplementation;
const DOMParser = new (require('xmldom')).DOMParser;

const { parseSVG, makeAbsolute } = require('svg-path-parser');

const filename = (process.argv[2]);
let stats = fs.lstatSync(filename);
if (stats.isFile()) {
  const svgFileIn = fs.readFileSync(filename, 'utf-8');
  const svgXml = DOMParser.parseFromString(svgFileIn);
  let paths = Array.from(svgXml.getElementsByTagName("path"));
  paths.forEach((pathElement) => {
    const dIn = pathElement.getAttribute("d");
    const dOut = cleanThePath(dIn);
    pathElement.setAttribute("d", dOut.trim());
  });

fs.writeFileSync("dude.svg", ser.serializeToString(svgXml));
}

function cleanThePath(d) {

  const commands = parseSVG(d);

  let pathEl = "";

  makeAbsolute(commands); // Note: mutates the commands in place!
  for (i = 0; i < commands.length; i++) {
    switch (commands[i].code) {
      case 'M':
        pathEl = pathEl + " M " + commands[i].x + "," + commands[i].y;
        break;
      case 'm':
        pathEl = pathEl + " m " + commands[i].x + "," + commands[i].y;
        break;
      case 'L':
        pathEl = pathEl + " L " + commands[i].x.toFixed(2) + "," + commands[i].y.toFixed(2);
        break;
      case 'l':
        pathEl = pathEl + " L " + commands[i].x.toFixed(2) + "," + commands[i].y.toFixed(2);
        break;
      case 'H':
        pathEl = pathEl + " H " + commands[i].x.toFixed(2);
        break;
      case 'h':
        pathEl = pathEl + " h " + commands[i].x.toFixed(2);
        break;
      case 'V':
        pathEl = pathEl + " V " + commands[i].y.toFixed(2);
        break;
      case 'v':
        pathEl = pathEl + " v " + commands[i].y.toFixed(2);
        break;
      case 'C':
        pathEl = pathEl + " C " + commands[i].x1.toFixed(2) + "," + commands[i].y1.toFixed(2) + ", " + commands[i].x2.toFixed(2) + "," + commands[i].y2.toFixed(2) + ", " + commands[i].x.toFixed(2) + "," + commands[i].y.toFixed(2);
        break;
      case 'c':
        pathEl = pathEl + " c " + commands[i].x1.toFixed(2) + "," + commands[i].y1.toFixed(2) + ", " + commands[i].x2.toFixed(2) + "," + commands[i].y2.toFixed(2) + ", " + commands[i].x.toFixed(2) + "," + commands[i].y.toFixed(2);
        break;
      case 'S':
        pathEl = pathEl + " S " + commands[i].x2.toFixed(2) + "," + commands[i].y2.toFixed(2) + ", " + commands[i].x.toFixed(2) + "," + commands[i].y.toFixed(2);
        break;
      case 's':
        pathEl = pathEl + " s " + commands[i].x2.toFixed(2) + "," + commands[i].y2.toFixed(2) + ", " + commands[i].x.toFixed(2) + "," + commands[i].y.toFixed(2);
        break;
      case 'Q':
        pathEl = pathEl + " Q " + commands[i].x1 + "," + commands[i].y1 + ", " + commands[i].x + "," + commands[i].y;
        break;
      case 'q':
        pathEl = pathEl + " q " + commands[i].x1 + "," + commands[i].y1 + ", " + commands[i].x + "," + commands[i].y;
        break;
      case 'T':
        pathEl = pathEl + " T " + commands[i].x + "," + commands[i].y;
        break;
      case 't':
        pathEl = pathEl + " t " + commands[i].x + "," + commands[i].y;
        break;
      case 'A':

        let rx = Math.abs(commands[i].rx);
        let ry = Math.abs(commands[i].ry);
        let xar = ((commands[i].xAxisRotation * (Math.PI / 180)) % 2) * Math.PI;
        let sweep = commands[i].sweep ? "1" : "0";
        let larc = commands[i].largeArc ? "1" : "0";
        let x = commands[i].x;
        let y = commands[i].y;

        pathEl = pathEl + " A " + rx + "," + ry + "," + xar + "," + larc + "," + sweep + "," + x + "," + y;
        break;
      case 'a':
        pathEl = pathEl + " a " + commands[i].rx.toFixed(2) + " " + commands[i].ry.toFixed(2) + "," + commands[i].xAxisRotation.toFixed(2) + "," +
          (commands[i].largeArc ? "1" : "0") + "," + (commands[i].sweep ? "1" : "0") + "," + commands[i].x.toFixed(2) + "," + commands[i].y.toFixed(2);
        break;
      case 'Z':
        pathEl = pathEl + " Z ";
        break;
      case 'z':
        pathEl = pathEl + " z ";
        break;
    }
  }

  return pathEl;
}
